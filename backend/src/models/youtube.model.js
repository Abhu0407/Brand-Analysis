import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  videoId: String,
  videoTitle: String,
  url: String,
  publishedAt: Date,
  likeCount: Number,
  commentCount: Number,
  extractedComments: Number,

  sentimentSummary: {
    positive: Number,
    negative: Number,
    neutral: Number,
  },

});

const youtubeAnalysisSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true },

    timeline: {
      type: String,
      enum: ["year", "month", "all"],
      default: "all",
    },

    channelName: String,
    channelId: String,

    videos: [videoSchema],
  },
  { timestamps: true }
);

const YouTubeAnalysis = mongoose.model("YouTubeAnalysis", youtubeAnalysisSchema);

export default YouTubeAnalysis;
