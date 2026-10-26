const express = require('express');
const router = express.Router();
const {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  resetAndSeedMedicines,
} = require('../controllers/medicineController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public endpoints
router.get('/', getAllMedicines);
router.get('/:id', getMedicineById);

// Admin-only endpoints
router.post('/', protect, authorize('admin'), createMedicine);
router.put('/:id', protect, authorize('admin'), updateMedicine);
router.delete('/:id', protect, authorize('admin'), deleteMedicine);
router.post('/reset-seed', protect, authorize('admin'), resetAndSeedMedicines);

module.exports = router;
