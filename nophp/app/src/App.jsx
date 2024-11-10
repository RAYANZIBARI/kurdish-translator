import { useState, useEffect } from 'react';
import { 
  Home,
  Book,
  Languages,
  Settings as SettingsIcon,
  History,
  UserPlus,
  LogIn,
  LogOut,
  User,
  Shield,
  CreditCard
} from 'lucide-react';
import KurdishTranslator from './components/KurdishTranslator';
import DictionaryTab from './components/DictionaryTab';
import HistoryTab from './components/HistoryTab';
import SettingsTab from './components/SettingsTab';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import ProfileTab from './components/ProfileTab';
import AdminPanel from './components/AdminPanel';
import SubscriptionsPage from './components/SubscriptionsPage';

function App() {
  const [activeTab, setActiveTab] = useState('translate');
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load theme and check subscription status
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', prefersDark);
      localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
    }

    checkSubscriptionStatus();
  }, [user]);

  const checkSubscriptionStatus = async () => {
    if (!user) {
      setSubscriptionStatus(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/subscription/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setSubscriptionStatus(data.status);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setSubscriptionStatus(null);
    setActiveTab('translate');
  };

  const handleLogin = (userData) => {
    setUser(userData);
    checkSubscriptionStatus();
  };

  // Navigation items based on user role and status
  const getNavigationItems = () => {
    if (!user) {
      return [
        { id: 'translate', label: 'وەرگێڕان', icon: Languages },
        { id: 'dictionary', label: 'فەرهەنگ', icon: Book },
        { id: 'subscription', label: 'پاکێج', icon: CreditCard },
        { id: 'login', label: 'چوونەژوور', icon: LogIn },
        { id: 'register', label: 'خۆتۆمارکرن', icon: UserPlus }
      ];
    }

    const commonItems = [
      { id: 'translate', label: 'وەرگێڕان', icon: Languages },
      { id: 'dictionary', label: 'فەرهەنگ', icon: Book },
      { id: 'history', label: 'دیرۆک', icon: History },
      { id: 'subscription', label: 'پاکێج', icon: CreditCard },
      { id: 'profile', label: 'پرۆفایل', icon: User },
    ];

    if (user.role === 'admin') {
      return [
        ...commonItems,
        { id: 'admin', label: 'بەڕێڤەبرن', icon: Shield },
        { id: 'settings', label: 'رێکخستن', icon: SettingsIcon },
        { id: 'logout', label: 'دەرچوون', icon: LogOut, onClick: handleLogout }
      ];
    }

    return [
      ...commonItems,
      { id: 'settings', label: 'رێکخستن', icon: SettingsIcon },
      { id: 'logout', label: 'دەرچوون', icon: LogOut, onClick: handleLogout }
    ];
  };

  // Subscription status badge
  const getSubscriptionBadge = () => {
    if (!subscriptionStatus || subscriptionStatus.planId === 'free') {
      return null;
    }

    return (
      <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-full shadow-lg kurdish-text
        ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-500 text-white'}`}>
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          <span>{subscriptionStatus.plan?.name} - {subscriptionStatus.remainingTranslations} وەرگێڕانێن مای</span>
        </div>
      </div>
    );
  };

  // Render content based on active tab and user role
  const renderContent = () => {
    // Protected routes
    if (!user && ['history', 'profile', 'settings', 'admin'].includes(activeTab)) {
      return <LoginForm theme={theme} onLogin={handleLogin} onSwitchToRegister={() => setActiveTab('register')} />;
    }

    // Admin-only routes
    if (activeTab === 'admin' && user?.role !== 'admin') {
      return <div className="text-center p-4 kurdish-text dark:text-gray-200">
        تە دەستهەلات نینە
      </div>;
    }

    // Loading state
    if (loading && activeTab !== 'translate') {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>;
    }

    switch (activeTab) {
      case 'translate':
        return <KurdishTranslator 
          theme={theme} 
          onThemeChange={handleThemeChange}
          subscriptionStatus={subscriptionStatus}
          onSubscriptionChange={checkSubscriptionStatus}
        />;
      case 'dictionary':
        return <DictionaryTab theme={theme} />;
      case 'history':
        return <HistoryTab theme={theme} />;
      case 'settings':
        return <SettingsTab theme={theme} onThemeChange={handleThemeChange} />;
      case 'login':
        return <LoginForm theme={theme} onLogin={handleLogin} onSwitchToRegister={() => setActiveTab('register')} />;
      case 'register':
        return <RegisterForm theme={theme} onRegister={handleLogin} onSwitchToLogin={() => setActiveTab('login')} />;
      case 'profile':
        return <ProfileTab theme={theme} user={user} onLogout={handleLogout} onUpdate={handleLogin} />;
      case 'admin':
        return <AdminPanel theme={theme} />;
      case 'subscription':
        return <SubscriptionsPage 
          theme={theme} 
          user={user} 
          subscriptionStatus={subscriptionStatus}
          onSubscriptionChange={checkSubscriptionStatus}
        />;
      default:
        return <KurdishTranslator theme={theme} onThemeChange={handleThemeChange} />;
    }
  };

  const handleNavigation = (item) => {
    if (item.onClick) {
      item.onClick();
    } else {
      setActiveTab(item.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Subscription Badge */}
      {getSubscriptionBadge()}

      {/* Main Content */}
      <div className="pb-20">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className={`fixed bottom-0 left-0 right-0 nav-blur transition-colors duration-300
        dark:bg-gray-900/90 dark:border-t dark:border-gray-800
        bg-white/90 border-t border-gray-200 z-50`}>
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-4 overflow-x-auto">
          {getNavigationItems().map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={`
                flex flex-col items-center justify-center w-16 h-full
                transition-all duration-300 relative min-w-[4rem]
                ${activeTab === item.id 
                  ? 'dark:text-blue-400 text-blue-600' 
                  : 'dark:text-gray-400 dark:hover:text-gray-200 text-gray-500 hover:text-gray-900'}
              `}
            >
              {activeTab === item.id && (
                <div className="absolute -top-0.5 w-8 h-1 rounded-full 
                  dark:bg-blue-400 bg-blue-600 
                  transition-all duration-300" />
              )}

              <item.icon className={`h-5 w-5 transition-all duration-300 ${
                activeTab === item.id ? 'transform scale-110' : ''
              }`} />

              <span className={`text-xs mt-1 kurdish-text transition-all duration-300 ${
                activeTab === item.id 
                  ? 'dark:text-blue-400 text-blue-600 font-medium' 
                  : 'dark:text-gray-400 text-gray-500'
              }`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap');
        
        .kurdish-text {
          font-family: 'Vazirmatn', sans-serif !important;
          line-height: 2;
          text-align: right;
          direction: rtl;
        }

        .nav-blur {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
      `}</style>
    </div>
  );
}

export default App;