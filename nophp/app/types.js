// types.js
export const PackageTypes = {
    FREE: 'free',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly'
  };
  
  export const PackageLabels = {
    [PackageTypes.FREE]: 'ساکار',
    [PackageTypes.WEEKLY]: 'هەفتیانە',
    [PackageTypes.MONTHLY]: 'هەیڤانە'
  };
  
  export const TranslationLimits = {
    [PackageTypes.FREE]: {
      dailyLimit: 10,
      price: 0,
      durationDays: 0
    },
    [PackageTypes.WEEKLY]: {
      dailyLimit: 20,
      price: 5000,
      durationDays: 7
    },
    [PackageTypes.MONTHLY]: {
      dailyLimit: 30,
      price: 15000,
      durationDays: 30
    }
  };
  
  export const formatPrice = (price) => {
    return price.toLocaleString('ku-IQ', {
      style: 'currency',
      currency: 'IQD'
    });
  };
  
  export const calculateRemainingTranslations = (user, packageConfig) => {
    if (!user.translations) return packageConfig.dailyLimit;
    
    const now = new Date();
    const lastReset = new Date(user.translations.lastReset);
    
    if (now.toDateString() !== lastReset.toDateString()) {
      return packageConfig.dailyLimit;
    }
    
    return packageConfig.dailyLimit - (user.translations.dailyCount || 0);
  };
  
  export const isPackageExpired = (user) => {
    if (!user.packageExpiry) return true;
    return new Date(user.packageExpiry) < new Date();
  };