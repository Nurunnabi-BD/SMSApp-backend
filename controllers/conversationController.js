const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');

// @desc    Get all conversations for authenticated user (patient or doctor)
// @route   GET /api/conversations
// @access  Private
const getUserConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const isPatient = req.user.role === 'patient';

    const conversations = await Conversation.find({
      $or: [{ patient: userId }, { doctor: userId }],
    })
      .populate('patient', 'name email phone avatar')
      .populate('doctor', 'name email phone avatar')
      .sort({ lastMessageAt: -1 });

    let totalUnread = 0;
    const formatted = conversations.map(c => {
      const convObj = c.toObject();
      const myUnread = isPatient
        ? (c.unreadCountPatient || 0)
        : (c.unreadCountDoctor || 0);
      convObj.myUnreadCount = myUnread;
      totalUnread += myUnread;
      return convObj;
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      totalUnread,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get or create a conversation between patient and approved doctor
// @route   POST /api/conversations
// @access  Private
const getOrCreateConversation = async (req, res, next) => {
  try {
    const { doctorId, patientId } = req.body;
    let targetDoctorId = doctorId;
    let targetPatientId = patientId;

    if (req.user.role === 'patient') {
      targetPatientId = req.user._id;
      if (!targetDoctorId) {
        return res.status(400).json({
          success: false,
          message: 'Please provide doctorId to start a conversation.',
        });
      }
    } else if (req.user.role === 'doctor') {
      targetDoctorId = req.user._id;
      if (!targetPatientId) {
        return res.status(400).json({
          success: false,
          message: 'Please provide patientId to start a conversation.',
        });
      }
    }

    // Verify doctor is approved
    const doctorProfile = await DoctorProfile.findOne({
      $or: [{ user: targetDoctorId }, { _id: targetDoctorId }],
    });

    if (!doctorProfile || !doctorProfile.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'This doctor is not yet verified or approved by administration for messaging.',
      });
    }

    // Actual user ID for doctor
    const actualDoctorUserId = doctorProfile.user;

    // Find or create conversation
    let conversation = await Conversation.findOne({
      patient: targetPatientId,
      doctor: actualDoctorUserId,
    })
      .populate('patient', 'name email phone avatar')
      .populate('doctor', 'name email phone avatar');

    if (!conversation) {
      conversation = await Conversation.create({
        patient: targetPatientId,
        doctor: actualDoctorUserId,
        lastMessage: 'Conversation started',
        lastMessageAt: new Date(),
        lastMessageSender: req.user._id,
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('patient', 'name email phone avatar')
        .populate('doctor', 'name email phone avatar');
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/conversations/:id/messages
// @access  Private
const getConversationMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
      });
    }

    // Verify user is a participant
    const isParticipant =
      conversation.patient.toString() === req.user._id.toString() ||
      conversation.doctor.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this conversation.',
      });
    }

    // Mark unread messages as read
    await Message.updateMany(
      {
        conversation: conversation._id,
        receiver: req.user._id,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    // Reset unread count for current user
    if (req.user.role === 'patient') {
      conversation.unreadCountPatient = 0;
    } else {
      conversation.unreadCountDoctor = 0;
    }
    await conversation.save();

    const messages = await Message.find({ conversation: conversation._id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message in a conversation
// @route   POST /api/conversations/:id/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { messageText, messageType = 'text', fileUrl = '' } = req.body;

    if (!messageText || messageText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message text cannot be empty.',
      });
    }

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
      });
    }

    // Verify user is participant
    const isPatient = conversation.patient.toString() === req.user._id.toString();
    const isDoctor = conversation.doctor.toString() === req.user._id.toString();

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to send messages in this conversation.',
      });
    }

    // If doctor, verify approved
    if (isDoctor) {
      const docProf = await DoctorProfile.findOne({ user: req.user._id });
      if (!docProf || !docProf.isApproved) {
        return res.status(403).json({
          success: false,
          message: 'Unapproved doctor accounts cannot participate in chat.',
        });
      }
    }

    const receiverId = isPatient ? conversation.doctor : conversation.patient;

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      receiver: receiverId,
      messageText: messageText.trim(),
      messageType,
      fileUrl,
      isRead: false,
    });

    // Update conversation metadata
    conversation.lastMessage = messageText.trim();
    conversation.lastMessageAt = new Date();
    conversation.lastMessageSender = req.user._id;

    if (isPatient) {
      conversation.unreadCountDoctor = (conversation.unreadCountDoctor || 0) + 1;
    } else {
      conversation.unreadCountPatient = (conversation.unreadCountPatient || 0) + 1;
    }
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate('sender', 'name avatar');

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserConversations,
  getOrCreateConversation,
  getConversationMessages,
  sendMessage,
};
