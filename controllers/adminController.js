const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');

// @desc    Get admin platform analytics & statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getAdminStats = async (req, res, next) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const pendingDoctors = await DoctorProfile.countDocuments({ isApproved: false });
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });

    // Revenue calculation
    const revenueResult = await Appointment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$fee' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        pendingDoctors,
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all doctors for admin management (including pending approvals)
// @route   GET /api/admin/doctors
// @access  Private (Admin only)
const getAllDoctorsAdmin = async (req, res, next) => {
  try {
    const doctors = await DoctorProfile.find()
      .populate('user', 'name email phone avatar address createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject doctor profile
// @route   PUT /api/admin/doctors/:id/approval
// @access  Private (Admin only)
const setDoctorApproval = async (req, res, next) => {
  try {
    const { isApproved } = req.body;

    const doctorProfile = await DoctorProfile.findById(req.params.id).populate('user', 'name email');

    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found.',
      });
    }

    doctorProfile.isApproved = isApproved;
    await doctorProfile.save();

    res.status(200).json({
      success: true,
      message: `Doctor ${doctorProfile.user?.name || ''} has been ${
        isApproved ? 'approved' : 'suspended/rejected'
      }.`,
      data: doctorProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all patients
// @route   GET /api/admin/patients
// @access  Private (Admin only)
const getAllPatients = async (req, res, next) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllDoctorsAdmin,
  setDoctorApproval,
  getAllPatients,
};
