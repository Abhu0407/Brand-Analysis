const Parser = require('rss-parser');
const Sentiment = require('sentiment');
const Mention = require('../models/mention');
const parser = new Parser();
const sentiment = new Sentiment();

const defaultFeeds = [
  'https://rss.cnn.com/rss/edition.rss',
  'https://feeds.bbci.co.uk/news/rss.xml'
];

async function collect(brand, feeds = defaultFeeds){
  const items = [];
  try{
    for(const f of feeds){
      const feed = await parser.parseURL(f);
      for(const entry of feed.items.slice(0,10)){
        const txt = (entry.title||'') + '\n' + (entry.contentSnippet||'') + '\n' + (entry.content||'');
        if(txt.toLowerCase().includes(brand.toLowerCase())){
          const s = sentiment.analyze(txt);
          const m = new Mention({ brand, platform:'news', author: entry.author, content: txt, url: entry.link, sentiment: s.score>0 ? 'positive' : (s.score<0 ? 'negative':'neutral'), sentimentScore: s.score });
          await m.save();
          items.push(m);
        }
      }
    }
  }catch(e){
    console.error('rss collector', e.message || e);
  }
  return items;
}

module.exports = { collect };
