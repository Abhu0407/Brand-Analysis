// brandCollector.js
import dotenv from "dotenv";
import axios from "axios";
import Sentiment from "sentiment";

const sentiment = new Sentiment();

/*-----------------------------------------------------------
   FIND OFFICIAL CHANNEL
-----------------------------------------------------------*/
async function findOfficialChannel(brand, apiKey) {
  try {
    const params = {
      part: "snippet",
      q: brand,
      type: "channel",
      maxResults: 5,
      order: "relevance",
      key: apiKey,
    };

    const res = await axios.get("https://www.googleapis.com/youtube/v3/search", { params });
    const channels = res.data.items || [];

    if (channels.length === 0) return null;

    for (const ch of channels) {
      if (ch.snippet.title.toLowerCase().includes(brand.toLowerCase())) {
        return ch;
      }
    }

    return channels[0];
  } catch (e) {
    console.log("❌ Channel search error:", e.message);
    return null;
  }
}

/*-----------------------------------------------------------
   GET VIDEOS OF CHANNEL
-----------------------------------------------------------*/
async function fetchVideos(channelId, apiKey) {
  try {
    const params = {
      part: "snippet",
      channelId,
      type: "video",
      maxResults: 10,
      order: "date",
      key: apiKey,
    };

    const res = await axios.get("https://www.googleapis.com/youtube/v3/search", { params });
    return res.data.items || [];
  } catch (e) {
    console.log("❌ Error fetching videos:", e.message);
    return [];
  }
}

/*-----------------------------------------------------------
   GET VIDEO STATISTICS
-----------------------------------------------------------*/
async function fetchVideoStats(videoId, apiKey) {
  try {
    const params = {
      part: "snippet,statistics",
      id: videoId,
      key: apiKey,
    };

    const res = await axios.get("https://www.googleapis.com/youtube/v3/videos", { params });
    const vid = res.data.items[0];

    return {
      likeCount: vid.statistics.likeCount || 0,
      commentCount: vid.statistics.commentCount || 0,
      publishedAt: vid.snippet.publishedAt,
    };
  } catch (e) {
    console.log("❌ Video stats error:", e.message);
    return {
      likeCount: 0,
      commentCount: 0,
      publishedAt: "N/A",
    };
  }
}

/*-----------------------------------------------------------
   GET COMMENTS OF VIDEO
-----------------------------------------------------------*/
async function fetchComments(videoId, apiKey) {
  try {
    const params = {
      part: "snippet",
      videoId,
      maxResults: 50,
      textFormat: "plainText",
      key: apiKey,
    };

    const res = await axios.get("https://www.googleapis.com/youtube/v3/commentThreads", { params });
    return res.data.items || [];
  } catch (e) {
    console.log("❌ Comments error:", e.message);
    return [];
  }
}

/*-----------------------------------------------------------
   CHECK TIMELINE FILTER
-----------------------------------------------------------*/
function isWithinTimeline(dateString, timeline) {
  const videoDate = new Date(dateString);
  const now = new Date();

  if (timeline === "year") {
    const diffYears = (now - videoDate) / (1000 * 60 * 60 * 24 * 365);
    return diffYears <= 1;
  }

  if (timeline === "month") {
    const diffMonths = (now - videoDate) / (1000 * 60 * 60 * 24 * 30);
    return diffMonths <= 1;
  }

  return true; // default: no filter
}

/*-----------------------------------------------------------
   MAIN FUNCTION (WITH TIMELINE)
-----------------------------------------------------------*/
async function collect(brand, timeline = "year") {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.log("❌ Missing YOUTUBE_API_KEY in .env");
    return [];
  }

  console.log(`🔍 Finding official YouTube channel for: ${brand}`);

  const channel = await findOfficialChannel(brand, apiKey);
  if (!channel) {
    console.log("❌ No channel found for brand:", brand);
    return [];
  }

  const channelId = channel.id.channelId;
  const channelName = channel.snippet.title;

  console.log(`✔ Found Channel: ${channelName}`);

  const videos = await fetchVideos(channelId, apiKey);

  const results = [];

  for (const vid of videos) {
    const videoId = vid.id.videoId;
    const title = vid.snippet.title;

    // Fetch stats
    const stats = await fetchVideoStats(videoId, apiKey);

    // Timeline filter
    if (!isWithinTimeline(stats.publishedAt, timeline)) {
      console.log(`⏭ Skipping video (outside ${timeline} timeline): ${title}`);
      continue;
    }

    console.log(`\n🎬 Analyzing Video: ${title}`);

    // Comments
    const rawComments = await fetchComments(videoId, apiKey);

    let positive = 0,
      negative = 0,
      neutral = 0;

    const comments = rawComments.map((c) => {
      const s = c.snippet.topLevelComment.snippet;
      const text = s.textDisplay;
      const score = sentiment.analyze(text).score;

      let type = "neutral";
      if (score > 0) (type = "positive"), positive++;
      else if (score < 0) (type = "negative"), negative++;
      else neutral++;

      return {
        author: s.authorDisplayName,
        comment: text,
        publishedAt: s.publishedAt,
        likeCount: s.likeCount,
        sentimentScore: score,
        sentiment: type,
      };
    });

    results.push({
      channelName,
      channelId,
      videoTitle: title,
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      publishedAt: stats.publishedAt,
      likeCount: stats.likeCount,
      commentCount: stats.commentCount,
      extractedComments: comments.length,
      sentimentSummary: { positive, negative, neutral },
      comments,
    });
  }

  return results;
}

export { collect };
