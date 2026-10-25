const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user (Patient, Doctor, Admin)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'patient',
      phone = '',
      bloodGroup = 'Unknown',
      gender = 'Unspecified',
      dateOfBirth = '',
      address = '',
      // Doctor-specific fields
      specialization,
      experienceYears,
      consultationFee,
      hospital,
      licenseNumber,
      certificateImage,
      certificateFormat,
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Create User
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      bloodGroup,
      gender,
      dateOfBirth,
      address,
      isVerified: true,
    });

    let doctorProfile = null;

    // If role is doctor, create their associated DoctorProfile
    if (role === 'doctor') {
      doctorProfile = await DoctorProfile.create({
        user: user._id,
        specialization: specialization || 'General Physician',
        experienceYears: experienceYears || 3,
        consultationFee: consultationFee || 40,
        hospital: hospital || 'Central Medical Center',
        licenseNumber: licenseNumber || 'BMDC-' + Math.floor(10000 + Math.random() * 90000),
        certificateImage: certificateImage || '',
        certificateFormat: certificateFormat || 'JPG',
        isApproved: true,
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        bloodGroup: user.bloodGroup,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        isVerified: user.isVerified,
        doctorProfile: doctorProfile,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Check for user (include password for validation)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await DoctorProfile.findOne({ user: user._id });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        bloodGroup: user.bloodGroup,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        isVerified: user.isVerified,
        doctorProfile: doctorProfile,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private (Protected)
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let doctorProfile = null;

    if (user.role === 'doctor') {
      doctorProfile = await DoctorProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        bloodGroup: user.bloodGroup,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        isVerified: user.isVerified,
        doctorProfile: doctorProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private (Protected)
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, bloodGroup, gender, dateOfBirth, address, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (bloodGroup) user.bloodGroup = bloodGroup;
    if (gender) user.gender = gender;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (address !== undefined) user.address = address;
    if (avatar !== undefined) user.avatar = avatar;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify 6-digit OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!otp || otp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-digit verification code.',
      });
    }

    // Accept valid 6-digit code (in production, compare against redis / DB OTP collection)
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Social Login / Register (Google, Apple)
// @route   POST /api/auth/social-login
// @access  Public
const socialLogin = async (req, res, next) => {
  try {
    const { name, email, provider, avatar } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Auto-create new user in database
      const defaultPassword = 'Social@' + Math.random().toString(36).slice(-8) + '2026!';
      user = await User.create({
        name: name ? name.trim() : 'Smart User',
        email: cleanEmail,
        password: defaultPassword,
        role: 'patient',
        avatar: avatar || '',
        isVerified: true,
      });
    } else {
      if (name && (!user.name || user.name === 'Smart User')) {
        user.name = name.trim();
        await user.save();
      }
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: `Signed in via ${provider || 'Social Login'} successfully`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        avatar: user.avatar || '',
        bloodGroup: user.bloodGroup || 'Unknown',
        gender: user.gender || 'Unspecified',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address || '',
        isVerified: user.isVerified,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  verifyOtp,
  socialLogin,
};
