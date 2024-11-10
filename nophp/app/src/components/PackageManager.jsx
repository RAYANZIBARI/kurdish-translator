// PackageManager.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  Save,
  Package,
  Users,
  Key,
  Plus,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import { PackageTypes, PackageLabels, formatPrice } from '../types';

const PackageManager = ({ theme }) => {
  const [packages, setPackages] = useState({});
  const [editingPackage, setEditingPackage] = useState(null);
  const [generatingKeys, setGeneratingKeys] = useState(false);
  const [keys, setKeys] = useState([]);
  const [keyCount, setKeyCount] = useState(1);
  const [selectedPackageType, setSelectedPackageType] = useState(PackageTypes.WEEKLY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  // Load packages data
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/packages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPackages(data.packages);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleUpdatePackage = async (packageType) => {
    if (!editingPackage) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/packages/${packageType}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingPackage)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSuccess('پاکێج هاتە نویکرن');
      setEditingPackage(null);
      fetchPackages();

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKeys = async () => {
    setGeneratingKeys(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/keys/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          packageType: selectedPackageType,
          count: keyCount
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setKeys(data.keys);
      setSuccess(`${keyCount} کلیل هاتنە دروستکرن`);

    } catch (error) {
      setError(error.message);
    } finally {
      setGeneratingKeys(false);
    }
  };

  const copyToClipboard = async (key) => {
    await navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Package Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="kurdish-text">
            رێکخستنێن پاکێجان
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.values(PackageTypes).map(type => (
            <div key={type} className="border-b last:border-0 pb-4 last:pb-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium kurdish-text">
                  {PackageLabels[type]}
                </h3>
                {editingPackage?.type === type ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditingPackage(null)}
                      className="kurdish-text"
                    >
                      بەتالکرن
                    </Button>
                    <Button
                      onClick={() => handleUpdatePackage(type)}
                      disabled={loading}
                      className="kurdish-text"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 ml-2" />
                      )}
                      پاراستن
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setEditingPackage({
                      type,
                      ...packages[type]
                    })}
                    className="kurdish-text"
                  >
                    گوهۆڕین
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium kurdish-text mb-2">
                    سنوورێ رۆژانە
                  </label>
                  <Input
                    type="number"
                    value={editingPackage?.type === type 
                      ? editingPackage.dailyLimit 
                      : packages[type]?.dailyLimit || 0}
                    onChange={(e) => setEditingPackage(prev => ({
                      ...prev,
                      dailyLimit: parseInt(e.target.value)
                    }))}
                    disabled={editingPackage?.type !== type}
                    className="kurdish-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium kurdish-text mb-2">
                    بها
                  </label>
                  <Input
                    type="number"
                    value={editingPackage?.type === type 
                      ? editingPackage.price 
                      : packages[type]?.price || 0}
                    onChange={(e) => setEditingPackage(prev => ({
                      ...prev,
                      price: parseInt(e.target.value)
                    }))}
                    disabled={editingPackage?.type !== type}
                    className="kurdish-text"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 kurdish-text">
                {packages[type]?.activeUsers || 0} بکارهێنەرێن چالاک
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Key Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="kurdish-text">
            دروستکرنا کلیلان
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium kurdish-text mb-2">
                  جۆرێ پاکێجی
                </label>
                <select
                  value={selectedPackageType}
                  onChange={(e) => setSelectedPackageType(e.target.value)}
                  className={`w-full p-2 rounded-md border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-white border-gray-200'
                  } kurdish-text`}
                >
                  {Object.entries(PackageTypes).map(([key, value]) => (
                    <option key={value} value={value}>
                      {PackageLabels[value]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium kurdish-text mb-2">
                  ژمارا کلیلان
                </label>
                <Input
                  type="number"
                  value={keyCount}
                  onChange={(e) => setKeyCount(parseInt(e.target.value))}
                  min="1"
                  max="100"
                  className="kurdish-text"
                />
              </div>
            </div>

            <Button
              onClick={handleGenerateKeys}
              disabled={generatingKeys}
              className="w-full kurdish-text"
            >
              {generatingKeys ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 ml-2" />
              )}
              دروستکرنا کلیلان
            </Button>

            {/* Generated Keys */}
            {keys.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium kurdish-text">
                  کلیلێن دروستکری:
                </h4>
                <div className="space-y-2">
                  {keys.map(key => (
                    <div
                      key={key}
                      className={`flex justify-between items-center p-2 rounded-md ${
                        theme === 'dark'
                          ? 'bg-gray-700'
                          : 'bg-gray-50'
                      }`}
                    >
                      <code className="font-mono text-sm">
                        {key}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(key)}
                      >
                        {copiedKey === key ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      {error && (
        <div className="p-4 rounded-lg bg-red-100 text-red-600 kurdish-text">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-lg bg-green-100 text-green-600 kurdish-text">
          {success}
        </div>
      )}
    </div>
  );
};

export default PackageManager;