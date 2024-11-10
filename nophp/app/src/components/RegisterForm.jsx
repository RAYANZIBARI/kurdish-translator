// RegisterForm.jsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  User,
  Mail, 
  Lock,
  Phone,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';

const RegisterForm = ({ theme, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // ناڤ
    if (!formData.name.trim()) {
      newErrors.name = 'ناڤ پێتڤیە';
    } else if (formData.name.length < 3) {
      newErrors.name = 'ناڤ دڤێت ژ 3 پیتان درێژتر بیت';
    }

    // ئیمەیل
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'ئیمەیل پێتڤیە';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'ئیمەیلا نەدروستە';
    }

    // ژمارا تەلەفۆنێ
    const phoneRegex = /^\+?\d{10,}$/;
    if (!formData.phone) {
      newErrors.phone = 'ژمارا تەلەفۆنێ پێتڤیە';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'ژمارا تەلەفۆنێ نەدروستە';
    }

    // پاسوۆرد
    if (!formData.password) {
      newErrors.password = 'پاسوۆرد پێتڤیە';
    } else if (formData.password.length < 8) {
      newErrors.password = 'پاسوۆرد دڤێت ژ 8 پیتان درێژتر بیت';
    }

    // دووپاتکرنا پاسوۆردێ
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'دووپاتکرنا پاسوۆردێ پێتڤیە';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'پاسوۆرد نە وەک ئێکن';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'خەلەتیەک رویدا');
      }

      // Registration successful - Log in the user
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      window.location.reload();

    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <Card className={`w-full max-w-md mx-auto shadow-xl ${
        theme === 'dark' 
          ? 'bg-gray-800/90 border-gray-700' 
          : 'bg-white/90 backdrop-blur-sm'
      }`}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center kurdish-text">
            خۆتۆمارکرن
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ناڤ */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      name: e.target.value
                    }));
                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                  }}
                  placeholder="ناڤێ تەمام"
                  className={`pl-10 kurdish-text ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white'
                  } ${errors.name ? 'border-red-500' : ''}`}
                />
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              {errors.name && (
                <p className="text-sm text-red-500 kurdish-text">{errors.name}</p>
              )}
            </div>

            {/* ئیمەیل */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      email: e.target.value
                    }));
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  placeholder="ئیمەیل"
                  className={`pl-10 kurdish-text ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white'
                  } ${errors.email ? 'border-red-500' : ''}`}
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 kurdish-text">{errors.email}</p>
              )}
            </div>

            {/* ژمارا تەلەفۆنێ */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      phone: e.target.value
                    }));
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                  }}
                  placeholder="ژمارا تەلەفۆنێ"
                  className={`pl-10 kurdish-text ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white'
                  } ${errors.phone ? 'border-red-500' : ''}`}
                />
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-500 kurdish-text">{errors.phone}</p>
              )}
            </div>

            {/* پاسوۆرد */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      password: e.target.value
                    }));
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  placeholder="پاسوۆرد"
                  className={`pl-10 pr-10 kurdish-text ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white'
                  } ${errors.password ? 'border-red-500' : ''}`}
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 kurdish-text">{errors.password}</p>
              )}
            </div>

            {/* دووپاتکرنا پاسوۆردێ */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      confirmPassword: e.target.value
                    }));
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }}
                  placeholder="دووپاتکرنا پاسوۆردێ"
                  className={`pl-10 pr-10 kurdish-text ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white'
                  } ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 kurdish-text">{errors.confirmPassword}</p>
              )}
            </div>

            {errors.submit && (
              <div className="p-3 rounded-lg bg-red-100 border border-red-200 text-red-600 kurdish-text">
                {errors.submit}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className={`w-full h-11 font-medium transition-all duration-300 kurdish-text ${
                loading ? 'opacity-80 cursor-not-allowed' : ''
              } ${
                theme === 'dark' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>چاڤەڕێ بە...</span>
                </div>
              ) : (
                <span>خۆتۆمارکرن</span>
              )}
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                onClick={onSwitchToLogin}
                className="text-sm text-blue-500 hover:text-blue-600 kurdish-text"
              >
                هەژمارا تە هەیە؟ چوونەژوور
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterForm;