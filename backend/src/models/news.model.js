import mongoose from "mongoose";

const newsMentionSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
    },

    site: {
      type: String,
      required: true,
    },

    publishedAt: {
      type: Date,
      required: false,    // some news pages may not have a date
    },

    snippet: {
      type: String,
      required: true,
    },

    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      required: true,
    },

    sentimentScore: {
      type: Number,
      required: true,
    },

    fetchedAt: {
      type: Date,
      default: Date.now,
    },

    timeline: {
      type: String,
      enum: ["month", "year"],
      required: true,
    }
  },
  { timestamps: true }
);

const NewsMention = mongoose.model("NewsMention", newsMentionSchema);
export default NewsMention;
