import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  Loader2, 
  Sun, 
  Moon,
  Languages,
  Send,
  Check,
  Copy,
  Globe,
  Type,
  Book,
  Search,
  X,
  History,
  ChevronDown,
  Calendar,
  Settings
} from 'lucide-react';

const KurdishTranslator = ({ theme, onThemeChange }) => {
  const [inputText, setInputText] = useState('');
  const [translations, setTranslations] = useState({ behdini: '', sorani: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDialect, setSelectedDialect] = useState('both');
  const [copied, setCopied] = useState({ behdini: false, sorani: false });
  const [lastTranslations, setLastTranslations] = useState([]);

  // Load recent translations
  useEffect(() => {
    const savedHistory = localStorage.getItem('translationHistory');
    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      setLastTranslations(history.slice(0, 3)); // Show last 3 translations
    }
  }, []);

  const copyToClipboard = async (text, dialect) => {
    await navigator.clipboard.writeText(text);
    setCopied({ ...copied, [dialect]: true });
    setTimeout(() => setCopied({ ...copied, [dialect]: false }), 2000);
  };

  const saveToHistory = (originalText, translations) => {
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      originalText,
      translations
    };

    const savedHistory = localStorage.getItem('translationHistory');
    const history = savedHistory ? JSON.parse(savedHistory) : [];
    const newHistory = [historyItem, ...history];
    localStorage.setItem('translationHistory', JSON.stringify(newHistory));
    setLastTranslations(newHistory.slice(0, 3));
  };

  const translate = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:3001/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          dialect: selectedDialect
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'وەرگێڕان سەرنەکەفت');
      }

      const data = await response.json();
      setTranslations(data.translations);
      saveToHistory(inputText, data.translations);
      
    } catch (error) {
      console.error('هەڵەیا وەرگێڕانێ:', error);
      setError(`هەڵە: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      translate();
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <Card className={`w-full max-w-4xl mx-auto shadow-xl transform transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-800/90 border-gray-700 shadow-gray-900/50' 
          : 'bg-white/90 backdrop-blur-sm shadow-gray-200/50'
      }`}>
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Globe className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <CardTitle className="kurdish-text text-2xl mb-1">
                  وەرگێڕا کوردی
                </CardTitle>
                <p className="kurdish-text text-sm text-gray-500 dark:text-gray-400">
                  وەرگێڕان بۆ کوردی (بەهدینی و سۆرانی)
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
              className={`rounded-full h-10 w-10 transition-all duration-300 ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 border-gray-600' 
                  : 'bg-white hover:bg-gray-100'
              }`}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-blue-500" />
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {/* Dialect Selection */}
          <div className="flex flex-wrap gap-3">
            {[
              { id: 'both', label: 'هەردوو زاراڤە', icon: Languages },
              { id: 'behdini', label: 'بەهدینی', icon: Type },
              { id: 'sorani', label: 'سۆرانی', icon: Type }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedDialect(id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-300 kurdish-text text-sm ${
                  selectedDialect === id 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                    : theme === 'dark' 
                      ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="space-y-3">
            <label className="block kurdish-text text-base font-medium text-gray-700 dark:text-gray-300">
              دەقێ ئینگلیزی
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              className={`w-full p-4 rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-36 resize-none ${
                theme === 'dark' 
                  ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="دەقی بۆ وەرگێڕانێ لێرە بنڤیسە..."
              dir="ltr"
            />
          </div>

          {/* Translate Button */}
          <Button 
            onClick={translate} 
            disabled={!inputText.trim() || loading}
            className={`w-full h-12 font-medium transition-all duration-300 kurdish-text ${
              loading ? 'opacity-80 cursor-not-allowed' : ''
            } ${
              theme === 'dark' 
                ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30' 
                : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/30'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>وەرگێڕان...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Send className="h-5 w-5" />
                <span>وەرگێڕە</span>
              </div>
            )}
          </Button>

          {/* Error Message */}
          {error && (
            <div className={`p-4 rounded-lg border transition-all duration-300 kurdish-text ${
              theme === 'dark'
                ? 'bg-red-900/20 border-red-800 text-red-400'
                : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              {error}
            </div>
          )}

          {/* Translation Results */}
          {(translations.behdini || translations.sorani) && !error && (
            <div className="space-y-6">
              {/* Behdini Translation */}
              {(selectedDialect === 'both' || selectedDialect === 'behdini') && translations.behdini && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="kurdish-text text-base font-medium text-gray-700 dark:text-gray-300">
                      کوردی بەهدینی
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(translations.behdini, 'behdini')}
                      className="transition-colors duration-300"
                    >
                      {copied.behdini ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                      )}
                    </Button>
                  </div>
                  <div className={`p-4 rounded-lg transition-all duration-300 ${
                    theme === 'dark' 
                      ? 'bg-gray-700/50 border border-gray-600' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className="kurdish-text text-lg">
                      {translations.behdini}
                    </div>
                  </div>
                </div>
              )}

              {/* Sorani Translation */}
              {(selectedDialect === 'both' || selectedDialect === 'sorani') && translations.sorani && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="kurdish-text text-base font-medium text-gray-700 dark:text-gray-300">
                      کوردی سۆرانی
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(translations.sorani, 'sorani')}
                      className="transition-colors duration-300"
                    >
                      {copied.sorani ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                      )}
                    </Button>
                  </div>
                  <div className={`p-4 rounded-lg transition-all duration-300 ${
                    theme === 'dark' 
                      ? 'bg-gray-700/50 border border-gray-600' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className="kurdish-text text-lg">
                      {translations.sorani}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent Translations */}
          {lastTranslations.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="kurdish-text text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
                دویماهیک وەرگێڕان
              </h3>
              <div className="space-y-4">
                {lastTranslations.map(item => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700/50 border border-gray-600'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {item.originalText}
                    </p>
                    <p className="kurdish-text">
                      {item.translations.behdini || item.translations.sorani}
                    </p>
                    <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 mt-2">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{new Date(item.timestamp).toLocaleString('ku')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KurdishTranslator;