const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllDoctorsAdmin,
  setDoctorApproval,
  getAllPatients,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All admin routes require protect + admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/doctors', getAllDoctorsAdmin);
router.put('/doctors/:id/approval', setDoctorApproval);
router.get('/patients', getAllPatients);

module.exports = router;
