const mongoose = require('mongoose');

const ambulanceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide an ambulance name or service title'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide a contact phone number'],
      trim: true,
    },
    driverName: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please provide ambulance base/address area'],
      trim: true,
    },
    type: {
      type: String,
      default: 'ICU',
    },
    vehicleNo: {
      type: String,
      default: '',
    },
    fare: {
      type: String,
      default: '৳ 2,000',
    },
    facilities: {
      type: [String],
      default: [],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Ambulance', ambulanceSchema);
