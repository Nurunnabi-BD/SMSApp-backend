const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  checkEmail,
  sendOtp,
  verifyOtp,
  socialLogin,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/social-login', socialLogin);
router.post('/check-email', checkEmail);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
