import React from 'react';
import { 
  Home,
  Book,
  Languages,
  Settings,
  History
} from 'lucide-react';

const MobileNavigation = ({ theme }) => {
  return (
    <div className={`fixed bottom-0 left-0 right-0 ${
      theme === 'dark' 
        ? 'bg-gray-800/90 border-t border-gray-700' 
        : 'bg-white/90 border-t border-gray-200'
    } backdrop-blur-lg z-50`}>
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-4">
        <button className="flex flex-col items-center justify-center w-16 h-full kurdish-text">
          <Home className={`h-5 w-5 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <span className={`text-xs mt-1 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            سەرەکی
          </span>
        </button>

        <button className="flex flex-col items-center justify-center w-16 h-full kurdish-text">
          <Book className={`h-5 w-5 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <span className={`text-xs mt-1 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            فەرهەنگ
          </span>
        </button>

        <button className="flex flex-col items-center justify-center w-16 h-full kurdish-text">
          <Languages className={`h-5 w-5 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <span className={`text-xs mt-1 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            وەرگێڕان
          </span>
        </button>

        <button className="flex flex-col items-center justify-center w-16 h-full kurdish-text">
          <History className={`h-5 w-5 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <span className={`text-xs mt-1 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            دیرۆک
          </span>
        </button>

        <button className="flex flex-col items-center justify-center w-16 h-full kurdish-text">
          <Settings className={`h-5 w-5 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <span className={`text-xs mt-1 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            رێکخستن
          </span>
        </button>
      </div>
    </div>
  );
};

export default MobileNavigation;