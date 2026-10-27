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
    serviceArea: {
      type: String,
      default: 'Dhaka Metropolitan Area',
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'ICU',
        'ICU Ambulance',
        'Advanced Life Support (ALS)',
        'Basic Life Support (BLS)',
        'Patient Transport',
        'AC',
        'Non-AC',
        'Freezer',
        'Standard',
      ],
      default: 'ICU Ambulance',
    },
    vehicleNo: {
      type: String,
      default: '',
      trim: true,
    },
    fare: {
      type: String,
      default: '৳ 2,000',
    },
    facilities: {
      type: [String],
      default: ['Oxygen Cylinder', 'First Aid Kit', 'Standard Stretcher'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1.0,
      max: 5.0,
    },
    totalTrips: {
      type: Number,
      default: 0,
    },
    latitude: {
      type: Number,
      default: 23.7509, // Default Dhaka coordinates
    },
    longitude: {
      type: Number,
      default: 90.3705,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [90.3705, 23.7509],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Geo-spatial index for $near and $geoWithin queries
ambulanceSchema.index({ location: '2dsphere' });

// Ensure coordinates sync before save
ambulanceSchema.pre('save', function (next) {
  if (this.latitude !== undefined && this.longitude !== undefined) {
    this.location = {
      type: 'Point',
      coordinates: [Number(this.longitude), Number(this.latitude)],
    };
  }
  next();
});

module.exports = mongoose.model('Ambulance', ambulanceSchema);
