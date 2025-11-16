import RedditPost from "../models/reddit.model.js";
import { collect as collectReddit } from "../collectors/redditCollector.js";

// Helper: check if a post is inside timeline
function isWithinTimeline(dateString, timeline) {
  const postDate = new Date(dateString);
  const now = new Date();

  const diffDays = (now - postDate) / (1000 * 60 * 60 * 24);

  if (timeline === "year") return diffDays <= 365;
  if (timeline === "month") return diffDays <= 30;

  return false;
}

// =========================
// UPDATE USING COLLECTOR
// =========================
export const updateRedditPosts = async (req, res) => {
  try {
    const { brand } = req.params;
    const { timeline } = req.query; // "year" or "month"

    if (!brand) return res.status(400).json({ message: "Brand required" });
    if (!timeline) return res.status(400).json({ message: "Timeline required (year/month)" });

    // 1️⃣ Collect NEW LIVE DATA from Reddit
    const scrapedData = await collectReddit(brand, timeline);

    if (!scrapedData || scrapedData.length === 0) {
      return res.status(404).json({ message: "No new data found from Reddit" });
    }

    // 2️⃣ Delete outdated data only (not all)
    let cutoffDate = new Date();
    if (timeline === "year") {
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
    } else {
      cutoffDate.setMonth(cutoffDate.getMonth() - 1);
    }

    const deletedOld = await RedditPost.deleteMany({
      brand,
      date: { $lt: cutoffDate }
    });

    // 3️⃣ Insert new valid posts (no duplicates)
    let insertedCount = 0;

    for (let post of scrapedData) {
      // skip if outside timeline
      if (!isWithinTimeline(post.date, timeline)) continue;

      // skip duplicates using URL
      const exists = await RedditPost.findOne({ url: post.url });
      if (!exists) {
        await RedditPost.create(post);
        insertedCount++;
      }
    }

    return res.status(200).json({
      message: "Reddit posts updated successfully",
      deletedOutdated: deletedOld.deletedCount,
      newInserted: insertedCount
    });

  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =========================
// SAVE MANUALLY (optional)
// =========================
export const saveRedditPosts = async (req, res) => {
  try {
    const posts = req.body;

    const { brand } = req.params;
    const { timeline } = req.query; // "year" or "month"

    if (!brand) return res.status(400).json({ message: "Brand required" });
    if (!timeline) return res.status(400).json({ message: "Timeline required (year/month)" });

    // 1️⃣ Collect NEW LIVE DATA from Reddit
    const scrapedData = await collectReddit(brand, timeline);

    if (!scrapedData || scrapedData.length === 0) {
      return res.status(404).json({ message: "No new data found from Reddit" });
    }

    for (let post of scrapedData) {
      // skip if outside timeline
      if (!isWithinTimeline(post.date, timeline)) continue;

      // skip duplicates using URL
      const exists = await RedditPost.findOne({ url: post.url });
      if (!exists) {
        await RedditPost.create(post);
        insertedCount++;
      }
    }

    // const saved = await RedditPost.insertMany(posts);
    return res.status(201).json({ message: "Saved", count: saved.length });

  } catch (err) {
    console.error("Save error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =========================
// DELETE ALL OF A BRAND
// =========================
export const deleteByBrand = async (req, res) => {
  try {
    const { brand } = req.params;
    const deleted = await RedditPost.deleteMany({ brand });

    return res.status(200).json({
      message: "Deleted brand successfully",
      deleted: deleted.deletedCount
    });

  } catch (err) {
    console.error("Delete brand error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =========================
// DELETE ONE POST
// =========================
export const deleteById = async (req, res) => {
  try {
    const deleted = await RedditPost.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Post not found" });

    res.status(200).json({ message: "Deleted successfully" });

  } catch (err) {
    console.error("Delete ID error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
