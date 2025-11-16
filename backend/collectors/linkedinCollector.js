// LinkedIn: using web scraping for public posts (no authentication for public content)
const axios = require('axios');
const cheerio = require('cheerio');
const Sentiment = require('sentiment');
const Mention = require('../models/mention');
const sentiment = new Sentiment();

async function collect(brand) {
  const items = [];
  try {
    // LinkedIn public search - search for posts mentioning the brand
    // Note: LinkedIn's public API is limited, so we use web scraping
    const searchUrl = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(brand)}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });

    const $ = cheerio.load(response.data);
    
    // LinkedIn structures content in specific divs/classes
    // Look for post content in common LinkedIn post containers
    const posts = $('.feed-shared-update-v2, .update-components-text, [data-test-id="main-feed-activity-card"]').slice(0, 10);
    
    if (posts.length > 0) {
      for (let i = 0; i < posts.length; i++) {
        const $post = $(posts[i]);
        const text = $post.find('.feed-shared-text, .update-components-text__text-view, .feed-shared-inline-show-more-text').text().trim() || 
                     $post.text().trim();
        
        if (text.toLowerCase().includes(brand.toLowerCase()) && text.length > 10) {
          const author = $post.find('.feed-shared-actor__name, .update-components-actor__name').text().trim() || 'linkedin_user';
          const postLink = $post.find('a[href*="/feed/update"]').attr('href') || searchUrl;
          const fullUrl = postLink.startsWith('http') ? postLink : `https://www.linkedin.com${postLink}`;
          
          const s = sentiment.analyze(text);
          const m = new Mention({
            brand,
            platform: 'linkedin',
            author: author,
            content: text,
            url: fullUrl,
            sentiment: s.score > 0 ? 'positive' : (s.score < 0 ? 'negative' : 'neutral'),
            sentimentScore: s.score
          });
          
          await m.save();
          items.push(m);
        }
      }
    } else {
      // Fallback: if structured scraping fails, check if brand is mentioned anywhere on the page
      const pageText = response.data;
      if (pageText.toLowerCase().includes(brand.toLowerCase())) {
        const s = sentiment.analyze(`LinkedIn post about ${brand}`);
        const m = new Mention({
          brand,
          platform: 'linkedin',
          author: 'linkedin_user',
          content: `LinkedIn post mentioning ${brand}`,
          url: searchUrl,
          sentiment: s.score > 0 ? 'positive' : (s.score < 0 ? 'negative' : 'neutral'),
          sentimentScore: s.score
        });
        await m.save();
        items.push(m);
      }
    }
  } catch (error) {
    console.error('LinkedIn collector error:', error.message);
    // LinkedIn may require authentication or block scraping, so we'll continue gracefully
  }
  return items;
}

module.exports = { collect };

