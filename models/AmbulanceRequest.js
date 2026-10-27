const mongoose = require('mongoose');

const ambulanceRequestSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required for ambulance request'],
    },
    patientName: {
      type: String,
      default: '',
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone number is required for dispatch communication'],
      trim: true,
    },
    ambulance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ambulance',
      default: null,
    },
    providerName: {
      type: String,
      default: '',
    },
    serviceType: {
      type: String,
      enum: [
        'Basic Life Support (BLS)',
        'Advanced Life Support (ALS)',
        'ICU Ambulance',
        'Patient Transport',
        'Standard',
      ],
      default: 'Basic Life Support (BLS)',
    },
    urgency: {
      type: String,
      enum: [
        'Immediate Critical Emergency',
        'Cardiac / Heart Attack',
        'Severe Trauma / Accident',
        'Respiratory Distress',
        'Stable Routine Transfer',
      ],
      default: 'Immediate Critical Emergency',
    },
    pickupLocation: {
      address: {
        type: String,
        required: [true, 'Pickup address is required'],
      },
      latitude: {
        type: Number,
        required: [true, 'Pickup latitude coordinate is required'],
      },
      longitude: {
        type: Number,
        required: [true, 'Pickup longitude coordinate is required'],
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
    destinationLocation: {
      hospitalName: {
        type: String,
        default: 'General Hospital',
      },
      address: {
        type: String,
        default: '',
      },
      latitude: {
        type: Number,
        default: 0,
      },
      longitude: {
        type: Number,
        default: 0,
      },
    },
    fare: {
      type: String,
      default: '৳ 2,000',
    },
    emergencyNotes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'en_route', 'arrived', 'completed', 'cancelled'],
      default: 'pending',
    },
    statusTimeline: [
      {
        status: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
          default: '',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

ambulanceRequestSchema.index({ 'pickupLocation.location': '2dsphere' });
ambulanceRequestSchema.index({ patient: 1, createdAt: -1 });
ambulanceRequestSchema.index({ status: 1 });

module.exports = mongoose.model('AmbulanceRequest', ambulanceRequestSchema);
