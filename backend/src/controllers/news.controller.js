// backend/src/controllers/news.controller.js

import NewsMention from "../models/news.model.js";
import { collect } from "../collectors/newsCollector.js";

// -----------------------------------------
// SAVE NEWS DATA MANUALLY
// -----------------------------------------
export const saveNews = async (req, res) => {
  try {
    const data = req.body; // brand, site, sentiment, etc.

    const mention = new NewsMention(data);
    await mention.save();

    return res.status(201).json({
      success: true,
      message: "News saved successfully",
      data: mention,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// -----------------------------------------
// DELETE NEWS BY ID
// -----------------------------------------
export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    await NewsMention.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "News deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// -----------------------------------------
// UPDATE NEWS BASED ON TIMELINE
// -----------------------------------------
// timeline = "year" → keep only last 1 year
// timeline = "month" → keep only last 1 month
// Also fetch fresh data and insert only new ones.
// -----------------------------------------

export const updateNews = async (req, res) => {
  try {
    const { brand } = req.body;

    if (!brand) {
      return res.status(400).json({
        success: false,
        message: "brand is required",
      });
    }

    // -----------------------------------------
    // 1. Fetch new fresh news from scraper
    // -----------------------------------------
    const newNews = await collect(brand);

    console.log("🔍 Fresh data collected:", newNews.length);

    let addedCount = 0;

    // -----------------------------------------
    // 2. Add only new unique results
    // -----------------------------------------
    for (const item of newNews) {
      const exists = await NewsMention.findOne({
        brand: item.brand,
        site: item.site,
        publishedAt: item.publishedAt,
      });

      if (!exists) {
        await NewsMention.create(item);
        addedCount++;
      }
    }

    res.json({
      success: true,
      message: "News updated successfully",
      added: addedCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
