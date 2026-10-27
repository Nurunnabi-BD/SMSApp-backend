const mongoose = require('mongoose');

const vaccineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vaccine name is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    targetGroup: {
      type: String,
      required: [true, 'Target group is required'],
      trim: true,
    },
    category: {
      type: String,
      default: 'Recommended',
      trim: true,
    },
    doses: {
      type: Number,
      default: 1,
    },
    scheduleInterval: {
      type: String,
      default: 'Single dose',
    },
    sideEffects: {
      type: [String],
      default: ['Mild fever', 'Soreness at injection site'],
    },
    precautions: {
      type: String,
      default: 'Consult doctor if allergic or experiencing high fever.',
    },
    price: {
      type: String,
      default: 'Free',
    },
    iconType: {
      type: String,
      enum: ['baby', 'syringe', 'girl', 'elderly', 'shield', 'vaccine'],
      default: 'syringe',
    },
    color: {
      type: String,
      default: '#10B981',
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Vaccine', vaccineSchema);
