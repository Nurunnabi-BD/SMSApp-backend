const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  getSpecializations,
  updateDoctorProfile,
  getDoctorPatientRegistry,
  createAssistant,
  getDoctorAssistants,
  deleteAssistant,
  getAssignedDoctor,
} = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getDoctors);
router.get('/specializations', getSpecializations);
router.get('/patient-registry', protect, authorize('doctor'), getDoctorPatientRegistry);
router.put('/profile', protect, authorize('doctor'), updateDoctorProfile);

// Assistant management
router.post('/assistants', protect, authorize('doctor'), createAssistant);
router.get('/assistants', protect, authorize('doctor'), getDoctorAssistants);
router.delete('/assistants/:id', protect, authorize('doctor'), deleteAssistant);
router.get('/assigned-doctor', protect, authorize('assistant'), getAssignedDoctor);

router.get('/:id', getDoctorById);

module.exports = router;
