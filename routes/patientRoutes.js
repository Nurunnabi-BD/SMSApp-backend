const express = require('express');
const router = express.Router();
const {
  getPatientDashboard,
  getNotifications,
  markNotificationAsRead,
} = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/dashboard', protect, authorize('patient'), getPatientDashboard);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationAsRead);

module.exports = router;
