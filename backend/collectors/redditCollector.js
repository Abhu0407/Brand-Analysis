// Reddit: using public search API (no authentication needed)
const axios = require('axios');
const Sentiment = require('sentiment');
const Mention = require('../models/mention');
const sentiment = new Sentiment();

async function collect(brand) {
  const items = [];
  try {
    // Search Reddit via public API endpoint (no OAuth required)
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(brand)}&limit=10`;
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'brand-monitor-bot/1.0' }
    });

    const posts = response.data.data.children || [];
    for (const post of posts) {
      const d = post.data;
      const text = (d.title || '') + '\n' + (d.selftext || '');
      const s = sentiment.analyze(text);
      const m = new Mention({
        brand,
        platform: 'reddit',
        author: d.author,
        content: text,
        url: `https://reddit.com${d.permalink}`,
        sentiment: s.score > 0 ? 'positive' : (s.score < 0 ? 'negative' : 'neutral'),
        sentimentScore: s.score
      });
      await m.save();
      items.push(m);
    }
  } catch (error) {
    console.error('Reddit collector error:', error.message);
  }
  return items;
}

module.exports = { collect };
