const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Bookmark title is required'],
    trim: true,
    minlength: [1, 'Title must be at least 1 character'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  url: {
    type: String,
    required: [true, 'URL is required'],
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL starting with http:// or https://']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  favicon: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes for efficient queries
bookmarkSchema.index({ userId: 1, categoryId: 1 });
bookmarkSchema.index({ userId: 1, title: 'text', url: 'text', description: 'text' });

// Auto-generate favicon URL before saving
bookmarkSchema.pre('save', function(next) {
  if (this.url && !this.favicon) {
    try {
      const domain = new URL(this.url).hostname;
      this.favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (err) {
      this.favicon = '';
    }
  }
  next();
});

module.exports = mongoose.model('Bookmark', bookmarkSchema);
