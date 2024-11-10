// components/SubscriptionsPage.jsx
import React, { useState, useEffect } from 'react';
import SubscriptionCard from './SubscriptionCard';
import { subscriptionPlans } from '../../services/subscriptionService';

const SubscriptionsPage = ({ theme }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleActivate = async (activationKey) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ activationKey })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Update user in local storage
      const updatedUser = { ...user, subscription: data.subscription };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

    } catch (error) {
      throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center kurdish-text">
        پاکێجێن بەردەست
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...subscriptionPlans.values()].map(plan => (
          <SubscriptionCard
            key={plan.id}
            plan={plan}
            theme={theme}
            userSubscription={user?.subscription}
            onActivate={handleActivate}
          />
        ))}
      </div>

      {/* Usage Stats */}
      {user && (
        <div className={`mt-8 p-4 rounded-lg ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-gray-50 border border-gray-200'
        }`}>
          <h2 className="text-xl font-bold mb-4 kurdish-text">
            زانیاریێن بکارئینانێ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="kurdish-text">
              <span className="text-gray-500 dark:text-gray-400">پاکێجا نوکە:</span>
              <span className="font-bold ml-2">
                {subscriptionPlans.get(user.subscription?.planId || 'free').name}
              </span>
            </div>
            <div className="kurdish-text">
              <span className="text-gray-500 dark:text-gray-400">وەرگێڕانێن مای:</span>
              <span className="font-bold ml-2">
                {user.remainingTranslations || 0} جار
              </span>
            </div>
            {user.subscription?.expiresAt && (
              <div className="kurdish-text">
                <span className="text-gray-500 dark:text-gray-400">دەمێ مای:</span>
                <span className="font-bold ml-2">
                  {new Date(user.subscription.expiresAt).toLocaleDateString('ku')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;