// YouTube: using YouTube Data API v3 (requires API key)
const axios = require('axios');
const Sentiment = require('sentiment');
const Mention = require('../models/mention');
const sentiment = new Sentiment();

async function collect(brand) {
  const items = [];
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.log('YouTube API key not configured. Set YOUTUBE_API_KEY environment variable.');
      return items;
    }

    // Search YouTube for videos mentioning the brand
    const url = 'https://www.googleapis.com/youtube/v3/search';
    const params = {
      part: 'snippet',
      q: brand,
      type: 'video',
      maxResults: 10,
      order: 'relevance',
      key: apiKey
    };

    const response = await axios.get(url, { params });
    const videos = response.data.items || [];

    for (const video of videos) {
      const snippet = video.snippet;
      const text = (snippet.title || '') + '\n' + (snippet.description || '');
      const s = sentiment.analyze(text);
      
      const m = new Mention({
        brand,
        platform: 'youtube',
        author: snippet.channelTitle,
        content: text,
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        sentiment: s.score > 0 ? 'positive' : (s.score < 0 ? 'negative' : 'neutral'),
        sentimentScore: s.score
      });
      await m.save();
      items.push(m);
    }
  } catch (error) {
    console.error('YouTube collector error:', error.message);
  }
  return items;
}

module.exports = { collect };

