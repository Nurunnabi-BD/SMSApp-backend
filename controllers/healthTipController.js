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

// ==========================================
// Intelligent Health Knowledge Base Fallback
// ==========================================
const getHealthKnowledgeFallback = (question, isBengali) => {
  const q = question.toLowerCase();

  // 1. Water & Hydration
  if (q.includes('water') || q.includes('পানি') || q.includes('hydrate') || q.includes('hydration') || q.includes('pipasa')) {
    return isBengali
      ? `💧 **দৈনিক পর্যাপ্ত পানি পানের স্বাস্থ্য টিপস:**

• **পরিমাণ:** একজন পূর্ণবয়স্ক মানুষের প্রতিদিন গড়ে **২.৫ থেকে ৩ লিটার (৮-১০ গ্লাস)** বিশুদ্ধ পানি পান করা উচিত।
• **উপকারিতা:** এটি শরীরের আর্দ্রতা ধরে রাখে, মেটাবলিজম বাড়ায়, কিডনি পরিষ্কার রাখে এবং ত্বকের উজ্জ্বলতা বৃদ্ধি করে।
• **পরামর্শ:**
  1. সকালে ঘুম থেকে উঠে খালি পেটে ১-২ গ্লাস কুসুম গরম পানি পান করুন।
  2. ভারী খাবারের ঠিক পরপরই বেশি পানি না খেয়ে খাবারের ৩০ মিনিট আগে বা পরে পান করা ভালো।
  3. গরমের দিনে লেবুর পানি বা ডাবের পানি পান করতে পারেন।

⚠️ *পরামর্শ: কিডনি বা হৃদরোগের জটিলতা থাকলে ডাক্তারের নির্ধারিত পরিমাণ অনুযায়ী পানি পান করুন।*`
      : `💧 **Daily Hydration & Water Intake Tips:**

• **Recommended Intake:** An average adult should drink **2.5 to 3 liters (8-10 glasses)** of pure water every day.
• **Key Benefits:** Flushes bodily toxins, maintains renal function, regulates body temperature, and promotes vibrant skin.
• **Practical Habits:**
  1. Start your day with 1-2 glasses of lukewarm water before breakfast.
  2. Avoid gulping large amounts of water immediately after heavy meals; drink 30 minutes before or after.
  3. During hot weather, include electrolyte-rich natural drinks like coconut water.

⚠️ *Note: If you have kidney or cardiac restrictions, strictly follow your physician's fluid advice.*`;
  }

  // 2. Sleep & Rest
  if (q.includes('sleep') || q.includes('ঘুম') || q.includes('insomnia') || q.includes('rest') || q.includes('clant')) {
    return isBengali
      ? `😴 **ভালো ও গভীর ঘুমের জন্য প্রয়োজনীয় স্বাস্থ্যবিধি:**

• **সময়কাল:** সুস্থ প্রাপ্তবয়স্ক মানুষের প্রতিদিন **৭ থেকে ৮ ঘণ্টা** নিরবচ্ছিন্ন ঘুম প্রয়োজন।
• **সহজ টিপস:**
  1. প্রতিদিন নির্দিষ্ট সময়ে ঘুমাতে যান এবং একই সময়ে ঘুম থেকে উঠার অভ্যাস করুন।
  2. ঘুমানোর অন্তত ১ ঘণ্টা আগে মোবাইল, ল্যাপটপ বা টিভির স্ক্রিন বন্ধ রাখুন (ব্লু-লাইট মেলাটোনিন হরমোন কমায়)।
  3. রাতে ভারী খাবার এবং অতিরিক্ত চা বা কফি পরিহার করুন।
  4. শোবার ঘর অন্ধকার, শান্ত ও শীতল রাখুন।

⚠️ *পরামর্শ: নিয়মিত অনিদ্রা বা শ্বাসকষ্টজনিত সমস্যা থাকলে বিশেষজ্ঞ চিকিৎসকের পরামর্শ নিন।*`
      : `😴 **Healthy Sleep Hygiene & Deep Rest Tips:**

• **Duration:** Adults need **7 to 8 hours** of quality, uninterrupted sleep each night.
• **Actionable Habits:**
  1. Maintain a consistent sleep schedule even on weekends.
  2. Put away smartphones and digital screens at least 1 hour before bedtime.
  3. Avoid heavy dinners, caffeine, and energy drinks late in the evening.
  4. Keep the bedroom cool, dark, and well-ventilated.

⚠️ *Note: Chronic insomnia or loud snoring with sleep apnea warrants a clinical consultation.*`;
  }

  // 3. Nutrition & Diet
  if (q.includes('food') || q.includes('খাবার') || q.includes('diet') || q.includes('nutrition') || q.includes('ফল') || q.includes('শাকসবজি')) {
    return isBengali
      ? `🥗 **পুষ্টিকর ও সুষম খাদ্যাভ্যাসের নির্দেশিকা:**

• **সুষম থালি (Balanced Plate):** আপনার প্লেটের অর্ধেকটা রাখুন তাজা শাকসবজি ও সালাদ, এক-চতুর্থাংশ শর্করা (লাল চাল বা আটা) এবং এক-চতুর্থাংশ প্রোটিন (মাছ, ডিম, ডাল বা মুরগির মাংস)।
• **যা খাবেন:** রঙিন ফলমূল, আঁশযুক্ত খাবার, বাদাম ও বীজ।
• **যা বর্জন করবেন:** অতিরিক্ত ভাজাপোড়া, প্রক্রিয়াজাত স্ন্যাকস, চিনিযুক্ত কোমল পানীয় এবং অতিরিক্ত লবণ।
• **অভ্যাস:** খাবার ধীরে ধীরে চিবিয়ে খান এবং সময়মতো খাবার গ্রহণ করুন।

⚠️ *পরামর্শ: ডায়াবেটিস বা উচ্চ রক্তচাপ থাকলে পুষ্টিবিদের প্রেসক্রাইবড চার্ট অনুসরণ করুন।*`
      : `🥗 **Balanced Nutrition & Healthy Eating Guide:**

• **Balanced Plate Model:** Fill half your plate with fresh colorful vegetables and greens, one-quarter with complex carbs (brown rice, oats, whole wheat), and one-quarter with lean protein (fish, eggs, lentils, lean chicken).
• **Include:** Fiber-rich whole foods, seasonal fruits, nuts, and healthy fats.
• **Limit:** Deep-fried street foods, processed sugar, refined snacks, and excess sodium.
• **Tip:** Chew thoroughly and avoid skipping nutritious morning meals.

⚠️ *Note: For metabolic conditions like diabetes, consult our specialist clinical dietitians.*`;
  }

  // 4. Blood Pressure / Hypertension
  if (q.includes('pressure') || q.includes('প্রেসার') || q.includes('hypertension') || q.includes('blood pressure') || q.includes('bp')) {
    return isBengali
      ? `❤️ **উচ্চ রক্তচাপ (Blood Pressure) নিয়ন্ত্রণে রাখার উপায়:**

• **লবণ নিয়ন্ত্রণ:** রান্নায় লবণের পরিমাণ কমান এবং পাতে কাঁচা লবণ খাওয়ার অভ্যাস পুরোপুরি পরিহার করুন।
• **শারীরিক ব্যায়াম:** প্রতিদিন অন্তত ৩০ মিনিট দ্রুত হাঁটার অভ্যাস গড়ে তুলুন।
• **খাদ্যাভ্যাস:** পটাশিয়ামসমৃদ্ধ খাবার যেমন কলা, ডাবের পানি, সবুজ শাকসবজি খান।
• **মানসিক প্রশান্তি:** মেডিটেশন ও গভীর শ্বাস-প্রশ্বাসের মাধ্যমে মানসিক চাপ মুক্ত থাকুন।

⚠️ *গুরুত্বপূর্ণ: প্রেসার ১৪০/৯০ mmHg-এর বেশি থাকলে নিয়মিত মেপে চিকিৎসকের পরামর্শে নিয়মিত ওষুধ সেবন করুন।*`
      : `❤️ **Managing Healthy Blood Pressure (Hypertension Tips):**

• **Sodium Reduction:** Cut down table salt and processed salty snacks.
• **Aerobic Exercise:** Aim for 30 minutes of brisk walking or light jogging at least 5 days a week.
• **DASH Diet:** Focus on potassium-rich foods like bananas, spinach, lentils, and oats.
• **Stress Management:** Practice mindfulness, yoga, or deep breathing to ease vascular tension.

⚠️ *Important: If blood pressure reads above 140/90 mmHg consistently, consult a registered cardiologist.*`;
  }

  // 5. Diabetes & Blood Sugar
  if (q.includes('sugar') || q.includes('সুগার') || q.includes('diabetes') || q.includes('ডায়াবেটিস') || q.includes('diabetic')) {
    return isBengali
      ? `🩸 **রক্তে সুগার ও ডায়াবেটিস নিয়ন্ত্রণের নিয়মাবলী:**

• **মিষ্টি ও চিনি বর্জন:** চিনি, মিষ্টি, সফট ড্রিংকস ও রিফাইন্ড আটা-ময়দার তৈরি খাবার এড়িয়ে চলুন।
• **ফাইবার ও শর্করা:** লাল চাল, ওটস এবং প্রচুর সবুজ শাকসবজি গ্রহণ করুন যা রক্তে সুগার ধীরে ছড়ায়।
• **নিয়মিত হাঁটা:** খাবারের পর হালকা পায়চারি বা প্রতিদিন ৩০-৪০ মিনিট হাঁটুন।
• **রুটিন চেকআপ:** প্রতি সপ্তাহে একবার খালি পেটে ও খাবার ২ ঘণ্টা পর সুগার পরিমাপ করুন।

⚠️ *সতর্কতা: নিয়মিত প্রেসক্রিপশনের ওষুধ বা ইনসুলিন গ্রহণ না বাদ দিয়ে বিশেষজ্ঞ ডাক্তারের পরামর্শে থাকুন।*`
      : `🩸 **Blood Sugar Control & Diabetes Wellness:**

• **Cut Refined Sugars:** Eliminate sugary beverages, pastries, and refined carbohydrates.
• **High Fiber Foods:** Prefer whole grains, vegetables, and legumes with a low glycemic index.
• **Post-Meal Walks:** A brisk 15-minute walk after meals significantly blunts postprandial glucose spikes.
• **Routine Monitoring:** Keep a log of fasting and post-meal glucose levels.

⚠️ *Caution: Always coordinate with your endocrinologist regarding medications or insulin adjustments.*`;
  }

  // 6. Weight Loss & Fitness
  if (q.includes('weight') || q.includes('ওজন') || q.includes('fitness') || q.includes('fat') || q.includes('ব্যায়াম') || q.includes('exercise')) {
    return isBengali
      ? `🏃 **সুস্থ ও টেকসইভাবে ওজন কমানোর কৌশল:**

• **ক্যালোরি ঘাটতি (Calorie Deficit):** অতিরিক্ত না খেয়ে পরিমিত ও পুষ্টিকর খাবার গ্রহণ করুন।
• **শারীরিক ব্যায়াম:** সপ্তাহে অন্তত ১৫০ মিনিট মাঝারি মাত্রার কার্ডিও (হাঁটা, সাইক্লিং, সাঁতার) এবং ২ দিন হালকা স্ট্রেংথ এক্সারসাইজ করুন।
• **পর্যাপ্ত প্রোটিন ও ফাইবার:** প্রোটিন ও ফাইবার দীর্ঘক্ষণ পেট ভরা রাখে এবং অতিরিক্ত খাওয়ার প্রবণতা কমায়।
• **ক্রাশ ডায়েট বর্জন:** হঠাৎ করে না খেয়ে থাকার বদলে প্রতিদিনের রুটিনে স্বাস্থ্যকর পরিবর্তন আনুন।

⚠️ *পরামর্শ: সুস্থ উপায়ে মাসে ১.৫ থেকে ২ কেজি ওজন কমানো নিরাপদ ও টেকসই।*`
      : `🏃 **Sustainable Weight Loss & Daily Fitness Tips:**

• **Balanced Deficit:** Focus on nutrient-dense whole foods rather than extreme starvation.
• **Cardio & Movement:** Aim for 150 minutes of moderate aerobic exercise (brisk walking, cycling) per week.
• **Prioritize Protein & Fiber:** Keeps you satiated longer and preserves lean muscle mass.
• **Consistency Over Speed:** Losing 0.5 to 1 kg per week is considered safe, realistic, and permanent.

⚠️ *Tip: Hydrate adequately before workouts and listen to your body to prevent joint injuries.*`;
  }

  // 7. Gastric, Acidity & Digestion
  if (q.includes('gas') || q.includes('গ্যাস') || q.includes('acidity') || q.includes('বুক জ্বালা') || q.includes('gastric') || q.includes('হজম')) {
    return isBengali
      ? `🔥 **গ্যাস্ট্রিক ও বুক জ্বালাপোড়া (Acidity) নিরাময়ের উপায়:**

• **সময়মতো খাবার:** দীর্ঘক্ষণ না খেয়ে পেট খালি রাখবেন না। নির্দিষ্ট সময়ে খাবার খাওয়ার অভ্যাস করুন।
• **তৈলাক্ত ও ঝাল খাবার বর্জন:** অতিরিক্ত তেল, মসলাযুক্ত ও ডিপ-ফ্রাইড খাবার গ্যাস্ট্রিকের প্রধান কারণ।
• **খাওয়ার পর করণীয়:** খাওয়ার সাথে সাথেই শুয়ে পড়বেন না। অন্তত ৩০ মিনিট সোজা হয়ে বসে বা হালকা হেঁটে বিশ্রাম নিন।
• **সহজ ঘরোয়া সমাধান:** পর্যাপ্ত পানি, আদা চা, ডাবের পানি বা শসা গ্যাস্ট্রিকের জ্বালাপোড়া কমাতে সাহায্য করে।

⚠️ *পরামর্শ: নিয়মিত অতিরিক্ত অ্যান্টাসিড সেবন না করে ডাক্তারের পরামর্শে চিকিৎসা নিন।*`
      : `🔥 **Soothing Acidity, Gastritis & Digestion Tips:**

• **Avoid Empty Stomach:** Eat small, frequent meals rather than large, sporadic portions.
• **Trigger Foods:** Steer clear of greasy fried items, spicy curries, citrus fruits on empty stomach, and midnight snacks.
• **Post-Meal Posture:** Remain upright for at least 30 minutes after eating; never lie flat immediately.
• **Gentle Remedies:** Fresh coconut water, cucumber, and ginger tea help neutralize excess acid.

⚠️ *Note: Persistent heartburn or stomach ache requires evaluation by a gastroenterologist.*`;
  }

  // 8. General Health & Wellness (Universal)
  return isBengali
    ? `🌿 **দৈনিক সুস্থ ও প্রাণবন্ত থাকার সাধারণ স্বাস্থ্য নির্দেশিকা:**

আপনার প্রশ্নটি আমাদের স্বাস্থ্য সহকারী লক্ষ্য করেছে। সুস্থ ও দীর্ঘ জীবনের জন্য নিচের ৫টি মূল স্তম্ভ মেনে চলার পরামর্শ দেওয়া হলো:

১. **পর্যাপ্ত পানি পান:** দিনে অন্তত ৮-১০ গ্লাস বিশুদ্ধ পানি পান করুন।
২. **সুষম খাদ্য:** খাবারে প্রতিদিন রঙিন শাকসবজি, ফল ও পর্যাপ্ত প্রোটিন রাখুন।
৩. **দৈনিক হাঁটাচলা:** প্রতিদিন ৩০ মিনিট শারীরিক পরিশ্রম বা হাঁটার অভ্যাস করুন।
৪. **পর্যাপ্ত ঘুম:** রাতে অন্তত ৭-৮ ঘণ্টা গভীর ঘুম নিশ্চিত করুন।
৫. **মানসিক স্বস্তি:** হাসিখুশি থাকুন এবং পরিবার-বন্ধুদের সাথে ইতিবাচক সময় কাটান।

⚠️ *স্মার্ট মেডিকেল নোট: এটি সাধারণ স্বাস্থ্য পরামর্শ। তীব্র অসুস্থতা বা নির্দিষ্ট ওষুধের ক্ষেত্রে প্ল্যাটফর্মের বিশেষজ্ঞ ডাক্তারের পরামর্শ গ্রহণ করুন।*`
    : `🌿 **Essential Daily Health & Wellness Guidelines:**

Here is core medical advice regarding your health inquiry:

1. **Hydrate Fully:** Drink 8-10 glasses of fresh water daily to maintain cellular energy.
2. **Nourish Cleanly:** Fill your meals with whole grains, colorful produce, and clean protein.
3. **Move Daily:** 30 minutes of daily brisk movement enhances immune defenses and mental clarity.
4. **Prioritize Sleep:** Get 7-8 hours of sound sleep for systemic physical and cognitive restoration.
5. **Manage Stress:** Practice deep breathing or mindful relaxation to safeguard cardiovascular health.

⚠️ *Smart Medical Note: This guidance is for preventative health education. For medical diagnoses or prescriptions, please consult a verified specialist on our platform.*`;
};

// @desc    Ask AI health assistant (Gemini Powered)
// @route   POST /api/health-tips/ask-ai
// @access  Public
const askGeminiHealthAi = async (req, res) => {
  try {
    const { question, language = 'auto', history = [] } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a health question.',
      });
    }

    const trimmedQuestion = question.trim();
    const isBengali = language === 'bn' || /[\u0980-\u09FF]/.test(trimmedQuestion);
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    let aiAnswer = null;

    if (apiKey) {
      try {
        const systemPrompt = `You are "Smart Health AI", a friendly, empathetic, and knowledgeable wellness advisor within the Smart Medical App. 
Provide accurate, practical, empathetic, and scientifically backed wellness, nutrition, fitness, and lifestyle advice.
Guidelines:
1. If the user asks in Bengali (বাংলা) or asks for Bengali, answer completely and naturally in fluent Bengali with bullet points and friendly emojis.
2. If in English, answer in clear, motivating, professional English.
3. Structure responses with:
   - Quick, empathetic summary.
   - Actionable health tips (bulleted).
   - What to eat/avoid or simple daily habits.
   - A friendly medical disclaimer: "Note: This is general wellness advice. For persistent symptoms or acute illness, please consult a registered doctor."
4. Keep answers concise, positive, well-formatted, and helpful for mobile reading.`;

        const contents = [];
        if (Array.isArray(history) && history.length > 0) {
          history.slice(-4).forEach((item) => {
            if (item.question) {
              contents.push({ role: 'user', parts: [{ text: item.question }] });
            }
            if (item.answer) {
              contents.push({ role: 'model', parts: [{ text: item.answer }] });
            }
          });
        }
        contents.push({
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nUser Question: ${trimmedQuestion}` }],
        });

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents }),
        });

        if (response.ok) {
          const data = await response.json();
          const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidate && candidate.trim()) {
            aiAnswer = candidate.trim();
          }
        }
      } catch (geminiErr) {
        console.error('Gemini API request failed:', geminiErr.message);
      }
    }

    // Fallback: If Gemini API is not configured or fails, use intelligent medical knowledge base
    if (!aiAnswer) {
      aiAnswer = getHealthKnowledgeFallback(trimmedQuestion, isBengali);
    }

    return res.status(200).json({
      success: true,
      data: {
        question: trimmedQuestion,
        answer: aiAnswer,
        language: isBengali ? 'bn' : 'en',
        source: apiKey ? 'gemini' : 'knowledge-base',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process health query: ' + error.message,
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
  askGeminiHealthAi,
};
