const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');

// @desc    Get all active & approved doctors with filtering & search
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res, next) => {
  try {
    const { specialization, search, sort } = req.query;

    let query = { isApproved: true };

    if (specialization && specialization !== 'All') {
      query.specialization = new RegExp(specialization, 'i');
    }

    let doctorProfiles = await DoctorProfile.find(query).populate({
      path: 'user',
      select: 'name email phone avatar address gender',
    });

    // Filter by name / hospital / search keyword if provided
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      doctorProfiles = doctorProfiles.filter(
        (doc) =>
          (doc.user && searchRegex.test(doc.user.name)) ||
          searchRegex.test(doc.specialization) ||
          searchRegex.test(doc.hospital)
      );
    }

    // Sort options (e.g. rating, experience, fee)
    if (sort === 'rating') {
      doctorProfiles.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'experience') {
      doctorProfiles.sort((a, b) => b.experienceYears - a.experienceYears);
    } else if (sort === 'fee_low') {
      doctorProfiles.sort((a, b) => a.consultationFee - b.consultationFee);
    }

    res.status(200).json({
      success: true,
      count: doctorProfiles.length,
      data: doctorProfiles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res, next) => {
  try {
    const doctorProfile = await DoctorProfile.findOne({
      $or: [{ _id: req.params.id }, { user: req.params.id }],
    }).populate({
      path: 'user',
      select: 'name email phone avatar address gender',
    });

    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: doctorProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all available specializations with count
// @route   GET /api/doctors/specializations
// @access  Public
const getSpecializations = async (req, res, next) => {
  try {
    const specializations = await DoctorProfile.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: '$specialization', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const formatted = specializations.map((item) => ({
      name: item._id,
      count: item.count,
    }));

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Doctor Profile & Schedule (for Doctor)
// @route   PUT /api/doctors/profile
// @access  Private (Doctor only)
const updateDoctorProfile = async (req, res, next) => {
  try {
    const {
      specialization,
      qualifications,
      experienceYears,
      consultationFee,
      hospital,
      bio,
      availableDays,
      timeSlots,
    } = req.body;

    let doctorProfile = await DoctorProfile.findOne({ user: req.user._id });

    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found for this account.',
      });
    }

    if (specialization) doctorProfile.specialization = specialization;
    if (qualifications) doctorProfile.qualifications = qualifications;
    if (experienceYears !== undefined) doctorProfile.experienceYears = experienceYears;
    if (consultationFee !== undefined) doctorProfile.consultationFee = consultationFee;
    if (hospital) doctorProfile.hospital = hospital;
    if (bio) doctorProfile.bio = bio;
    if (availableDays) doctorProfile.availableDays = availableDays;
    if (timeSlots) doctorProfile.timeSlots = timeSlots;

    await doctorProfile.save();

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: doctorProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient registry for the logged in doctor
// @route   GET /api/doctors/patient-registry
// @access  Private (Doctor only)
const getDoctorPatientRegistry = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate('patient', 'name email phone avatar bloodGroup gender dateOfBirth address')
      .sort({ appointmentDate: -1 });

    // Deduplicate patients
    const patientMap = new Map();
    appointments.forEach((app) => {
      if (app.patient && !patientMap.has(app.patient._id.toString())) {
        patientMap.set(app.patient._id.toString(), {
          patient: app.patient,
          lastAppointmentDate: app.appointmentDate,
          lastStatus: app.status,
          totalVisits: appointments.filter(
            (a) => a.patient && a.patient._id.toString() === app.patient._id.toString()
          ).length,
        });
      }
    });

    const patientList = Array.from(patientMap.values());

    res.status(200).json({
      success: true,
      count: patientList.length,
      data: patientList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Doctor creates an assistant account
// @route   POST /api/doctors/assistants
// @access  Private (Doctor only)
const createAssistant = async (req, res, next) => {
  try {
    const { name, email, password, phone, chamberLocation } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required for assistant.',
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const assistant = await User.create({
      name,
      email,
      password,
      role: 'assistant',
      phone: phone || '',
      chamberLocation: chamberLocation || '',
      assignedDoctor: req.user._id,
      isVerified: true,
    });

    res.status(201).json({
      success: true,
      message: 'Assistant account created successfully.',
      data: {
        _id: assistant._id,
        name: assistant.name,
        email: assistant.email,
        phone: assistant.phone,
        role: assistant.role,
        chamberLocation: assistant.chamberLocation,
        assignedDoctor: assistant.assignedDoctor,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all assistants created by the logged in doctor
// @route   GET /api/doctors/assistants
// @access  Private (Doctor only)
const getDoctorAssistants = async (req, res, next) => {
  try {
    const assistants = await User.find({
      role: 'assistant',
      assignedDoctor: req.user._id,
    }).select('-password');

    res.status(200).json({
      success: true,
      count: assistants.length,
      data: assistants,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an assistant
// @route   DELETE /api/doctors/assistants/:id
// @access  Private (Doctor only)
const deleteAssistant = async (req, res, next) => {
  try {
    const assistant = await User.findOneAndDelete({
      _id: req.params.id,
      role: 'assistant',
      assignedDoctor: req.user._id,
    });

    if (!assistant) {
      return res.status(404).json({
        success: false,
        message: 'Assistant not found or not assigned to you.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Assistant deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assistant views assigned doctor profile (read-only)
// @route   GET /api/doctors/assigned-doctor
// @access  Private (Assistant only)
const getAssignedDoctor = async (req, res, next) => {
  try {
    if (!req.user.assignedDoctor) {
      return res.status(404).json({
        success: false,
        message: 'No doctor assigned to this assistant account.',
      });
    }

    const doctorUser = await User.findById(req.user.assignedDoctor).select('name email phone avatar address');
    const doctorProfile = await DoctorProfile.findOne({ user: req.user.assignedDoctor });

    res.status(200).json({
      success: true,
      data: {
        doctor: doctorUser,
        profile: doctorProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  getSpecializations,
  updateDoctorProfile,
  getDoctorPatientRegistry,
  createAssistant,
  getDoctorAssistants,
  deleteAssistant,
  getAssignedDoctor,
};
