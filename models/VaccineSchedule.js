const mongoose = require('mongoose');

const vaccineScheduleSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    patientPhone: {
      type: String,
      default: '',
    },
    vaccineName: {
      type: String,
      required: true,
    },
    doseNumber: {
      type: Number,
      default: 1,
    },
    totalDoses: {
      type: Number,
      default: 1,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    completedDate: {
      type: Date,
      default: null,
    },
    centerName: {
      type: String,
      default: 'Dhaka Medical College Center',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Overdue'],
      default: 'Scheduled',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('VaccineSchedule', vaccineScheduleSchema);
