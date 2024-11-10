
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Initialize environment variables
dotenv.config();

// App configuration
const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Increased limit for request body size
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());



// Check subscription middleware
const checkSubscription = async (req, res, next) => {
  try {
    const user = users.get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'بکارهێنەر نەهاتە دیتن' });
    }

    // Get user's subscription status
    const subscriptionStatus = getSubscriptionStatus(user);
    
    if (!checkUserLimit(user)) {
      return res.status(403).json({ 
        error: 'تۆ گەهشتیە سنوورێ وەرگێڕانێ',
        subscriptionStatus
      });
    }

    // Add subscription status to request
    req.subscriptionStatus = subscriptionStatus;
    next();
  } catch (error) {
    res.status(500).json({ error: 'هەڵەیەک رویدا د پشکنینا پاکێجێ دا' });
  }
};
// In-memory storage (replace with database in production)
const users = new Map();
const translations = new Map(); // For caching translations
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'پێتڤی ب چوونەژوورێ یە' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'نیشانا چوونەژوورێ یا دەربازبووی' });
        }
        return res.status(403).json({ error: 'نیشانا چوونەژوورێ نەدروستە' });
      }
      
      // Check if user still exists
      const currentUser = users.get(user.id);
      if (!currentUser) {
        return res.status(404).json({ error: 'بکارهێنەر نەهاتە دیتن' });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    res.status(500).json({ error: 'هەڵەیەک رویدا د پشکنینا token دا' });
  }
};

// Validation helpers
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => /^\+?\d{10,}$/.test(phone);

// Retry configuration
const RETRY_DELAYS = [1000, 2000, 4000];
const MAX_RETRIES = 3;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Completely revised Behdini prompt with extensive dialect-specific instructions
const createBehdiniPrompt = (text) => `
تۆ پسپۆرەکێ وەرگێڕانێ یێ شارەزایی د زاراڤێ بەهدینی دا. وەرگێڕانا تە دڤێت دروست وەکی خەلکێ دەڤەرا بەهدینان (دهۆک، زاخۆ، ئاکرێ، ئامێدیێ) دئاخڤن بیت.

رێنڤیس و رێزمانا دروست یا بەهدینی:

١. رێنڤیسا دروست یا پەیڤێن بنەڕەتی:
- "دڤێت" نە "دبێت/دەڤێت"
- "هندەک" نە "هەندێک/هندێک"
- "چەوا" نە "چاوا"
- "کیڤە" نە "کیفە"
- "ئێک" نە "یەک"
- "تشت" نە "شت"
- "هەمی" نە "هەموو"
- "ژی" نە "جی"
- "کەنگی" نە "کەنگێ"
- "نوکە" نە "نها/ئێستا"

٢. دەمێن کاری:
دەمێ نوکە:
- "دئاخڤم" نە "دئاخفم"
- "دبێژم" نە "دبیژم"
- "دبینم" نە "دبینیم"
- "دخوینم" نە "دخوینیم"
نەرێکرن: "ناخوینم" نە "ناخوینیم"

دەمێ داهاتی:
- "دێ بێژم" نە "دێ بیژم"
- "دێ بینم" نە "دێ بینیم"
نەرێکرن: "نابێژم" نە "نابیژم"

٣. جهناڤ و خودانی:
جهناڤێن کەسی:
- "ئەز، تۆ، ئەو" (سەربەخۆ)
- "من، تە، وی/وێ" (خودانی)
نموونە:
- "کتێبا من" نە "کتێبێ من"
- "مالا مە" نە "مالێ مە"
- "براێ وی" نە "برایێ وی"

٤. قەیدێن دەمی و جهی:
- "ل ڤێرێ" نە "لڤێرە"
- "ل وێرێ" نە "لوێرە"
- "د ناڤ دا" نە "دناڤدا"
- "د گەل" نە "دگەل"
- "ژ بۆ" نە "ژبۆ"

٥. گرێدانا پەیڤان:
- "ئەڤ کتێبە" نە "ئەڤکتێبە"
- "ئەڤ جارە" نە "ئەڤجارە"
- "ئەڤ رۆژە" نە "ئەڤرۆژە"

دەقێ بۆ وەرگێڕانێ: "${text}"

تکایە:
١. تنێ وەرگێڕانێ بدە، بێ هیچ روونکرن یان زێدەکرن
٢. دلنیابە کو رێنڤیس و رێزمانا بەهدینی یا دروست هاتیە بکارئینان
٣. وەرگێڕانێ وەکی ئاخفتنا رۆژانە یا خەلکێ دەڤەرێ بکە`;

async function retryRequest(apiCall, retryCount = 0) {
  try {
    return await apiCall();
  } catch (error) {
    const shouldRetry = (
      retryCount < MAX_RETRIES &&
      (error.response?.status === 529 ||
       error.response?.status === 503 ||
       error.response?.status === 500 ||
       error.code === 'ECONNRESET' ||
       error.code === 'ETIMEDOUT')
    );

    if (shouldRetry) {
      console.log(`هەوڵدانا ${retryCount + 1} پشتی ${RETRY_DELAYS[retryCount]}ms`);
      await delay(RETRY_DELAYS[retryCount]);
      return retryRequest(apiCall, retryCount + 1);
    }

    throw error;
  }
}

const sanitizeTranslation = (text) => {
  return text
    .replace(/["'"]/g, '')
    .replace(/Translation:|Behdini:|Kurdish:|Badini:|Here's the translation:|In Behdini this would be:/gi, '')
    .replace(/وەرگێڕان:|بەهدینی:|کوردی:|بادینی:|ب بەهدینی:|وەرگێڕان بۆ بەهدینی:/gi, '')
    .replace(/^\s+|\s+$/g, '')
    .replace(/\n+/g, ' ')
    .trim();
};

const makeTranslationRequest = async (prompt, apiKey) => {
  const headers = {
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
    'x-api-key': apiKey
  };

  return await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: "claude-3-sonnet-20240229",
      max_tokens: 1024,
      temperature: 0.1, // Lower temperature for more consistent translations
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    },
    { headers }
  );
};


// Admin middleware
const isAdmin = (req, res, next) => {
  try {
    const user = users.get(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'تە دەستهەلات نینە' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'هەڵەیەک رویدا' });
  }
};

// Get all users
app.get('/api/admin/users', authenticateToken, isAdmin, (req, res) => {
  try {
    const usersList = [...users.values()].map(user => {
      const { password, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        lastLogin: user.lastLogin || null,
        status: user.status || 'active'
      };
    });

    res.json({ users: usersList });
  } catch (error) {
    res.status(500).json({ error: 'هەڵەیەک رویدا د وەرگرتنا زانیاریان دا' });
  }
});

// Get single user
app.get('/api/admin/users/:userId', authenticateToken, isAdmin, (req, res) => {
  try {
    const user = users.get(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'بکارهێنەر نەهاتە دیتن' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'هەڵەیەک رویدا د وەرگرتنا زانیاریان دا' });
  }
});

// Update user
app.put('/api/admin/users/:userId', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, email, phone, status, role } = req.body;
    const user = users.get(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: 'بکارهێنەر نەهاتە دیتن' });
    }

    // Validate email if changed
    if (email && email !== user.email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'ئیمەیلا نەدروستە' });
      }
      if ([...users.values()].some(u => u.id !== user.id && u.email === email)) {
        return res.status(400).json({ error: 'ئەڤ ئیمەیلە بەری نوکە هاتیە بکارئینان' });
      }
    }

    // Validate phone if changed
    if (phone && phone !== user.phone && !isValidPhone(phone)) {
      return res.status(400).json({ error: 'ژمارا تەلەفۆنێ نەدروستە' });
    }

    // Update user
    const updatedUser = {
      ...user,
      name: name || user.name,
      email: email || user.email,
      phone: phone || user.phone,
      status: status || user.status,
      role: role || user.role,
      updatedAt: new Date().toISOString()
    };

    users.set(user.id, updatedUser);

    const { password, ...userWithoutPassword } = updatedUser;
    res.json({
      message: 'زانیاریێن بکارهێنەری هاتنە نویکرن',
      user: userWithoutPassword
    });

  } catch (error) {
    res.status(500).json({ error: 'هەڵەیەک رویدا د نویکرنا زانیاریان دا' });
  }
});

// Delete user
app.delete('/api/admin/users/:userId', authenticateToken, isAdmin, (req, res) => {
  try {
    const user = users.get(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'بکارهێنەر نەهاتە دیتن' });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'تۆ نەشێی هەژمارا خۆ ژێببەی' });
    }

    users.delete(req.params.userId);
    res.json({ message: 'هەژمار هاتە ژێبرن' });

  } catch (error) {
    res.status(500).json({ error: 'هەڵەیەک رویدا د ژێبرنا هەژماری دا' });
  }
});

// Block/Unblock user
app.put('/api/admin/users/:userId/status', authenticateToken, isAdmin, (req, res) => {
  try {
    const { status } = req.body;
    const user = users.get(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: 'بکارهێنەر نەهاتە دیتن' });
    }

    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json({ error: 'بارێ نەدروست' });
    }

    // Prevent admin from blocking themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'تۆ نەشێی هەژمارا خۆ بلۆک بکەی' });
    }

    user.status = status;
    user.updatedAt = new Date().toISOString();
    users.set(user.id, user);

    const { password, ...userWithoutPassword } = user;
    res.json({
      message: status === 'blocked' ? 'هەژمار هاتە بلۆککرن' : 'هەژمار هاتە چالاککرن',
      user: userWithoutPassword
    });

  } catch (error) {
    res.status(500).json({ error: 'هەڵەیەک رویدا' });
  }
});

// Get subscription plans
app.get('/api/plans', (req, res) => {
  try {
    const plansList = [...subscriptionPlans.values()].map(plan => ({
      ...plan,
      features: [
        `رۆژانە ${plan.dailyLimit} جار وەرگێڕان`,
        `هەیڤانە ${plan.monthlyLimit} جار وەرگێڕان`,
        plan.id !== 'free' ? 'پشتەڤانیا پێشکەفتی' : null
      ].filter(Boolean)
    }));

    res.json({ plans: plansList });
  } catch (error) {
    res.status(500).json({ error: 'هەڵەیەک رویدا د وەرگرتنا پاکێجان دا' });
  }
});

// Get subscription status
app.get('/api/subscription/status', authenticateToken, (req, res) => {
  try {
    const user = users.get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'بکارهێنەر نەهاتە دیتن' });
    }

    const status = getSubscriptionStatus(user);
    res.json({ status });
  } catch (error) {
    res.status(500).json({ error: 'هەڵەیەک رویدا د وەرگرتنا زانیاریێن پاکێجێ دا' });
  }
});

// Activate subscription with key
app.post('/api/subscription/activate', authenticateToken, async (req, res) => {
  try {
    const { activationKey } = req.body;
    const user = users.get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'بکارهێنەر نەهاتە دیتن' });
    }

    const keyData = validateActivationKey(activationKey);
    if (!keyData) {
      return res.status(400).json({ error: 'کلیلا چالاککرنێ نەدروستە یان هاتیە بکارئینان' });
    }

    // Check if user already has active subscription
    const currentStatus = getSubscriptionStatus(user);
    if (currentStatus.status === 'active' && currentStatus.planId !== 'free') {
      return res.status(400).json({ error: 'تە پاکێجەکا چالاک هەیە' });
    }

    // Activate subscription
    const subscription = activateSubscription(user, keyData);
    if (!subscription) {
      return res.status(400).json({ error: 'پاکێجا نەدروستە' });
    }

    // Update user subscription
    user.subscription = subscription;
    users.set(user.id, user);

    // Mark key as used
    keyData.used = true;
    keyData.usedBy = user.id;
    keyData.usedAt = new Date().toISOString();
    activationKeys.set(activationKey, keyData);

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      message: 'پاکێج هاتە چالاککرن',
      user: userWithoutPassword,
      subscriptionStatus: getSubscriptionStatus(user)
    });

  } catch (error) {
    res.status(500).json({ error: 'هەڵەیەک رویدا د چالاککرنا پاکێجێ دا' });
  }
});

// Admin Endpoints

// Get all activation keys
app.get('/api/admin/keys', authenticateToken, isAdmin, (req, res) => {
  try {
    const keysList = [...activationKeys.entries()].map(([key, data]) => ({
      key,
      ...data,
      planName: subscriptionPlans.get(data.planId)?.name
    }));

    res.json({ keys: keysList });
  } catch (error) {
    res.status(500).json({ error: 'هەڵەیەک رویدا د وەرگرتنا کلیلان دا' });
  }
});

// Generate activation keys
app.post('/api/admin/keys/generate', authenticateToken, isAdmin, (req, res) => {
  try {
    const { planId, count = 1 } = req.body;

    if (!subscriptionPlans.has(planId)) {
      return res.status(400).json({ error: 'پاکێجا نەدروستە' });
    }

    if (count < 1 || count > 100) {
      return res.status(400).json({ error: 'ژمارا کلیلان دڤێت د ناڤبەرا 1 و 100 دا بیت' });
    }

    const keys = generateActivationKey(planId, count);
    res.json({
      message: 'کلیل هاتنە دروستکرن',
      keys: keys.map(key => ({
        key,
        planId,
        planName: subscriptionPlans.get(planId).name,
        createdAt: new Date().toISOString(),
        used: false
      }))
    });

  } catch (error) {
    res.status(500).json({ error: 'هەڵەیەک رویدا د دروستکرنا کلیلان دا' });
  }
});

// Update subscription plan
app.put('/api/admin/plans/:planId', authenticateToken, isAdmin, (req, res) => {
  try {
    const { planId } = req.params;
    const { dailyLimit, price } = req.body;

    const plan = subscriptionPlans.get(planId);
    if (!plan) {
      return res.status(404).json({ error: 'پاکێج نەهاتە دیتن' });
    }

    if (dailyLimit < 1) {
      return res.status(400).json({ error: 'سنوورێ رۆژانە دڤێت ژ 1 مەزنتر بیت' });
    }

    if (price < 0) {
      return res.status(400).json({ error: 'بها ناشێت ژ 0 کێمتر بیت' });
    }

    // Update plan
    plan.dailyLimit = dailyLimit;
    plan.monthlyLimit = dailyLimit * 30;
    plan.price = price;

    subscriptionPlans.set(planId, plan);

    res.json({
      message: 'پاکێج هاتە نویکرن',
      plan
    });

  } catch (error) {
    res.status(500).json({ error: 'هەڵەیەک رویدا د نویکرنا پاکێجێ دا' });
  }
});
// Get system stats
app.get('/api/admin/stats', authenticateToken, isAdmin, (req, res) => {
  try {
    const totalUsers = users.size;
    const activeUsers = [...users.values()].filter(u => u.status === 'active').length;
    const blockedUsers = [...users.values()].filter(u => u.status === 'blocked').length;
    const newUsersToday = [...users.values()].filter(u => {
      const created = new Date(u.createdAt);
      const today = new Date();
      return created.toDateString() === today.toDateString();
    }).length;

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        blockedUsers,
        newUsersToday
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'هەڵەیەک رویدا د وەرگرتنا ئامارێن سیستەمی دا' });
  }
});// Updated translation endpoint with subscription check
app.post('/api/translate', authenticateToken, checkSubscription, async (req, res) => {
  try {
    const apiKey = process.env.VITE_CLAUDE_API_KEY;
    const { text, dialect = 'both' } = req.body;
    const user = users.get(req.user.id);
    
    if (!apiKey) {
      throw new Error('کلیلا API نەهاتیە دانان');
    }

    if (!text) {
      throw new Error('هیچ دەق نەهاتیە دان بۆ وەرگێڕانێ');
    }

    // Check translation limit
    if (!checkUserLimit(user)) {
      return res.status(403).json({
        error: 'تۆ گەهشتیە سنوورێ وەرگێڕانێ یێ رۆژانە',
        subscriptionStatus: getSubscriptionStatus(user)
      });
    }

    const translations = { behdini: '', sorani: '' };
    let translationSaved = false;

    try {
      // Behdini translation
      if (dialect === 'both' || dialect === 'behdini') {
        const response = await retryRequest(() => 
          makeTranslationRequest(createBehdiniPrompt(text), apiKey)
        );

        if (response.data.content && response.data.content[0]) {
          translations.behdini = sanitizeTranslation(response.data.content[0].text);
        } else {
          throw new Error('بەرسڤا API یا نەدروستە');
        }
      }

      // Sorani translation
      if (dialect === 'both' || dialect === 'sorani') {
        const response = await retryRequest(() =>
          makeTranslationRequest(
            `Translate the following text to Sorani Kurdish, providing ONLY the translation without any additional commentary or explanations:\n\n"${text}"`,
            apiKey
          )
        );
        
        if (response.data.content && response.data.content[0]) {
          translations.sorani = sanitizeTranslation(response.data.content[0].text);
        } else {
          throw new Error('بەرسڤا API یا نەدروستە');
        }
      }

      if (!translations.behdini && !translations.sorani) {
        throw new Error('نەشیا هیچ وەرگێڕانەک ب دەست بینیت');
      }

      // Increment usage only if translation was successful
      incrementUserUsage(user.id);
      translationSaved = true;

      // Save translation to history
      const translationHistory = {
        id: uuidv4(),
        userId: user.id,
        originalText: text,
        translations,
        dialect,
        timestamp: new Date().toISOString()
      };

      // Store in translation history (you'll need to create this Map)
      if (!global.translationHistory) {
        global.translationHistory = new Map();
      }
      global.translationHistory.set(translationHistory.id, translationHistory);

      // Get updated subscription status
      const subscriptionStatus = getSubscriptionStatus(user);

      res.json({ 
        translations,
        subscriptionStatus,
        translationId: translationHistory.id
      });
      
    } catch (error) {
      // If translation was counted but failed, decrement the usage
      if (translationSaved) {
        const today = new Date().toDateString();
        const usage = userUsage.get(user.id) || {};
        usage[today] = Math.max(0, (usage[today] || 0) - 1);
        userUsage.set(user.id, usage);
      }

      throw error;
    }
    
  } catch (error) {
    console.error('هەڵەیا وەرگێڕانێ:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      retryAttempts: error.retryAttempts,
      userId: req.user?.id
    });
    
    res.status(500).json({
      error: 'وەرگێڕان سەرنەکەفت: ' + (error.response?.data?.error?.message || error.message),
      retryAttempts: error.retryAttempts,
      subscriptionStatus: getSubscriptionStatus(users.get(req.user?.id))
    });
  }
});

// Get user's translation history
app.get('/api/translations/history', authenticateToken, (req, res) => {
  try {
    if (!global.translationHistory) {
      return res.json({ translations: [] });
    }

    const userTranslations = [...global.translationHistory.values()]
      .filter(t => t.userId === req.user.id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ translations: userTranslations });
  } catch (error) {
    res.status(500).json({ error: 'هەڵەیەک رویدا د وەرگرتنا دیرۆکێ دا' });
  }
});

// Delete translation from history
app.delete('/api/translations/:id', authenticateToken, (req, res) => {
  try {
    const translation = global.translationHistory?.get(req.params.id);
    
    if (!translation) {
      return res.status(404).json({ error: 'وەرگێڕان نەهاتە دیتن' });
    }

    if (translation.userId !== req.user.id) {
      return res.status(403).json({ error: 'تە دەستهەلات نینە' });
    }

    global.translationHistory.delete(req.params.id);
    res.json({ message: 'وەرگێڕان هاتە ژێبرن' });

  } catch (error) {
    res.status(500).json({ error: 'هەڵەیەک رویدا د ژێبرنا وەرگێڕانێ دا' });
  }
});

// Clear all translation history
app.delete('/api/translations', authenticateToken, (req, res) => {
  try {
    if (!global.translationHistory) {
      return res.json({ message: 'دیرۆک هاتە پاقژکرن' });
    }

    // Remove only user's translations
    for (const [id, translation] of global.translationHistory.entries()) {
      if (translation.userId === req.user.id) {
        global.translationHistory.delete(id);
      }
    }

    res.json({ message: 'دیرۆک هاتە پاقژکرن' });
  } catch (error) {
    res.status(500).json({ error: 'هەڵەیەک رویدا د پاقژکرنا دیرۆکێ دا' });
  }
});
// 2. Authentication endpoints
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'هەمی زانیاری پێتڤینە' });
    }

    // Validate inputs
    if (name.length < 3) {
      return res.status(400).json({ error: 'ناڤ دڤێت ژ 3 پیتان درێژتر بیت' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'ئیمەیلا نەدروستە' });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'ژمارا تەلەفۆنێ نەدروستە' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'پاسوۆرد دڤێت ژ 8 پیتان درێژتر بیت' });
    }

    // Check for existing email
    if ([...users.values()].some(user => user.email === email)) {
      return res.status(400).json({ error: 'ئەڤ ئیمەیلە بەری نوکە هاتیە بکارئینان' });
    }

    // Create user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Add role and status
    const user = {
      id: uuidv4(),
      name,
      email,
      phone,
      password: await bcrypt.hash(password, 10),
      role: 'user', // Default role
      status: 'active', // Default status
      createdAt: new Date().toISOString()
    };


    // Make first user admin
    if (users.size === 0) {
      user.role = 'admin';
    }

    users.set(user.id, user);

    // Generate token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'هەژمار هاتە دروستکرن',
      user: userWithoutPassword,
      token
    });
    

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'هەڵەیەک رویدا: ' + error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = [...users.values()].find(u => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'ئیمەیل یان پاسوۆرد نەدروستە' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'چوونەژوور سەرکەفت',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'هەڵەیەک رویدا: ' + error.message });
  }
});

// 3. Profile endpoints
app.get('/api/profile', authenticateToken, (req, res) => {
  try {
    const user = users.get(req.user.id);
    if (!user) return res.status(404).json({ error: 'بکارهێنەر نەهاتە دیتن' });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'هەڵەیەک رویدا: ' + error.message });
  }
});
app.put('/api/profile/update', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, avatar } = req.body;
    const user = users.get(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'بکارهێنەر نەهاتە دیتن' });
    }

    // Validate updated data
    if (email !== user.email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'ئیمەیلا نەدروستە' });
      }
      if ([...users.values()].some(u => u.id !== user.id && u.email === email)) {
        return res.status(400).json({ error: 'ئەڤ ئیمەیلە بەری نوکە هاتیە بکارئینان' });
      }
    }

    if (phone !== user.phone && !isValidPhone(phone)) {
      return res.status(400).json({ error: 'ژمارا تەلەفۆنێ نەدروستە' });
    }

    // Update user
    const updatedUser = {
      ...user,
      name: name || user.name,
      email: email || user.email,
      phone: phone || user.phone,
      avatar: avatar || user.avatar,
      updatedAt: new Date().toISOString()
    };

    users.set(user.id, updatedUser);

    // Generate new token
    const newToken = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return response without password
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json({
      message: 'پرۆفایل هاتە نویکرن',
      user: userWithoutPassword,
      token: newToken // نویکرنا token
    });

  } catch (error) {
    res.status(500).json({ error: 'هەڵەیەک رویدا: ' + error.message });
  }
});

// 4. Password change endpoint
app.put('/api/profile/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = users.get(req.user.id);
    if (!user) return res.status(404).json({ error: 'بکارهێنەر نەهاتە دیتن' });
// دوماهیکا کۆدا change-password
if (!(await bcrypt.compare(currentPassword, user.password))) {
  return res.status(400).json({ error: 'پاسوۆردا نوکە نەدروستە' });
}

// Validate new password
if (newPassword.length < 8) {
  return res.status(400).json({ error: 'پاسوۆرد دڤێت ژ 8 پیتان درێژتر بیت' });
}

// Update password
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(newPassword, salt);
user.password = hashedPassword;
user.updatedAt = new Date().toISOString();
users.set(user.id, user);

res.json({ message: 'پاسوۆرد هاتە نویکرن' });

} catch (error) {
res.status(500).json({ error: 'هەڵەیەک رویدا: ' + error.message });
}
});

// 5. Delete account endpoint
app.delete('/api/profile', authenticateToken, async (req, res) => {
try {
const { password } = req.body;
const user = users.get(req.user.id);
if (!user) return res.status(404).json({ error: 'بکارهێنەر نەهاتە دیتن' });

if (!(await bcrypt.compare(password, user.password))) {
  return res.status(400).json({ error: 'پاسوۆرد نەدروستە' });
}

users.delete(req.user.id);
res.json({ message: 'هەژمار هاتە ژێبرن' });

} catch (error) {
res.status(500).json({ error: 'هەڵەیەک رویدا: ' + error.message });
}
});



app.post('/api/translate-word', async (req, res) => {
  try {
    const { word } = req.body;
    
    // Read dictionary
    const dictionary = require('./bahdini-dictionary.json');
    
    // Search in all categories
    let translation = null;
    for (const category in dictionary) {
      if (dictionary[category][word]) {
        translation = dictionary[category][word];
        break;
      }
    }
    
    if (!translation) {
      // If word not found in dictionary, use API for translation
      const apiResponse = await makeTranslationRequest(
        createBehdiniPrompt(word),
        process.env.VITE_CLAUDE_API_KEY
      );
      translation = sanitizeTranslation(apiResponse.data.content[0].text);
    }
    
    res.json({ translation });
  } catch (error) {
    res.status(500).json({
      error: 'وەرگێڕان سەرنەکەفت: ' + error.message
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'باش',
    timestamp: new Date().toISOString()
  });
});


app.listen(port, () => {
  console.log(`سێرڤەرێ وەرگێڕانا کوردی ل سەر پۆرتا ${port} کاردکەت`);
});