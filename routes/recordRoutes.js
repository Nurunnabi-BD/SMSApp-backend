const express = require('express');
const router = express.Router();
const {
  getMyRecords,
  getPatientRecordsForDoctor,
  addRecord,
} = require('../controllers/recordController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/my-records', getMyRecords);
router.get('/patient/:patientId', authorize('doctor', 'admin'), getPatientRecordsForDoctor);
router.post('/', addRecord);

module.exports = router;
