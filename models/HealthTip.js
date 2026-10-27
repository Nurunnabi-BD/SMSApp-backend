const mongoose = require('mongoose');

const healthTipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Health tip title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Nutrition', 'Fitness', 'Mental Health', 'Sleep', 'General'],
      default: 'Nutrition',
      index: true,
    },
    image: {
      type: String,
      default: '',
    },
    iconType: {
      type: String,
      default: 'leaf',
    },
    readTime: {
      type: String,
      default: '2 min read',
    },
    benefits: {
      type: [String],
      default: [],
    },
    author: {
      type: String,
      default: 'Medical Health Board',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('HealthTip', healthTipSchema);
