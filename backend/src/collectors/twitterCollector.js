const { TwitterApi } = require('twitter-api-v2');
const Sentiment = require('sentiment');
const Mention = require('../models/mention');
const sentiment = new Sentiment();
const client = process.env.TWITTER_BEARER_TOKEN ? new TwitterApi(process.env.TWITTER_BEARER_TOKEN) : null;

async function collect(brand){
  const collected = [];
  try{
    if(client){
      // simple recent search (note: depends on your token and elevated access)
      const q = `\"${brand}\" -is:retweet lang:en`;
      const resp = await client.v2.search(q, { max_results: 10 });
      if(resp && resp.data){
        for(const t of resp.data){
          const text = t.text;
          const s = sentiment.analyze(text);
          const m = new Mention({ brand, platform:'twitter', author:t.author_id, content:text, sentiment: s.score>0 ? 'positive' : (s.score<0 ? 'negative':'neutral'), sentimentScore: s.score });
          await m.save();
          collected.push(m);
        }
      }
    }else{
      // fallback: no client configured
    }
  }catch(e){
    console.error('twitter collector', e.message || e);
  }
  return collected;
}

module.exports = { collect };
