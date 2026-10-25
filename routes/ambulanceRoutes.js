const express = require('express');
const router = express.Router();
const {
  getAmbulances,
  addAmbulance,
  updateAmbulance,
  deleteAmbulance,
} = require('../controllers/ambulanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public route to view ambulances and call
router.get('/', getAmbulances);

// Admin-only management routes
router.post('/', protect, authorize('admin'), addAmbulance);
router.put('/:id', protect, authorize('admin'), updateAmbulance);
router.delete('/:id', protect, authorize('admin'), deleteAmbulance);

module.exports = router;
