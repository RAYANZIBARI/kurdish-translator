// ProfileTab.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

import { 
  User,
  Mail, 
  Phone,
  Camera,
  Loader2,
  Save,
  Edit2,
  Lock,
  AlertCircle,
  Check,
  Trash,
  LogOut
} from 'lucide-react';

const ProfileTab = ({ theme, onLogout }) => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load user data
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        avatar: userData.avatar || ''
      });
    }
  }, []);

  const handleEdit = () => {
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditing(false);
    setError('');
    setSuccess('');
    // Reset form data
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      avatar: user.avatar || ''
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('قەبارەیا وێنەی نابیت ژ 5MB مەزنتر بیت');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatar: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('پێتڤی ب چوونەژوورێ یە');
      }

      const response = await fetch('http://localhost:3001/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        // ئەگەر token نەدروست بیت
        if (response.status === 403 || response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          onLogout(); // دەرچوونا ئۆتۆماتیک
          throw new Error('نیشانا چوونەژوورێ نەدروستە، تکایە دیسان چوونەژوور بکە');
        }
        throw new Error(data.error);
      }

      // نویکرنا token ئەگەر د response دا هەبیت
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // Update local storage and state
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setSuccess('زانیاری هاتنە نویکرن');
      setEditing(false);

    } catch (error) {
      setError(error.message);
      // ئەگەر token نەدروست بیت، بلا editing mode بهێتە راگرتن
      if (error.message.includes('نیشانا چوونەژوورێ نەدروستە')) {
        setEditing(false);
      }
    } finally {
      setLoading(false);
    }
};
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('پاسوۆرد نە وەک ئێکن');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/profile/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setSuccess('پاسوۆرد هاتە نویکرن');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/profile', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Clear local storage and logout
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      onLogout();

    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <Card className={`w-full max-w-2xl mx-auto shadow-xl ${
        theme === 'dark' 
          ? 'bg-gray-800/90 border-gray-700' 
          : 'bg-white/90 backdrop-blur-sm'
      }`}>
        <CardHeader>
          <CardTitle className="text-2xl text-center kurdish-text">
            پرۆفایل
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="relative">
              <div className={`w-24 h-24 rounded-full overflow-hidden border-4 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                {formData.avatar ? (
                  <img 
                    src={formData.avatar} 
                    alt={formData.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              {editing && (
                <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 cursor-pointer flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </div>

          {/* User Info Form */}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!editing}
                  placeholder="ناڤێ تەمام"
                  className={`pl-10 kurdish-text ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white'
                  }`}
                />
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!editing}
                  placeholder="ئیمەیل"
                  className={`pl-10 kurdish-text ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white'
                  }`}
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!editing}
                  placeholder="ژمارا تەلەفۆنێ"
                  className={`pl-10 kurdish-text ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white'
                  }`}
                />
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="p-3 rounded-lg bg-red-100 border border-red-200 text-red-600 kurdish-text flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-green-100 border border-green-200 text-green-600 kurdish-text flex items-center gap-2">
                <Check className="h-5 w-5" />
                {success}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              {editing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="kurdish-text"
                  >
                    بەتالکرن
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="kurdish-text bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>چاڤەڕێ بە...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        <span>پاراستن</span>
                      </div>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={handleEdit}
                  className="kurdish-text bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Edit2 className="h-4 w-4 ml-2" />
                  گوهۆڕین
                </Button>
              )}
            </div>
          </form>


          {/* Additional Actions */}
          {!editing && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6 space-y-3">
              <Button
                variant="outline"
                className="w-full kurdish-text flex items-center justify-center gap-2"
                onClick={() => setShowPasswordModal(true)}
              >
                <Lock className="h-4 w-4" />
                گوهۆڕینا پاسوۆردی
              </Button>

              <Button
                variant="outline"
                className="w-full kurdish-text flex items-center justify-center gap-2 text-red-500 hover:text-red-600"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash className="h-4 w-4" />
                ژێبرنا هەژماری
              </Button>

              <Button
                variant="outline"
                className="w-full kurdish-text flex items-center justify-center gap-2"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4" />
                دەرچوون
              </Button>
            </div>
          )}

          {/* Password Change Modal */}
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className={`w-full max-w-md ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white'
              }`}>
                <CardHeader>
                  <CardTitle className="kurdish-text">
                    گوهۆڕینا پاسوۆردی
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <Input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        currentPassword: e.target.value
                      }))}
                      placeholder="پاسوۆردا نوکە"
                      className="kurdish-text"
                    />
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                      placeholder="پاسوۆردا نوی"
                      className="kurdish-text"
                    />
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                      placeholder="دووپاتکرنا پاسوۆردا نوی"
                      className="kurdish-text"
                    />
                    
                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPasswordModal(false)}
                        className="kurdish-text"
                      >
                        بەتالکرن
                      </Button>
                      <Button
                        type="submit"
                        className="kurdish-text bg-blue-500 hover:bg-blue-600 text-white"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>چاڤەڕێ بە...</span>
                          </div>
                        ) : (
                          <span>نویکرن</span>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Delete Account Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className={`w-full max-w-md ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white'
              }`}>
                <CardHeader>
                  <CardTitle className="kurdish-text text-red-500">
                    ژێبرنا هەژماری
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="kurdish-text">
                    دڤێت تۆ هەژمارا خۆ ژێببەی؟ ئەڤ کریار ناهێتە ڤەگەڕاندن.
                  </p>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteModal(false)}
                      className="kurdish-text"
                    >
                      بەتالکرن
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      className="kurdish-text"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>چاڤەڕێ بە...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Trash className="h-4 w-4" />
                          <span>ژێبرن</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileTab;