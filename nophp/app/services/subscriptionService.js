// services/subscriptionService.js

import { v4 as uuidv4 } from 'uuid';

export const subscriptionPlans = new Map([
  ['free', {
    id: 'free',
    name: 'بێ بەرامبەر',
    dailyLimit: 10,
    monthlyLimit: 300,
    price: 0,
    description: 'رۆژانە ١٠ جاران وەرگێڕانێ'
  }],
  ['weekly', {
    id: 'weekly',
    name: 'هەفتیانە',
    dailyLimit: 20,
    monthlyLimit: 600,
    price: 5000,
    description: 'رۆژانە ٢٠ جاران وەرگێڕانێ'
  }],
  ['monthly', {
    id: 'monthly',
    name: 'هەیڤانە',
    dailyLimit: 30,
    monthlyLimit: 900,
    price: 15000,
    description: 'رۆژانە ٣٠ جاران وەرگێڕانێ'
  }]
]);

// Store for activation keys
export const activationKeys = new Map();

// Store for user usage
export const userUsage = new Map();

// Generate new activation key
export const generateActivationKey = (planId, count = 1) => {
  const keys = [];
  for (let i = 0; i < count; i++) {
    const key = uuidv4();
    activationKeys.set(key, {
      planId,
      used: false,
      createdAt: new Date().toISOString()
    });
    keys.push(key);
  }
  return keys;
};

// Get user's daily usage
export const getUserDailyUsage = (userId) => {
  const today = new Date().toDateString();
  const usage = userUsage.get(userId) || {};
  return usage[today] || 0;
};

// Increment user's usage
export const incrementUserUsage = (userId) => {
  const today = new Date().toDateString();
  const usage = userUsage.get(userId) || {};
  usage[today] = (usage[today] || 0) + 1;
  userUsage.set(userId, usage);
  return usage[today];
};

// Check if user has reached their daily limit
export const checkUserLimit = (user) => {
  if (!user) return false;
  
  const plan = subscriptionPlans.get(user.subscription?.planId || 'free');
  if (!plan) return false;

  // Check if subscription has expired
  if (user.subscription?.expiresAt) {
    const expiryDate = new Date(user.subscription.expiresAt);
    if (expiryDate < new Date()) {
      return false;
    }
  }

  const dailyUsage = getUserDailyUsage(user.id);
  return dailyUsage < plan.dailyLimit;
};

// Get user's remaining translations for today
export const getRemainingTranslations = (user) => {
  const plan = subscriptionPlans.get(user.subscription?.planId || 'free');
  if (!plan) return 0;

  const dailyUsage = getUserDailyUsage(user.id);
  return Math.max(0, plan.dailyLimit - dailyUsage);
};

// Validate activation key
export const validateActivationKey = (key) => {
  const keyData = activationKeys.get(key);
  if (!keyData) return null;
  if (keyData.used) return null;
  return keyData;
};

// Activate subscription for user
export const activateSubscription = (user, keyData) => {
  const plan = subscriptionPlans.get(keyData.planId);
  if (!plan) return null;

  const durationInDays = keyData.planId === 'weekly' ? 7 : 30;
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + durationInDays);

  return {
    planId: keyData.planId,
    activatedAt: new Date().toISOString(),
    expiresAt: expiryDate.toISOString()
  };
};

// Get subscription status and details
export const getSubscriptionStatus = (user) => {
  if (!user?.subscription) {
    return {
      planId: 'free',
      status: 'active',
      remainingTranslations: getRemainingTranslations(user)
    };
  }

  const expiryDate = new Date(user.subscription.expiresAt);
  const isExpired = expiryDate < new Date();

  return {
    planId: isExpired ? 'free' : user.subscription.planId,
    status: isExpired ? 'expired' : 'active',
    expiresAt: user.subscription.expiresAt,
    remainingTranslations: getRemainingTranslations(user),
    plan: subscriptionPlans.get(isExpired ? 'free' : user.subscription.planId)
  };
};