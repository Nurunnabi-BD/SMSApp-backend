const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    recordNumber: {
      type: Number,
      default: 0,
    },
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
      index: true,
    },
    genericName: {
      type: String,
      required: [true, 'Generic name is required'],
      trim: true,
      index: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    medicineGroup: {
      type: String,
      required: [true, 'Medicine group is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
      default: 10.0,
    },
    packSize: {
      type: String,
      default: "1 Strip (10's)",
      trim: true,
    },
    form: {
      type: String,
      enum: ['Tablet', 'Capsule', 'Syrup', 'Suspension', 'Injection', 'Inhaler', 'Drops', 'Gel', 'Ointment', 'Other'],
      default: 'Tablet',
      index: true,
    },
    strength: {
      type: String,
      default: '',
      trim: true,
    },
    usedFor: {
      type: String,
      default: '',
      trim: true,
    },
    prescriptionRequired: {
      type: Boolean,
      default: true,
    },
    precautions: {
      type: String,
      default: '',
      trim: true,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
medicineSchema.index({
  name: 'text',
  genericName: 'text',
  companyName: 'text',
  medicineGroup: 'text',
  usedFor: 'text',
});

module.exports = mongoose.model('Medicine', medicineSchema);
