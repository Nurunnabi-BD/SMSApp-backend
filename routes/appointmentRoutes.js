const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('patient'), bookAppointment);
router.get('/my-appointments', protect, authorize('patient'), getMyAppointments);
router.get('/doctor-appointments', protect, authorize('doctor', 'assistant'), getDoctorAppointments);
router.put('/:id/status', protect, authorize('doctor', 'admin', 'assistant'), updateAppointmentStatus);
router.put('/:id/cancel', protect, authorize('patient'), cancelAppointment);

module.exports = router;
