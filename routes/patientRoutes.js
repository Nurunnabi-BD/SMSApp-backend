const express = require('express');
const router = express.Router();
const {
  getPatientDashboard,
  getNotifications,
} = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/dashboard', protect, authorize('patient'), getPatientDashboard);
router.get('/notifications', protect, getNotifications);

module.exports = router;
