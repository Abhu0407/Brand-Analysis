// Lightweight in-process scheduler for demo purposes.
const twitter = require('./twitterCollector');
const reddit = require('./redditCollector');
const rss = require('./rssCollector');
const web = require('./webCollector');
const youtube = require('./youtubeCollector');
const instagram = require('./instagramCollector');
const linkedin = require('./linkedinCollector');
const Mention = require('../models/mention');

const INTERVAL = 60 * 1000 * 2; // 2 minutes

const running = {};

function start(io){
  // start default nothing; wait for API control or start all example
  console.log('Collector manager ready');
  // Store io instance for potential real-time updates
  if(io) {
    global.collectorIO = io;
  }
}

function startBrand(brand){
  if(running[brand]) {
    console.log(`Collectors already running for ${brand}`);
    return false;
  }
  console.log('Starting collectors for', brand);
  running[brand] = {
    interval: setInterval(async ()=> {
      try{
        console.log(`Collecting data for ${brand}...`);
        const tweets = await twitter.collect(brand);
        const r = await reddit.collect(brand);
        const f = await rss.collect(brand);
        const w = await web.collect(brand);
        const yt = await youtube.collect(brand);
        const ig = await instagram.collect(brand);
        const li = await linkedin.collect(brand);
        
        const total = tweets.length + r.length + f.length + w.length + yt.length + ig.length + li.length;
        console.log(`Collected ${total} mentions for ${brand}`);
        
        // Emit real-time update if socket.io is available
        if(global.collectorIO) {
          global.collectorIO.emit('mentions-updated', { brand, count: total });
        }
      }catch(e){
        console.error('collector error for', brand, e.message || e);
      }
    }, INTERVAL),
    startedAt: new Date()
  };
  return true;
}

function stopBrand(brand){
  if(running[brand]){
    clearInterval(running[brand].interval);
    delete running[brand];
    console.log(`Stopped collectors for ${brand}`);
    return true;
  }
  return false;
}

function getStatus(){
  return {
    running: Object.keys(running).map(brand => ({
      brand,
      startedAt: running[brand].startedAt
    })),
    interval: INTERVAL / 1000 // in seconds
  };
}

function isRunning(brand){
  return !!running[brand];
}

module.exports = { start, startBrand, stopBrand, getStatus, isRunning };
