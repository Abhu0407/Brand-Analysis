// const axios = require("axios");
// const fs = require("fs");

import dotenv from "dotenv";
import axios from "axios";
import Sentiment from "sentiment";
import fs from "fs";

// Simple sentiment scoring
function simpleSentiment(text) {
  const positiveWords = ["good", "great", "love", "excellent", "amazing", "happy"];
  const negativeWords = ["bad", "terrible", "hate", "poor", "worst", "sad"];

  let score = 0;
  const words = text.toLowerCase().split(/\W+/);

  for (let w of words) {
    if (positiveWords.includes(w)) score++;
    if (negativeWords.includes(w)) score--;
  }

  return score === 0 ? "neutral" : score > 0 ? "positive" : "negative";
}

// Fetch comments of a Reddit post
async function getRedditComments(permalink) {
  try {
    const url = `https://www.reddit.com${permalink}.json`;
    const response = await axios.get(url, {
      headers: { "User-Agent": "local-brand-monitor/1.0" }
    });

    const comments = response.data[1].data.children || [];
    let counts = { positive: 0, neutral: 0, negative: 0 };

    for (const c of comments) {
      if (!c.data || !c.data.body) continue;

      const senti = simpleSentiment(c.data.body);

      if (senti === "positive") counts.positive++;
      else if (senti === "negative") counts.negative++;
      else counts.neutral++;
    }

    return counts;

  } catch (e) {
    console.error("Error fetching comments:", e.message);
    return { positive: 0, neutral: 0, negative: 0 };
  }
}

function isWithinTimeline(createdUtc, timeline) {
  const postDate = new Date(createdUtc * 1000);
  const now = new Date();

  const diffMs = now - postDate;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (timeline === "year") {
    return diffDays <= 365;
  }
  if (timeline === "month") {
    return diffDays <= 30;
  }

  return true; // fallback: include everything
}

async function collect(brand, timeline = "year") {
  console.log(`🔍 Collecting Reddit posts for: ${brand} | timeline: ${timeline}`);

  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(brand)}&limit=50`;

    const response = await axios.get(url, {
      headers: { "User-Agent": "local-brand-monitor/1.0" }
    });

    const posts = response.data.data.children || [];
    let result = [];

    for (const post of posts) {
      const d = post.data;

      // timeline filtering
      if (!isWithinTimeline(d.created_utc, timeline)) {
        continue;
      }

      const text = `${d.title || ""}\n${d.selftext || ""}`;
      const senti = simpleSentiment(text);

      const commentSentiments = await getRedditComments(d.permalink);

      const item = {
        brand,
        platform: "reddit",
        author: d.author,
        title: d.title,
        content: d.selftext,
        url: `https://reddit.com${d.permalink}`,
        date: new Date(d.created_utc * 1000).toLocaleString(),
        likes: d.ups || 0,
        dislikes: 0,
        num_comments: d.num_comments || 0,
        sentiment: senti,
        commentSentiments,
        timeline: timeline
      };

      result.push(item);
    }

    fs.writeFileSync("reddit_output.json", JSON.stringify(result, null, 2));
    console.log("✅ Saved output to reddit_output.json");

    return result;

  } catch (err) {
    console.error("❌ Reddit collector error:", err.message);
    return [];
  }
}


export { collect };
