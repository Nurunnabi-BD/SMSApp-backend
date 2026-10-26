const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    lastMessageSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    unreadCountPatient: {
      type: Number,
      default: 0,
    },
    unreadCountDoctor: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index to ensure one conversation per patient-doctor pair
conversationSchema.index({ patient: 1, doctor: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);
