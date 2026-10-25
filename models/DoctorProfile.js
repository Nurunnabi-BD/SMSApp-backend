const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: [true, 'Please specify specialization'],
      trim: true,
    },
    qualifications: {
      type: [String],
      default: ['MBBS'],
    },
    experienceYears: {
      type: Number,
      default: 5,
    },
    consultationFee: {
      type: Number,
      default: 50,
    },
    hospital: {
      type: String,
      default: 'Smart Central Hospital',
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 24,
    },
    patientsCount: {
      type: Number,
      default: 150,
    },
    bio: {
      type: String,
      default: 'Experienced healthcare specialist dedicated to compassionate patient care and wellness.',
    },
    availableDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    timeSlots: {
      type: [String],
      default: [
        '09:00 AM',
        '10:00 AM',
        '11:00 AM',
        '02:00 PM',
        '03:00 PM',
        '04:00 PM',
        '05:00 PM',
      ],
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    licenseNumber: {
      type: String,
      default: 'BMDC-12345',
    },
    certificateImage: {
      type: String,
      default: '',
    },
    certificateFormat: {
      type: String,
      enum: ['PNG', 'JPG', 'JPEG', ''],
      default: 'JPG',
    },
    certificateVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
