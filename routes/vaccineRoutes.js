const express = require('express');
const router = express.Router();
const {
  getAllVaccines,
  getVaccineCenters,
  getMyVaccineSchedules,
  bookVaccineSchedule,
  updateVaccineSchedule,
  cancelVaccineSchedule,
} = require('../controllers/vaccineController');
const { protect } = require('../middleware/authMiddleware');

// Public endpoints
router.get('/', getAllVaccines);
router.get('/centers', getVaccineCenters);

// Patient protected endpoints
router.get('/my-schedules', protect, getMyVaccineSchedules);
router.post('/schedule', protect, bookVaccineSchedule);
router.put('/schedule/:id', protect, updateVaccineSchedule);
router.delete('/schedule/:id', protect, cancelVaccineSchedule);

module.exports = router;
