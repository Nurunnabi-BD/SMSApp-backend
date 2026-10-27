const express = require('express');
const router = express.Router();
const {
  getAmbulances,
  getNearbyAmbulances,
  getNearbyHospitals,
  createAmbulanceRequest,
  getMyAmbulanceRequests,
  getAmbulanceRequestById,
  updateAmbulanceRequestStatus,
  addAmbulance,
  updateAmbulance,
  deleteAmbulance,
} = require('../controllers/ambulanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public & Patient GPS Radar Endpoints
router.get('/', getAmbulances);
router.get('/nearby', getNearbyAmbulances);
router.get('/nearby-hospitals', getNearbyHospitals);

// Patient Ambulance Booking & Request Tracking
router.post('/request', protect, createAmbulanceRequest);
router.get('/my-requests', protect, getMyAmbulanceRequests);
router.get('/requests/:id', protect, getAmbulanceRequestById);
router.patch('/requests/:id/status', protect, updateAmbulanceRequestStatus);

// Admin-only Fleet Management
router.post('/', protect, authorize('admin'), addAmbulance);
router.put('/:id', protect, authorize('admin'), updateAmbulance);
router.delete('/:id', protect, authorize('admin'), deleteAmbulance);

module.exports = router;
