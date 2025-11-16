const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MentionSchema = new Schema({
  brand: { type: String, index: true },
  platform: String,
  author: String,
  content: String,
  url: String,
  createdAt: { type: Date, default: Date.now },
  sentiment: String,
  sentimentScore: Number,
  topics: [String],
});

module.exports = mongoose.model('Mention', MentionSchema);
