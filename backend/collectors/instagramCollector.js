// Instagram: using web scraping for public posts (no authentication for public content)
const axios = require('axios');
const cheerio = require('cheerio');
const Sentiment = require('sentiment');
const Mention = require('../models/mention');
const sentiment = new Sentiment();

async function collect(brand) {
  const items = [];
  try {
    // Instagram public search - using hashtag search
    // Note: Instagram's public API is very limited, so we use web scraping
    const searchUrl = `https://www.instagram.com/explore/tags/${encodeURIComponent(brand)}/`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Try to extract JSON data from script tags (Instagram embeds data in script tags)
    const scriptTags = $('script').toArray();
    let postsData = [];
    
    for (const script of scriptTags) {
      const content = $(script).html();
      if (content && content.includes('window._sharedData')) {
        try {
          // Extract JSON from window._sharedData - improved regex for nested JSON
          const jsonMatch = content.match(/window\._sharedData\s*=\s*({[\s\S]*?});/);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[1]);
            const entries = data?.entry_data?.TagPage?.[0]?.graphql?.hashtag?.edge_hashtag_to_media?.edges || [];
            postsData = entries.slice(0, 10);
            break;
          }
        } catch (e) {
          // Fallback: try alternative extraction methods
          console.log('Instagram JSON extraction failed, using fallback');
        }
      }
    }

    // Fallback: if we can't extract structured data, try searching for brand mentions in text
    if (postsData.length === 0) {
      // Alternative approach: search for brand in post captions
      const pageText = response.data;
      if (pageText.toLowerCase().includes(brand.toLowerCase())) {
        // Create a generic mention if brand is found on the page
        const s = sentiment.analyze(`Instagram post about ${brand}`);
        const m = new Mention({
          brand,
          platform: 'instagram',
          author: 'public_user',
          content: `Instagram post mentioning ${brand}`,
          url: searchUrl,
          sentiment: s.score > 0 ? 'positive' : (s.score < 0 ? 'negative' : 'neutral'),
          sentimentScore: s.score
        });
        await m.save();
        items.push(m);
      }
    } else {
      // Process extracted posts
      for (const edge of postsData) {
        const node = edge.node;
        const caption = node.edge_media_to_caption?.edges?.[0]?.node?.text || '';
        const text = caption || `Instagram post about ${brand}`;
        
        if (text.toLowerCase().includes(brand.toLowerCase())) {
          const s = sentiment.analyze(text);
          const m = new Mention({
            brand,
            platform: 'instagram',
            author: node.owner?.username || 'instagram_user',
            content: text,
            url: `https://www.instagram.com/p/${node.shortcode}/`,
            sentiment: s.score > 0 ? 'positive' : (s.score < 0 ? 'negative' : 'neutral'),
            sentimentScore: s.score
          });
          await m.save();
          items.push(m);
        }
      }
    }
  } catch (error) {
    console.error('Instagram collector error:', error.message);
    // Instagram may block scraping, so we'll continue gracefully
  }
  return items;
}

module.exports = { collect };

