const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get patient dashboard summary
// @route   GET /api/patients/dashboard
// @access  Private (Patient only)
const getPatientDashboard = async (req, res, next) => {
  try {
    const patientId = req.user._id;

    // Upcoming next appointment
    const upcomingAppointment = await Appointment.findOne({
      patient: patientId,
      status: { $in: ['pending', 'confirmed'] },
      appointmentDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    })
      .populate('doctor', 'name email phone avatar')
      .populate('doctorProfile')
      .sort({ appointmentDate: 1 });

    // Recent top doctors
    const topDoctors = await DoctorProfile.find({ isApproved: true })
      .populate('user', 'name avatar')
      .sort({ rating: -1 })
      .limit(6);

    // Unread notifications count
    const unreadNotificationsCount = await Notification.countDocuments({
      recipient: patientId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: {
        upcomingAppointment,
        topDoctors,
        unreadNotificationsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient notifications
// @route   GET /api/patients/notifications
// @access  Private (Patient/User)
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatientDashboard,
  getNotifications,
};
