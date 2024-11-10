// LoginForm.jsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  Mail, 
  Lock,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';

const LoginForm = ({ theme, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'هەڵەیەک رویدا');
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      window.location.reload(); // Reload to update app state

    } catch (error) {
      setError(error.message);
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
            چوونەژوور
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="email"
                  name="email"
                  placeholder="ئیمەیل"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      email: e.target.value
                    }));
                    setError('');
                  }}
                  className={`pl-10 kurdish-text ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white'
                  }`}
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="پاسوۆرد"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      password: e.target.value
                    }));
                    setError('');
                  }}
                  className={`pl-10 pr-10 kurdish-text ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white'
                  }`}
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
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-100 border border-red-200 text-red-600 kurdish-text">
                {error}
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
                <span>چوونەژوور</span>
              )}
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                onClick={onSwitchToRegister}
                className="text-sm text-blue-500 hover:text-blue-600 kurdish-text"
              >
                هەژمارا نوی دروست بکە
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;