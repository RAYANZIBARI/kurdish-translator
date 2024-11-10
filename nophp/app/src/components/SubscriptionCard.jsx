// components/SubscriptionCard.jsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  Check,
  X,
  Loader2,
  Clock,
  Shield
} from 'lucide-react';

const SubscriptionCard = ({ theme, plan, userSubscription, onActivate }) => {
  const [activationKey, setActivationKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showActivation, setShowActivation] = useState(false);

  const isCurrentPlan = userSubscription?.planId === plan.id;
  const isExpired = userSubscription?.expiresAt && new Date(userSubscription.expiresAt) < new Date();

  const handleActivate = async () => {
    if (!activationKey.trim()) {
      setError('تکایە کلیلا چالاککرنێ بنڤیسە');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onActivate(activationKey);
      setShowActivation(false);
      setActivationKey('');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`relative ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    } ${isCurrentPlan && !isExpired ? 'ring-2 ring-blue-500' : ''}`}>
      {isCurrentPlan && !isExpired && (
        <div className="absolute -top-3 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm kurdish-text">
          پاکێجا نوکە
        </div>
      )}

      <CardHeader>
        <CardTitle className="kurdish-text text-xl flex justify-between items-center">
          <span>{plan.name}</span>
          <span className="text-2xl font-bold">
            {plan.price > 0 ? `${plan.price} دینار` : 'بێ بەرامبەر'}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Features */}
        <ul className="space-y-2">
          <li className="flex items-center gap-2 kurdish-text">
            <Check className="h-5 w-5 text-green-500" />
            <span>رۆژانە {plan.dailyLimit} جار وەرگێڕان</span>
          </li>
          <li className="flex items-center gap-2 kurdish-text">
            <Check className="h-5 w-5 text-green-500" />
            <span>هەیڤانە {plan.monthlyLimit} جار وەرگێڕان</span>
          </li>
          {plan.id !== 'free' && (
            <li className="flex items-center gap-2 kurdish-text">
              <Check className="h-5 w-5 text-green-500" />
              <span>پشتەڤانیا پێشکەفتی</span>
            </li>
          )}
        </ul>

        {/* Subscription Status */}
        {isCurrentPlan && (
          <div className={`p-3 rounded-lg ${
            isExpired
              ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
              : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
          }`}>
            <div className="flex items-center gap-2 kurdish-text">
              <Clock className="h-5 w-5" />
              {isExpired ? (
                <span>پاکێج بسەرچوو</span>
              ) : (
                <span>
                  بەردەوام هەتا {new Date(userSubscription.expiresAt).toLocaleDateString('ku')}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Activation Form */}
        {showActivation ? (
          <div className="space-y-3">
            <Input
              value={activationKey}
              onChange={(e) => {
                setActivationKey(e.target.value);
                setError('');
              }}
              placeholder="کلیلا چالاککرنێ"
              className="kurdish-text"
            />
            {error && (
              <p className="text-sm text-red-500 kurdish-text">{error}</p>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowActivation(false);
                  setError('');
                  setActivationKey('');
                }}
                className="flex-1 kurdish-text"
              >
                بەتالکرن
              </Button>
              <Button
                onClick={handleActivate}
                disabled={loading}
                className="flex-1 kurdish-text"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span>چالاککرن</span>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setShowActivation(true)}
            className="w-full kurdish-text"
            variant={plan.id === 'free' ? 'outline' : 'default'}
          >
            <Shield className="h-5 w-5 mr-2" />
            {plan.id === 'free' ? 'بکارئینانا بێ بەرامبەر' : 'چالاککرن'}
          </Button>
        )}

        {/* Free Trial Note */}
        {plan.id === 'free' && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center kurdish-text">
            بێ پێتڤی ب کلیلا چالاککرنێ
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;