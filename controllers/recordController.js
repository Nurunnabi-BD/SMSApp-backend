const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');

// @desc    Get all prescriptions & reports of currently logged in patient
// @route   GET /api/records/my-records
// @access  Private (Patient)
const getMyRecords = async (req, res, next) => {
  try {
    const records = await MedicalRecord.find({ patient: req.user._id })
      .populate('doctor', 'name email phone avatar')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Doctor views patient reports & prescriptions (ONLY IF patient booked appointment with doctor)
// @route   GET /api/records/patient/:patientId
// @access  Private (Doctor)
const getPatientRecordsForDoctor = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const patientId = req.params.patientId;

    // Check if appointment exists between this doctor and this patient
    const hasAppointment = await Appointment.findOne({
      doctor: doctorId,
      patient: patientId,
    });

    if (!hasAppointment && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access restricted: You can only view prescriptions and reports for patients who have booked an appointment with you.',
      });
    }

    const records = await MedicalRecord.find({ patient: patientId })
      .populate('doctor', 'name email specialization')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create/Upload a new prescription or diagnostic report
// @route   POST /api/records
// @access  Private (Doctor, Patient, Admin)
const addRecord = async (req, res, next) => {
  try {
    const {
      patientId,
      type,
      title,
      hospital,
      diagnosis,
      medications,
      fileUrl,
      fileFormat,
      fileSizeMb,
    } = req.body;

    const patient = patientId || req.user._id;

    const record = await MedicalRecord.create({
      patient,
      doctor: req.user.role === 'doctor' ? req.user._id : null,
      doctorName: req.user.role === 'doctor' ? req.user.name : '',
      type: type || 'report',
      title,
      hospital: hospital || 'Smart Central Hospital',
      diagnosis: diagnosis || '',
      medications: medications || [],
      fileUrl: fileUrl || '',
      fileFormat: fileFormat || 'PDF',
      fileSizeMb: fileSizeMb || 1.2,
    });

    res.status(201).json({
      success: true,
      message: `${type === 'prescription' ? 'Prescription' : 'Report'} saved successfully.`,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyRecords,
  getPatientRecordsForDoctor,
  addRecord,
};
