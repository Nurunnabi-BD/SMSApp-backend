const Medicine = require('../models/Medicine');
const seedMedicinesData = require('../data/seedMedicines');

// Auto-seed helper
const checkAndSeedMedicines = async () => {
  try {
    const count = await Medicine.countDocuments();
    if (count === 0 && seedMedicinesData && seedMedicinesData.length > 0) {
      console.log('Seeding initial 50 Bangladesh medicine records...');
      await Medicine.insertMany(seedMedicinesData);
      console.log(`✔ Successfully seeded ${seedMedicinesData.length} medicines.`);
    }
  } catch (error) {
    console.error('Auto-seed error:', error.message);
  }
};

/**
 * @desc    Get all medicines (supports search, category, form filters)
 * @route   GET /api/medicines
 * @access  Public
 */
const getAllMedicines = async (req, res) => {
  try {
    await checkAndSeedMedicines();

    const { search, category, form, inStock } = req.query;
    let query = {};

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { genericName: searchRegex },
        { companyName: searchRegex },
        { medicineGroup: searchRegex },
        { usedFor: searchRegex },
      ];
    }

    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      // Allow flexible partial or normalized matching for category
      query.category = new RegExp(category.trim(), 'i');
    }

    if (form && form.trim() !== '' && form.toLowerCase() !== 'all') {
      query.form = new RegExp(`^${form.trim()}$`, 'i');
    }

    if (inStock !== undefined && inStock !== '') {
      query.inStock = inStock === 'true';
    }

    const medicines = await Medicine.find(query).sort({ recordNumber: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines,
    });
  } catch (error) {
    console.error('getAllMedicines error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medicines',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single medicine by ID
 * @route   GET /api/medicines/:id
 * @access  Public
 */
const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found',
      });
    }

    res.status(200).json({
      success: true,
      data: medicine,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve medicine details',
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new medicine (Admin only)
 * @route   POST /api/medicines
 * @access  Private/Admin
 */
const createMedicine = async (req, res) => {
  try {
    const {
      name,
      genericName,
      companyName,
      medicineGroup,
      category,
      price,
      packSize,
      form,
      strength,
      usedFor,
      prescriptionRequired,
      precautions,
      inStock,
      image,
    } = req.body;

    if (!name || !genericName || !companyName || !medicineGroup || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, genericName, companyName, medicineGroup, category, and price.',
      });
    }

    const maxRecord = await Medicine.findOne().sort({ recordNumber: -1 }).select('recordNumber');
    const nextRecordNumber = maxRecord && maxRecord.recordNumber ? maxRecord.recordNumber + 1 : 1;

    const newMedicine = await Medicine.create({
      recordNumber: nextRecordNumber,
      name,
      genericName,
      companyName,
      medicineGroup,
      category,
      price: Number(price),
      packSize: packSize || "1 Strip (10's)",
      form: form || 'Tablet',
      strength: strength || '',
      usedFor: usedFor || '',
      prescriptionRequired: prescriptionRequired !== undefined ? Boolean(prescriptionRequired) : true,
      precautions: precautions || '',
      inStock: inStock !== undefined ? Boolean(inStock) : true,
      image: image || '',
    });

    res.status(201).json({
      success: true,
      message: 'Medicine added successfully by admin',
      data: newMedicine,
    });
  } catch (error) {
    console.error('createMedicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create medicine',
      error: error.message,
    });
  }
};

/**
 * @desc    Update a medicine (Admin only)
 * @route   PUT /api/medicines/:id
 * @access  Private/Admin
 */
const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found',
      });
    }

    const {
      name,
      genericName,
      companyName,
      medicineGroup,
      category,
      price,
      packSize,
      form,
      strength,
      usedFor,
      prescriptionRequired,
      precautions,
      inStock,
      image,
    } = req.body;

    if (name) medicine.name = name;
    if (genericName) medicine.genericName = genericName;
    if (companyName) medicine.companyName = companyName;
    if (medicineGroup) medicine.medicineGroup = medicineGroup;
    if (category) medicine.category = category;
    if (price !== undefined) medicine.price = Number(price);
    if (packSize) medicine.packSize = packSize;
    if (form) medicine.form = form;
    if (strength !== undefined) medicine.strength = strength;
    if (usedFor !== undefined) medicine.usedFor = usedFor;
    if (prescriptionRequired !== undefined) medicine.prescriptionRequired = Boolean(prescriptionRequired);
    if (precautions !== undefined) medicine.precautions = precautions;
    if (inStock !== undefined) medicine.inStock = Boolean(inStock);
    if (image !== undefined) medicine.image = image;

    const updatedMedicine = await medicine.save();

    res.status(200).json({
      success: true,
      message: 'Medicine updated successfully',
      data: updatedMedicine,
    });
  } catch (error) {
    console.error('updateMedicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update medicine',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a medicine (Admin only)
 * @route   DELETE /api/medicines/:id
 * @access  Private/Admin
 */
const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found',
      });
    }

    await Medicine.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Medicine deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    console.error('deleteMedicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete medicine',
      error: error.message,
    });
  }
};

/**
 * @desc    Reset / re-seed 50 medicines (Admin only)
 * @route   POST /api/medicines/reset-seed
 * @access  Private/Admin
 */
const resetAndSeedMedicines = async (req, res) => {
  try {
    await Medicine.deleteMany({});
    const inserted = await Medicine.insertMany(seedMedicinesData);

    res.status(200).json({
      success: true,
      message: `Reset and successfully seeded ${inserted.length} medicines.`,
      count: inserted.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reset and seed medicines',
      error: error.message,
    });
  }
};

module.exports = {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  resetAndSeedMedicines,
};
