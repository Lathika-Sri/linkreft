const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  ip: { type: String, default: 'unknown' },
  country: { type: String, default: 'Unknown' },
  city: { type: String, default: 'Unknown' },
  device: { type: String, default: 'Unknown' },
  browser: { type: String, default: 'Unknown' },
  os: { type: String, default: 'Unknown' },
  referrer: { type: String, default: 'Direct' },
  userAgent: { type: String, default: '' },
});

const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: [3, 'Short code must be at least 3 characters'],
      maxlength: [20, 'Short code cannot exceed 20 characters'],
      match: [/^[a-zA-Z0-9_-]+$/, 'Short code can only contain letters, numbers, hyphens, and underscores'],
    },
    customAlias: {
      type: String,
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: '',
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    clicks: {
      type: Number,
      default: 0,
    },
    visits: {
      type: [visitSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Virtual for short URL
urlSchema.virtual('shortUrl').get(function () {
  return `${process.env.BASE_URL}/${this.shortCode}`;
});

urlSchema.set('toJSON', { virtuals: true });

// Index for fast lookups
urlSchema.index({ shortCode: 1 });
urlSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Url', urlSchema);