const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
const bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, problemDescription, fee } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Doctor, appointment date, and time slot are required.',
      });
    }

    // Find doctor profile
    let doctorProfile = await DoctorProfile.findOne({
      $or: [{ _id: doctorId }, { user: doctorId }],
    });

    let doctorUserId = doctorId;
    if (doctorProfile) {
      doctorUserId = doctorProfile.user;
    } else {
      doctorProfile = await DoctorProfile.findOne({ user: doctorId });
    }

    // Check doctor exists
    const doctorUser = await User.findById(doctorUserId);
    if (!doctorUser) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    // Create Appointment
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorUserId,
      doctorProfile: doctorProfile ? doctorProfile._id : null,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      problemDescription: problemDescription || 'General checkup',
      fee: fee || (doctorProfile ? doctorProfile.consultationFee : 50),
      status: 'pending',
    });

    // Create Notification for the Doctor
    await Notification.create({
      recipient: doctorUserId,
      title: 'New Appointment Request',
      message: `${req.user.name} requested an appointment for ${appointmentTime} on ${new Date(
        appointmentDate
      ).toDateString()}.`,
      type: 'appointment',
      relatedId: appointment._id,
    });

    // Create Notification for Patient
    await Notification.create({
      recipient: req.user._id,
      title: 'Appointment Request Submitted',
      message: `Your appointment request with Dr. ${doctorUser.name} is awaiting confirmation.`,
      type: 'appointment',
      relatedId: appointment._id,
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctor', 'name email phone avatar')
      .populate('doctorProfile');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      data: populatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient's appointments
// @route   GET /api/appointments/my-appointments
// @access  Private (Patient)
const getMyAppointments = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = { patient: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('doctor', 'name email phone avatar')
      .populate('doctorProfile')
      .sort({ appointmentDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor's appointment requests and schedule
// @route   GET /api/appointments/doctor-appointments
// @access  Private (Doctor / Assistant)
const getDoctorAppointments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const targetDoctorId = req.user.role === 'assistant' ? req.user.assignedDoctor : req.user._id;

    if (!targetDoctorId) {
      return res.status(400).json({
        success: false,
        message: 'No doctor assigned or doctor ID missing.',
      });
    }

    let query = { doctor: targetDoctorId };

    if (status && status !== 'all') {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone avatar bloodGroup gender dateOfBirth')
      .sort({ appointmentDate: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (accept, reject, complete)
// @route   PUT /api/appointments/:id/status
// @access  Private (Doctor / Admin / Assistant)
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, prescription, cancellationReason } = req.body;

    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('doctor', 'name email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    // Verify ownership if doctor or assistant
    if (
      req.user.role === 'doctor' &&
      appointment.doctor._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this appointment.',
      });
    }

    if (
      req.user.role === 'assistant' &&
      (!req.user.assignedDoctor || appointment.doctor._id.toString() !== req.user.assignedDoctor.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage appointments for your assigned doctor.',
      });
    }

    if (status) appointment.status = status;
    if (prescription) appointment.prescription = prescription;
    if (cancellationReason) appointment.cancellationReason = cancellationReason;

    await appointment.save();

    // Send notification to patient
    await Notification.create({
      recipient: appointment.patient._id,
      title: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your appointment with Dr. ${appointment.doctor.name} has been marked as ${status}.`,
      type: 'status_change',
      relatedId: appointment._id,
    });

    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully.`,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel appointment (by patient)
// @route   PUT /api/appointments/:id/cancel
// @access  Private (Patient)
const cancelAppointment = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment.',
      });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = reason || 'Cancelled by patient';
    await appointment.save();

    // Notify doctor
    await Notification.create({
      recipient: appointment.doctor,
      title: 'Appointment Cancelled',
      message: `${req.user.name} cancelled the appointment scheduled for ${appointment.appointmentTime}.`,
      type: 'status_change',
      relatedId: appointment._id,
    });

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully.',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
};
