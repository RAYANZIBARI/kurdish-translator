import React, { useState, useEffect } from 'react';
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { 
  Search, 
  Trash2, 
  Copy, 
  Check, 
  Calendar,
  Filter,
  X,
  ChevronDown,
  RefreshCw
} from 'lucide-react';

const HistoryTab = ({ theme }) => {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDialect, setSelectedDialect] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [copied, setCopied] = useState(null);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('translationHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Copy text to clipboard
  const copyToClipboard = async (text, id) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Delete a single history item
  const deleteItem = (id) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('translationHistory', JSON.stringify(newHistory));
  };

  // Clear all history
  const clearHistory = () => {
    if (window.confirm('دڤێت تۆ هەمی دیرۆکێ پاقژ بکەی؟')) {
      setHistory([]);
      localStorage.removeItem('translationHistory');
    }
  };

  // Filter and sort history
  const filteredHistory = history
    .filter(item => {
      const matchesSearch = !searchTerm || 
        item.originalText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.translations.behdini?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.translations.sorani?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDialect = selectedDialect === 'all' ||
        (selectedDialect === 'behdini' && item.translations.behdini) ||
        (selectedDialect === 'sorani' && item.translations.sorani);

      return matchesSearch && matchesDialect;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.timestamp) - new Date(a.timestamp);
      }
      return new Date(a.timestamp) - new Date(b.timestamp);
    });

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        {/* Search Input */}
        <div className="relative">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="گەڕیان د دیرۆکێ دا..."
            className={`w-full pl-10 pr-4 py-3 rounded-lg kurdish-text ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
            }`}
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3.5"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 ${
                theme === 'dark'
                  ? 'bg-gray-800 text-gray-300'
                  : 'bg-white text-gray-700'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span className="kurdish-text">فیلتەر</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                showFilters ? 'rotate-180' : ''
              }`} />
            </Button>

            {history.length > 0 && (
              <Button
                variant="destructive"
                onClick={clearHistory}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                <span className="kurdish-text">پاقژکرنا دیرۆکێ</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <Card className={`p-4 space-y-4 ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <div>
              <label className="block kurdish-text text-sm font-medium mb-2 dark:text-gray-300">
                زاراڤ:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'هەمی' },
                  { id: 'behdini', label: 'بەهدینی' },
                  { id: 'sorani', label: 'سۆرانی' }
                ].map(dialect => (
                  <Button
                    key={dialect.id}
                    variant={selectedDialect === dialect.id ? 'default' : 'outline'}
                    onClick={() => setSelectedDialect(dialect.id)}
                    className="kurdish-text"
                  >
                    {dialect.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block kurdish-text text-sm font-medium mb-2 dark:text-gray-300">
                رێکخستن:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'newest', label: 'نویترین' },
                  { id: 'oldest', label: 'کەڤنترین' }
                ].map(sort => (
                  <Button
                    key={sort.id}
                    variant={sortBy === sort.id ? 'default' : 'outline'}
                    onClick={() => setSortBy(sort.id)}
                    className="kurdish-text"
                  >
                    {sort.label}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* History Items */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-4">
          {filteredHistory.map(item => (
            <Card
              key={item.id}
              className={`p-4 ${
                theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700/80'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              {/* Original Text */}
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Original Text:
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(item.originalText, `original-${item.id}`)}
                  >
                    {copied === `original-${item.id}` ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                <p className="text-gray-900 dark:text-gray-100">{item.originalText}</p>
              </div>

              {/* Behdini Translation */}
              {item.translations.behdini && (
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="kurdish-text text-sm text-gray-500 dark:text-gray-400">
                      بەهدینی:
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(item.translations.behdini, `behdini-${item.id}`)}
                    >
                      {copied === `behdini-${item.id}` ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  <p className="kurdish-text text-gray-900 dark:text-gray-100">
                    {item.translations.behdini}
                  </p>
                </div>
              )}

              {/* Sorani Translation */}
              {item.translations.sorani && (
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="kurdish-text text-sm text-gray-500 dark:text-gray-400">
                      سۆرانی:
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(item.translations.sorani, `sorani-${item.id}`)}
                    >
                      {copied === `sorani-${item.id}` ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  <p className="kurdish-text text-gray-900 dark:text-gray-100">
                    {item.translations.sorani}
                  </p>
                </div>
              )}

              {/* Timestamp and Delete */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t dark:border-gray-700">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="kurdish-text">
                    {new Date(item.timestamp).toLocaleString('ku')}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => deleteItem(item.id)}
                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className={`p-12 text-center ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
        }`}>
          <p className="kurdish-text text-gray-500 dark:text-gray-400">
            هیچ دیرۆک نینە
          </p>
        </Card>
      )}
    </div>
  );
};

export default HistoryTab;