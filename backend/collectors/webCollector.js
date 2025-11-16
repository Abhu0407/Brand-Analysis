const axios = require('axios');
const cheerio = require('cheerio');
const Sentiment = require('sentiment');
const Mention = require('../models/mention');
const sentiment = new Sentiment();

async function collect(brand, urls = []){
  const items = [];
  try{
    for(const u of urls){
      try{
        const r = await axios.get(u, { timeout: 8000, headers: { 'User-Agent': 'brand-monitor-bot' }});
        const $ = cheerio.load(r.data);
        const text = $('body').text();
        if(text.toLowerCase().includes(brand.toLowerCase())){
          const snippet = text.trim().slice(0,3000);
          const s = sentiment.analyze(snippet);
          const m = new Mention({ brand, platform:'web', content: snippet, url: u, sentiment: s.score>0 ? 'positive' : (s.score<0 ? 'negative':'neutral'), sentimentScore: s.score });
          await m.save();
          items.push(m);
        }
      }catch(e){ continue; }
    }
  }catch(e){ console.error('web collector', e); }
  return items;
}

module.exports = { collect };
