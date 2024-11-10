import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Languages,
  Book,
  History,
  Settings,
  User,
  LogIn,
  UserPlus
} from 'lucide-react';

const Navigation = ({ theme, isAuthenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navigationItems = isAuthenticated 
    ? [
        { path: '/', label: 'وەرگێڕان', icon: Languages },
        { path: '/dictionary', label: 'فەرهەنگ', icon: Book },
        { path: '/history', label: 'دیرۆک', icon: History },
        { path: '/profile', label: 'پرۆفایل', icon: User },
        { path: '/settings', label: 'رێکخستن', icon: Settings }
      ]
    : [
        { path: '/', label: 'وەرگێڕان', icon: Languages },
        { path: '/dictionary', label: 'فەرهەنگ', icon: Book },
        { path: '/login', label: 'چوونەژوور', icon: LogIn },
        { path: '/register', label: 'خۆتۆمارکرن', icon: UserPlus }
      ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 nav-blur transition-colors duration-300
      dark:bg-gray-900/90 dark:border-t dark:border-gray-800
      bg-white/90 border-t border-gray-200`}>
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-4">
        {navigationItems.map(({ path, label, icon: Icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`
              flex flex-col items-center justify-center w-16 h-full
              transition-all duration-300 relative
              ${location.pathname === path 
                ? 'dark:text-blue-400 text-blue-600' 
                : 'dark:text-gray-400 dark:hover:text-gray-200 text-gray-500 hover:text-gray-900'}
            `}
          >
            {location.pathname === path && (
              <div className="absolute -top-0.5 w-8 h-1 rounded-full 
                dark:bg-blue-400 bg-blue-600 
                transition-all duration-300" />
            )}

            <Icon className={`h-5 w-5 transition-all duration-300 ${
              location.pathname === path ? 'transform scale-110' : ''
            }`} />

            <span className={`text-xs mt-1 kurdish-text transition-all duration-300 ${
              location.pathname === path 
                ? 'dark:text-blue-400 text-blue-600 font-medium' 
                : 'dark:text-gray-400 text-gray-500'
            }`}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navigation;