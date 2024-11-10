// components/AdminSubscriptionPanel.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  Loader2,
  Download,
  Key,
  RefreshCw,
  Copy,
  Check,
  Search,
  Filter,
  X,
  FileText
} from 'lucide-react';

const AdminSubscriptionPanel = ({ theme }) => {
  const [plans, setPlans] = useState([]);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [keyCount, setKeyCount] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Load plans and keys
  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, keysRes] = await Promise.all([
        fetch('http://localhost:3001/api/admin/plans', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('http://localhost:3001/api/admin/keys', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      const [plansData, keysData] = await Promise.all([
        plansRes.json(),
        keysRes.json()
      ]);

      setPlans(plansData.plans);
      setKeys(keysData.keys);
    } catch (error) {
      setError('هەڵەیەک رویدا د بارکرنا زانیاریان دا');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Generate new keys
  const handleGenerateKeys = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/admin/keys/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          count: keyCount
        })
      });

      const data = await response.json();
      
      // Add new keys to the list
      setKeys(prevKeys => [...data.keys, ...prevKeys]);
      
      // Export to text file
      const keysText = data.keys.map(k => 
        `${k.key} - ${selectedPlan.name} - ${new Date().toLocaleDateString('ku')}`
      ).join('\n');
      
      const blob = new Blob([keysText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `keys-${selectedPlan.id}-${new Date().toISOString()}.txt`;
      a.click();
      URL.revokeObjectURL(url);

    } catch (error) {
      setError('هەڵەیەک رویدا د دروستکرنا کلیلان دا');
    } finally {
      setLoading(false);
    }
  };

  // Update plan
  const handleUpdatePlan = async () => {
    if (!editingPlan) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/admin/plans/${editingPlan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          dailyLimit: editingPlan.dailyLimit,
          price: editingPlan.price
        })
      });

      const data = await response.json();
      
      // Update plans list
      setPlans(prevPlans => 
        prevPlans.map(p => p.id === editingPlan.id ? data.plan : p)
      );
      
      setShowEditPlanModal(false);
      setEditingPlan(null);

    } catch (error) {
      setError('هەڵەیەک رویدا د نویکرنا پاکێجێ دا');
    } finally {
      setLoading(false);
    }
  };

  // Copy key to clipboard
  const handleCopyKey = async (key) => {
    await navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filter keys
  const filteredKeys = keys.filter(key => {
    const matchesSearch = key.key.includes(searchTerm) ||
                         key.planName.includes(searchTerm);
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'used') return matchesSearch && key.used;
    return matchesSearch && !key.used;
  });

  return (
    <div className="space-y-6">
      {/* Plans Management */}
      <Card>
        <CardHeader>
          <CardTitle className="kurdish-text flex justify-between items-center">
            <span>بەڕێڤەبرنا پاکێجان</span>
            <Button
              variant="outline"
              onClick={loadData}
              className="kurdish-text"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              نویکرن
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map(plan => (
              <div
                key={plan.id}
                className={`p-4 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold kurdish-text">{plan.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 kurdish-text">
                      {plan.dailyLimit} جار رۆژانە
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{plan.price} دینار</p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setEditingPlan(plan);
                    setShowEditPlanModal(true);
                  }}
                  className="w-full kurdish-text"
                >
                  گوهۆڕین
                </Button>
              </div>
            ))}
          </div>
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
              <select
                value={selectedPlan?.id || ''}
                onChange={(e) => setSelectedPlan(plans.find(p => p.id === e.target.value))}
                className={`flex-1 rounded-lg border px-3 py-2 kurdish-text ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-200'
                }`}
              >
                <option value="">هەلبژێرە پاکێجەک</option>
                {plans.map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.name}</option>
                ))}
              </select>
              
              <Input
                type="number"
                value={keyCount}
                onChange={(e) => setKeyCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                min="1"
                max="100"
                className="w-32"
              />

              <Button
                onClick={handleGenerateKeys}
                disabled={!selectedPlan || loading}
                className="kurdish-text"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Key className="h-5 w-5 mr-2" />
                    دروستکرن
                  </>
                )}
              </Button>
            </div>

            {/* Keys List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative flex-1 max-w-sm">
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="گەڕیان..."
                    className="pl-10 kurdish-text"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={filterStatus === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('all')}
                    className="kurdish-text"
                  >
                    هەمی
                  </Button>
                  <Button
                    variant={filterStatus === 'unused' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('unused')}
                    className="kurdish-text"
                  >
                    بەکارنەهاتی
                  </Button>
                  <Button
                    variant={filterStatus === 'used' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('used')}
                    className="kurdish-text"
                  >
                    بکارهاتی
                  </Button>
                </div>
              </div>

              <div className={`rounded-lg border overflow-hidden ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <table className="w-full">
                  <thead className={
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                  }>
                    <tr>
                      <th className="px-4 py-2 text-right kurdish-text">کلیل</th>
                      <th className="px-4 py-2 text-right kurdish-text">پاکێج</th>
                      <th className="px-4 py-2 text-right kurdish-text">دەم</th>
                      <th className="px-4 py-2 text-right kurdish-text">بار</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKeys.map(key => (
                      <tr key={key.key} className={`border-t ${
                        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <td className="px-4 py-2 font-mono text-sm">
                          {key.key}
                        </td>
                        <td className="px-4 py-2 kurdish-text">
                          {key.planName}
                        </td>
                        <td className="px-4 py-2 kurdish-text">
                          {new Date(key.createdAt).toLocaleDateString('ku')}
                        </td>
                        <td className="px-4 py-2 kurdish-text">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            key.used
                              ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                              : 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                          }`}>
                            {key.used ? 'بکارهاتی' : 'بەردەست'}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyKey(key.key)}
                            disabled={key.used}
                          >
                            {copiedKey === key.key ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Plan Modal */}
      {showEditPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="kurdish-text">
                گوهۆڕینا پاکێجێ {editingPlan.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 kurdish-text">
                    سنوورێ رۆژانە
                  </label>
                  <Input
                    type="number"
                    value={editingPlan.dailyLimit}
                    onChange={(e) => setEditingPlan(prev => ({
                      ...prev,
                      dailyLimit: parseInt(e.target.value)
                    }))}
                    min="1"
                    className="kurdish-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 kurdish-text">
                    بها (دینار)
                  </label>
                  <Input
                    type="number"
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan(prev => ({
                      ...prev,
                      price: parseInt(e.target.value)
                    }))}min="0"
                    className="kurdish-text"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditPlanModal(false);
                      setEditingPlan(null);
                    }}
                    className="kurdish-text"
                  >
                    بەتالکرن
                  </Button>
                  <Button
                    onClick={handleUpdatePlan}
                    disabled={loading}
                    className="kurdish-text"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <span>پاراستن</span>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-200 text-red-600 px-4 py-2 rounded-lg kurdish-text">
          {error}
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptionPanel;