const HealthTip = require('../models/HealthTip');
const HealthTipBanner = require('../models/HealthTipBanner');

// Default initial banners
const defaultBanners = [
  {
    title: 'Better Habits Healthier You',
    image: 'assets/images/health_tips_slide1.jpeg',
    order: 1,
    isActive: true,
  },
  {
    title: 'Daily Nutrition & Wellness',
    image: 'assets/images/health_tips_slide2.jpeg',
    order: 2,
    isActive: true,
  },
  {
    title: 'Mental Health & Deep Sleep',
    image: 'assets/images/health_tips_slide3.jpeg',
    order: 3,
    isActive: true,
  },
];

// Default initial health tips matching user UI design
const defaultHealthTips = [
  {
    title: 'Stay Hydrated',
    description: 'Drink enough water every day. It keeps your body fresh and your organs happy.',
    category: 'Nutrition',
    image: 'assets/images/tip_stay_hydrated.png',
    iconType: 'water',
    readTime: '2 min read',
    benefits: [
      'Boosts energy levels and cognitive brain performance',
      'Flushes out bodily toxins via renal system',
      'Maintains healthy cellular hydration and skin glow',
    ],
    author: 'Dr. Sarah Mitchell, Nutritionist',
    isActive: true,
  },
  {
    title: 'Eat Healthy Foods',
    description: 'Choose fresh fruits, vegetables and whole grains. They give you energy and boost your immunity.',
    category: 'Nutrition',
    image: 'assets/images/tip_eat_healthy.png',
    iconType: 'food',
    readTime: '3 min read',
    benefits: [
      'Supplies essential antioxidants, vitamins, and minerals',
      'Reduces the risk of chronic cardiovascular diseases',
      'Provides dietary fiber for optimum gut microbiome',
    ],
    author: 'Dr. Rafiqul Islam, Dietitian',
    isActive: true,
  },
  {
    title: 'Stay Active',
    description: 'Do regular exercise. It keeps your heart healthy and your mind fresh.',
    category: 'Fitness',
    image: 'assets/images/tip_stay_active.png',
    iconType: 'fitness',
    readTime: '2 min read',
    benefits: [
      'Strengthens cardiac muscles and circulation',
      'Improves joint flexibility and muscular endurance',
      'Stimulates endorphin release to combat fatigue',
    ],
    author: 'Physiotherapy & Wellness Panel',
    isActive: true,
  },
  {
    title: 'Manage Stress',
    description: 'Take deep breaths, stay positive and do what you love. A calm mind keeps you healthy.',
    category: 'Mental Health',
    image: 'assets/images/tip_manage_stress.png',
    iconType: 'meditation',
    readTime: '3 min read',
    benefits: [
      'Lowers cortisol and adrenaline stress biomarkers',
      'Prevents tension headaches and burnout',
      'Promotes emotional resilience and inner tranquility',
    ],
    author: 'Mental Wellness Clinical Team',
    isActive: true,
  },
  {
    title: 'Get Enough Sleep',
    description: 'Good sleep helps your brain, mood and body heal.',
    category: 'Sleep',
    image: 'assets/images/tip_get_sleep.png',
    iconType: 'sleep',
    readTime: '2 min read',
    benefits: [
      'Crucial for tissue regeneration and hormone balancing',
      'Sharpens focus, memory consolidation, and reasoning',
      'Strengthens natural immune defense against pathogens',
    ],
    author: 'Sleep Medicine Specialist',
    isActive: true,
  },
];

// @desc    Get all active health tips (supports ?category=Nutrition filter)
// @route   GET /api/health-tips
// @access  Public
const getAllHealthTips = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };

    if (category && category !== 'All') {
      filter.category = category;
    }

    let tips = await HealthTip.find(filter).sort({ createdAt: -1 });

    // Auto-seed if collection is empty
    if (tips.length === 0 && (!category || category === 'All')) {
      tips = await HealthTip.insertMany(defaultHealthTips);
    }

    res.status(200).json({
      success: true,
      count: tips.length,
      data: tips,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health tips: ' + error.message,
    });
  }
};

// @desc    Get single health tip by ID
// @route   GET /api/health-tips/:id
// @access  Public
const getHealthTipById = async (req, res) => {
  try {
    const tip = await HealthTip.findById(req.params.id);
    if (!tip) {
      return res.status(404).json({
        success: false,
        message: 'Health tip not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: tip,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health tip: ' + error.message,
    });
  }
};

// @desc    Create new health tip (Admin only)
// @route   POST /api/health-tips
// @access  Private/Admin
const createHealthTip = async (req, res) => {
  try {
    const {
      title,
      description,
      category = 'Nutrition',
      image = '',
      benefits = [],
      author = 'Medical Health Board',
      readTime = '2 min read',
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required.',
      });
    }

    const tip = await HealthTip.create({
      title,
      description,
      category,
      image,
      benefits: Array.isArray(benefits) ? benefits : [benefits],
      author,
      readTime,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Health tip added successfully!',
      data: tip,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create health tip: ' + error.message,
    });
  }
};

// @desc    Update health tip (Admin only)
// @route   PUT /api/health-tips/:id
// @access  Private/Admin
const updateHealthTip = async (req, res) => {
  try {
    const tip = await HealthTip.findById(req.params.id);
    if (!tip) {
      return res.status(404).json({
        success: false,
        message: 'Health tip not found.',
      });
    }

    const { title, description, category, image, benefits, author, readTime, isActive } = req.body;

    if (title) tip.title = title;
    if (description) tip.description = description;
    if (category) tip.category = category;
    if (image !== undefined) tip.image = image;
    if (benefits) tip.benefits = Array.isArray(benefits) ? benefits : [benefits];
    if (author) tip.author = author;
    if (readTime) tip.readTime = readTime;
    if (isActive !== undefined) tip.isActive = isActive;

    await tip.save();

    res.status(200).json({
      success: true,
      message: 'Health tip updated successfully!',
      data: tip,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update health tip: ' + error.message,
    });
  }
};

// @desc    Delete health tip (Admin only)
// @route   DELETE /api/health-tips/:id
// @access  Private/Admin
const deleteHealthTip = async (req, res) => {
  try {
    const tip = await HealthTip.findById(req.params.id);
    if (!tip) {
      return res.status(404).json({
        success: false,
        message: 'Health tip not found.',
      });
    }

    await tip.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Health tip removed from database successfully!',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete health tip: ' + error.message,
    });
  }
};

// @desc    Get all active banners
// @route   GET /api/health-tips/banners
// @access  Public
const getAllBanners = async (req, res) => {
  try {
    let banners = await HealthTipBanner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });

    if (banners.length === 0) {
      banners = await HealthTipBanner.insertMany(defaultBanners);
    }

    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners: ' + error.message,
    });
  }
};

// @desc    Create banner (Admin only)
// @route   POST /api/health-tips/banners
// @access  Private/Admin
const createBanner = async (req, res) => {
  try {
    const { title = '', image, linkUrl = '', order = 0 } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Banner image is required.',
      });
    }

    const banner = await HealthTipBanner.create({
      title,
      image,
      linkUrl,
      order,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Banner added successfully!',
      data: banner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create banner: ' + error.message,
    });
  }
};

// @desc    Delete banner (Admin only)
// @route   DELETE /api/health-tips/banners/:id
// @access  Private/Admin
const deleteBanner = async (req, res) => {
  try {
    const banner = await HealthTipBanner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found.',
      });
    }

    await banner.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully!',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete banner: ' + error.message,
    });
  }
};

module.exports = {
  getAllHealthTips,
  getHealthTipById,
  createHealthTip,
  updateHealthTip,
  deleteHealthTip,
  getAllBanners,
  createBanner,
  deleteBanner,
};
