import mongoose from "mongoose";

const RedditPostSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  platform: { type: String, default: "reddit" },

  author: { type: String },
  title: { type: String },
  content: { type: String },

  url: { type: String },

  date: { type: String }, // stored as formatted string (from your collector)
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },

  num_comments: { type: Number, default: 0 },
  sentiment: { type: String, enum: ["positive", "neutral", "negative"] },

  commentSentiments: {
    positive: { type: Number, default: 0 },
    neutral: { type: Number, default: 0 },
    negative: { type: Number, default: 0 }
  },

  timeline: { type: String, enum: ["year", "month"], default: "year" },

  createdAt: { type: Date, default: Date.now }
});

const RedditPost = mongoose.model("RedditPost", RedditPostSchema);

export default RedditPost;
