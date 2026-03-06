const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    minlength: [1, 'Category name must be at least 1 character'],
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  icon: {
    type: String,
    default: 'folder'
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
categorySchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
