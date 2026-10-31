const express = require('express');
const router = express.Router();
const {
  getAllHealthTips,
  getHealthTipById,
  createHealthTip,
  updateHealthTip,
  deleteHealthTip,
  getAllBanners,
  createBanner,
  deleteBanner,
} = require('../controllers/healthTipController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Banner endpoints (must precede /:id)
router.get('/banners', getAllBanners);
router.post('/banners', protect, authorize('admin'), createBanner);
router.delete('/banners/:id', protect, authorize('admin'), deleteBanner);

// Public health tip endpoints
router.get('/', getAllHealthTips);
router.get('/:id', getHealthTipById);

// Admin-only management endpoints
router.post('/', protect, authorize('admin'), createHealthTip);
router.put('/:id', protect, authorize('admin'), updateHealthTip);
router.delete('/:id', protect, authorize('admin'), deleteHealthTip);

module.exports = router;
