// collector.js (Fixed for ESM)
import dotenv from "dotenv";
import axios from "axios";
import Sentiment from "sentiment";
import { load } from "cheerio";   // ✅ Correct ESM import

dotenv.config();

const sentiment = new Sentiment();

const NEWS_SITES = [
  "https://www.bbc.com/news",
  "https://edition.cnn.com",
  "https://www.reuters.com",
  "https://www.hindustantimes.com",
  "https://timesofindia.indiatimes.com",
  "https://www.ndtv.com",
  "https://www.aljazeera.com",
  "https://www.theguardian.com/international",
  "https://www.cnbc.com/world/?region=world",
];

async function fetchPage(url) {
  try {
    const r = await axios.get(url, {
      timeout: 10000,
      headers: { "User-Agent": "brand-news-monitor" },
    });
    return r.data;
  } catch {
    return null;
  }
}

// Extract publish date from meta tags
function extractDate($) {
  const selectors = [
    'meta[property="article:published_time"]',
    'meta[name="pubdate"]',
    'meta[name="publish-date"]',
    'meta[name="date"]',
    'meta[itemprop="datePublished"]',
    "time[datetime]",
  ];

  for (const sel of selectors) {
    const el = $(sel).attr("content") || $(sel).attr("datetime");
    if (el && !isNaN(new Date(el))) {
      return new Date(el);
    }
  }

  return null;
}

async function collect(brand) {
  const results = [];

  console.log(`\n🔍 Searching for brand: ${brand}\n`);

  for (const site of NEWS_SITES) {
    console.log("🌐 Checking:", site);

    const html = await fetchPage(site);
    if (!html) {
      console.log("⚠️ Failed to load");
      continue;
    }

    const $ = load(html); // ✅ FIXED

    const bodyText = $("body").text().toLowerCase();

    if (!bodyText.includes(brand.toLowerCase())) {
      console.log("❌ No match");
      continue;
    }

    const date = extractDate($) || new Date();

    const text = $("body").text().trim().slice(0, 2000);
    const s = sentiment.analyze(text);

    results.push({
      site,
      brand,
      publishedAt: date.toISOString(),
      sentiment: s.score > 0 ? "positive" : s.score < 0 ? "negative" : "neutral",
      sentimentScore: s.score,
      snippet: text.substring(0, 300) + "...",
      fetchedAt: new Date().toISOString(),
    });

    console.log("✅ Added article!");
  }

  return results;
}

export { collect };
