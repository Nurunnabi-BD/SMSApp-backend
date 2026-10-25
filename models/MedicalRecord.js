const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    doctorName: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['prescription', 'report'],
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide record title or report name'],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    hospital: {
      type: String,
      default: 'Smart Central Hospital',
    },
    diagnosis: {
      type: String,
      default: '',
    },
    medications: [
      {
        name: String,
        dosage: String,
        frequency: String,
        duration: String,
      },
    ],
    fileUrl: {
      type: String,
      default: '',
    },
    fileFormat: {
      type: String,
      default: 'PDF',
    },
    fileSizeMb: {
      type: Number,
      default: 1.2,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
