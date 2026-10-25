const Ambulance = require('../models/Ambulance');

// @desc    Get all ambulances (public & patient)
// @route   GET /api/ambulances
// @access  Public
const getAmbulances = async (req, res, next) => {
  try {
    const ambulances = await Ambulance.find().sort({ isAvailable: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: ambulances.length,
      data: ambulances,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new ambulance (Admin only)
// @route   POST /api/ambulances
// @access  Private (Admin)
const addAmbulance = async (req, res, next) => {
  try {
    const { name, phone, driverPhone, driverName, address, type, isAvailable, vehicleNo, fare, facilities } = req.body;
    const contactPhone = phone || driverPhone;

    if (!name || !contactPhone || !address) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone number, and address are required.',
      });
    }

    const ambulance = await Ambulance.create({
      name,
      phone: contactPhone,
      driverName: driverName || '',
      address,
      type: type || 'ICU',
      vehicleNo: vehicleNo || '',
      fare: fare || '৳ 2,000',
      facilities: facilities || [],
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    res.status(201).json({
      success: true,
      message: 'Ambulance added successfully.',
      data: ambulance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ambulance details (Admin only)
// @route   PUT /api/ambulances/:id
// @access  Private (Admin)
const updateAmbulance = async (req, res, next) => {
  try {
    const ambulance = await Ambulance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ambulance updated successfully.',
      data: ambulance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete ambulance (Admin only)
// @route   DELETE /api/ambulances/:id
// @access  Private (Admin)
const deleteAmbulance = async (req, res, next) => {
  try {
    const ambulance = await Ambulance.findByIdAndDelete(req.params.id);

    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ambulance deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAmbulances,
  addAmbulance,
  updateAmbulance,
  deleteAmbulance,
};
