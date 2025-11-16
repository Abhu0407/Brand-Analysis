import YouTubeAnalysis from "../models/youtube.model.js";
import { collect } from "../collectors/youtubeCollector.js";

/* -----------------------------------------------------------
   Utility function to check timeline
----------------------------------------------------------- */
function isWithinTimeline(dateString, timeline) {
  const videoDate = new Date(dateString);
  const now = new Date();

  if (timeline === "year") {
    const diffYears = (now - videoDate) / (1000 * 60 * 60 * 24 * 365);
    return diffYears <= 1;
  }

  if (timeline === "month") {
    const diffMonths = (now - videoDate) / (1000 * 60 * 60 * 24 * 30);
    return diffMonths <= 1;
  }

  return true; // default: no filter
}

/* -----------------------------------------------------------
   SAVE NEW ANALYSIS (CREATE)
----------------------------------------------------------- */
export const saveAnalysis = async (req, res) => {
  try {
    const { brand, timeline } = req.body;

    if (!brand) return res.status(400).json({ message: "Brand required" });

    // Collect fresh data from YouTube Collector
    const videos = await collect(brand, timeline);

    if (!videos.length)
      return res.status(404).json({ message: "No videos found" });

    // Save into DB
    const saved = await YouTubeAnalysis.create({
      brand,
      timeline,
      channelName: videos[0].channelName,
      channelId: videos[0].channelId,
      videos,
    });

    return res.status(201).json({
      message: "YouTube analysis saved successfully",
      data: saved,
    });
  } catch (error) {
    console.error("Save Error:", error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

/* -----------------------------------------------------------
   UPDATE ANALYSIS ACCORDING TO TIMELINE
----------------------------------------------------------- */
export const updateAnalysis = async (req, res) => {
  try {
    const { brand, timeline } = req.body;

    if (!brand) return res.status(400).json({ message: "Brand required" });

    // Step 1 → Find existing record
    const record = await YouTubeAnalysis.findOne({ brand });

    if (!record)
      return res.status(404).json({ message: "No analysis found for brand" });

    // Step 2 → Fetch latest YouTube data
    const latestVideos = await collect(brand, timeline);

    // Step 3 → DELETE old videos (outside timeline)
    record.videos = record.videos.filter((v) =>
      isWithinTimeline(v.publishedAt, timeline)
    );

    // Step 4 → ADD new videos that are not in database
    latestVideos.forEach((newVid) => {
      const exists = record.videos.some((oldVid) => oldVid.videoId === newVid.videoId);
      if (!exists) {
        record.videos.push(newVid);
      }
    });

    // Save updated record
    record.timeline = timeline;
    await record.save();

    return res.status(200).json({
      message: "Analysis updated successfully",
      data: record,
    });
  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

/* -----------------------------------------------------------
   DELETE ANALYSIS
----------------------------------------------------------- */
export const deleteAnalysis = async (req, res) => {
  try {
    const { brand } = req.body;

    if (!brand)
      return res.status(400).json({ message: "Brand required" });

    const deleted = await YouTubeAnalysis.findOneAndDelete({ brand });

    if (!deleted)
      return res.status(404).json({ message: "No record found to delete" });

    return res.status(200).json({
      message: "YouTube analysis deleted successfully",
      deleted,
    });
  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({ message: "Server Error", error });
  }
};
