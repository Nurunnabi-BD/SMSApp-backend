const Vaccine = require('../models/Vaccine');
const VaccineSchedule = require('../models/VaccineSchedule');

// Default initial seed data matching user design
const defaultVaccines = [
  {
    name: 'BCG',
    description: 'Protects against Tuberculosis (TB)',
    targetGroup: 'For Newborns',
    category: 'Recommended',
    doses: 1,
    scheduleInterval: 'At birth or as early as possible',
    price: 'Free',
    iconType: 'baby',
    color: '#0C8CE9',
    sideEffects: ['Small red sore at site', 'Mild fever'],
    precautions: 'Do not squeeze or massage the vaccination site.',
    inStock: true,
  },
  {
    name: 'Pentavalent (DPT+HepB+Hib)',
    description: 'Protects against 5 serious diseases',
    targetGroup: 'For Infants',
    category: 'Recommended',
    doses: 3,
    scheduleInterval: '6 weeks, 10 weeks, 14 weeks',
    price: 'Free',
    iconType: 'syringe',
    color: '#10B981',
    sideEffects: ['Mild fever', 'Fretfulness', 'Redness at injection spot'],
    precautions: 'Provide adequate fluids and breastfeed frequently.',
    inStock: true,
  },
  {
    name: 'HPV Vaccine',
    description: 'Prevents cervical cancer',
    targetGroup: 'For Girls (9–14 years)',
    category: 'Recommended',
    doses: 2,
    scheduleInterval: '0 and 6 months',
    price: 'Subsidized',
    iconType: 'girl',
    color: '#8B5CF6',
    sideEffects: ['Arm soreness', 'Mild headache'],
    precautions: 'Sit or lie down for 15 minutes after vaccination.',
    inStock: true,
  },
  {
    name: 'Influenza (Flu) Vaccine',
    description: 'Protects against seasonal flu',
    targetGroup: 'For All Ages',
    category: 'Recommended',
    doses: 1,
    scheduleInterval: 'Annually before winter season',
    price: '৳ 1,200',
    iconType: 'elderly',
    color: '#F59E0B',
    sideEffects: ['Muscle aches', 'Low-grade fever for 24-48 hrs'],
    precautions: 'Avoid if having active severe illness with high fever.',
    inStock: true,
  },
  {
    name: 'Hepatitis B Vaccine',
    description: 'Prevents acute & chronic liver infections',
    targetGroup: 'Children & Adults',
    category: 'Essential',
    doses: 3,
    scheduleInterval: '0, 1, and 6 months',
    price: '৳ 650',
    iconType: 'shield',
    color: '#059669',
    sideEffects: ['Tenderness at site', 'Fatigue'],
    precautions: 'Inform staff of any known yeast allergy.',
    inStock: true,
  },
  {
    name: 'COVID-19 Booster Dose',
    description: 'Reinforces antibodies against modern variants',
    targetGroup: 'Adults (18+)',
    category: 'Booster',
    doses: 1,
    scheduleInterval: 'At least 6 months after primary doses',
    price: 'Free',
    iconType: 'vaccine',
    color: '#0C8CE9',
    sideEffects: ['Tiredness', 'Mild fever', 'Chills'],
    precautions: 'Rest well and stay hydrated after dose.',
    inStock: true,
  },
];

// Vaccination Centers list
const defaultCenters = [
  {
    id: 'center_1',
    name: 'Dhaka Medical College Hospital',
    address: 'Secretariat Road, Bakshibazar, Dhaka',
    phone: '+880 2-55165088',
    hours: '9:00 AM - 4:00 PM (Sat - Thu)',
    availableVaccines: ['BCG', 'Pentavalent', 'HPV Vaccine', 'Influenza', 'Hepatitis B', 'COVID-19'],
  },
  {
    id: 'center_2',
    name: 'Bangabandhu Sheikh Mujib Medical University (BSMMU)',
    address: 'Shahbag, Dhaka 1000',
    phone: '+880 2-9661051',
    hours: '8:30 AM - 3:30 PM (Sat - Thu)',
    availableVaccines: ['BCG', 'Pentavalent', 'HPV Vaccine', 'Influenza', 'Hepatitis B'],
  },
  {
    id: 'center_3',
    name: 'Square Hospitals EPI Center',
    address: '18/F Bir Uttam Qazi Nuruzzaman Sarak, Panthapath, Dhaka',
    phone: '+880 1713-377775',
    hours: '8:00 AM - 8:00 PM (Everyday)',
    availableVaccines: ['Influenza', 'HPV Vaccine', 'Hepatitis B', 'Pneumococcal'],
  },
  {
    id: 'center_4',
    name: 'Popular Diagnostic & Vaccine Center',
    address: 'House 16, Road 2, Dhanmondi, Dhaka',
    phone: '+880 9613-787801',
    hours: '8:00 AM - 10:00 PM (Everyday)',
    availableVaccines: ['Influenza', 'Hepatitis B', 'Tetanus', 'HPV Vaccine'],
  },
];

// @desc    Get all available & recommended vaccines
// @route   GET /api/vaccines
// @access  Public
const getAllVaccines = async (req, res) => {
  try {
    let vaccines = await Vaccine.find().sort({ createdAt: 1 });

    // Auto-seed if database collection is empty
    if (vaccines.length === 0) {
      vaccines = await Vaccine.insertMany(defaultVaccines);
    }

    res.status(200).json({
      success: true,
      count: vaccines.length,
      data: vaccines,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vaccines: ' + error.message,
    });
  }
};

// @desc    Get vaccination centers
// @route   GET /api/vaccines/centers
// @access  Public
const getVaccineCenters = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: defaultCenters.length,
      data: defaultCenters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vaccine centers: ' + error.message,
    });
  }
};

// @desc    Get patient's registered vaccination schedules
// @route   GET /api/vaccines/my-schedules
// @access  Private
const getMyVaccineSchedules = async (req, res) => {
  try {
    const schedules = await VaccineSchedule.find({ patientId: req.user._id }).sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedules: ' + error.message,
    });
  }
};

// @desc    Book / Schedule a new vaccination
// @route   POST /api/vaccines/schedule
// @access  Private
const bookVaccineSchedule = async (req, res) => {
  try {
    const {
      vaccineName,
      doseNumber = 1,
      totalDoses = 1,
      scheduledDate,
      centerName = 'Dhaka Medical College Center',
      notes = '',
    } = req.body;

    if (!vaccineName || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Vaccine name and scheduled date are required.',
      });
    }

    const schedule = await VaccineSchedule.create({
      patientId: req.user._id,
      patientName: req.user.name || 'Patient',
      patientPhone: req.user.phone || '',
      vaccineName,
      doseNumber,
      totalDoses,
      scheduledDate: new Date(scheduledDate),
      centerName,
      status: 'Scheduled',
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Vaccination scheduled successfully!',
      data: schedule,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to schedule vaccination: ' + error.message,
    });
  }
};

// @desc    Update vaccination status (e.g. Completed, Rescheduled)
// @route   PUT /api/vaccines/schedule/:id
// @access  Private
const updateVaccineSchedule = async (req, res) => {
  try {
    const schedule = await VaccineSchedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Vaccination schedule not found.',
      });
    }

    // Verify ownership or admin
    if (schedule.patientId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this schedule.',
      });
    }

    const { status, scheduledDate, completedDate, notes, centerName } = req.body;

    if (status) schedule.status = status;
    if (scheduledDate) schedule.scheduledDate = new Date(scheduledDate);
    if (completedDate) schedule.completedDate = new Date(completedDate);
    if (status === 'Completed' && !schedule.completedDate) schedule.completedDate = new Date();
    if (notes !== undefined) schedule.notes = notes;
    if (centerName) schedule.centerName = centerName;

    await schedule.save();

    res.status(200).json({
      success: true,
      message: 'Vaccination schedule updated successfully!',
      data: schedule,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update schedule: ' + error.message,
    });
  }
};

// @desc    Cancel vaccination schedule
// @route   DELETE /api/vaccines/schedule/:id
// @access  Private
const cancelVaccineSchedule = async (req, res) => {
  try {
    const schedule = await VaccineSchedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Vaccination schedule not found.',
      });
    }

    if (schedule.patientId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this schedule.',
      });
    }

    await schedule.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Vaccination schedule removed successfully!',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel schedule: ' + error.message,
    });
  }
};

module.exports = {
  getAllVaccines,
  getVaccineCenters,
  getMyVaccineSchedules,
  bookVaccineSchedule,
  updateVaccineSchedule,
  cancelVaccineSchedule,
};
