import React, { useState, useEffect } from 'react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import {
  Sun,
  Moon,
  Languages,
  Trash2,
  Save,
  RefreshCw,
  Settings as SettingsIcon
} from 'lucide-react';

const SettingsTab = ({ theme, onThemeChange }) => {
  const [autoSave, setAutoSave] = useState(true);
  const [maxHistoryItems, setMaxHistoryItems] = useState(50);
  const [defaultDialect, setDefaultDialect] = useState('both');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('translatorSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setAutoSave(settings.autoSave ?? true);
      setMaxHistoryItems(settings.maxHistoryItems ?? 50);
      setDefaultDialect(settings.defaultDialect ?? 'both');
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    const settings = {
      autoSave,
      maxHistoryItems,
      defaultDialect,
      theme
    };
    localStorage.setItem('translatorSettings', JSON.stringify(settings));
  };

  // Clear all data
  const clearAllData = () => {
    if (window.confirm('دڤێت تۆ هەمی داتایان پاقژ بکەی؟')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Reset settings to default
  const resetSettings = () => {
    setAutoSave(true);
    setMaxHistoryItems(50);
    setDefaultDialect('both');
    localStorage.removeItem('translatorSettings');
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      {/* Theme Settings */}
      <Card className={`p-4 ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="space-y-4">
          <h3 className="text-lg font-medium kurdish-text dark:text-white">
            دوخێ رەنگان
          </h3>
          <div className="flex items-center justify-between">
            <span className="kurdish-text text-gray-600 dark:text-gray-300">
              دوخێ تاری
            </span>
            <div className="flex items-center gap-4">
              <Button
                variant={theme === 'light' ? 'outline' : 'ghost'}
                size="sm"
                onClick={() => onThemeChange('light')}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                <span className="kurdish-text">ڤەکری</span>
              </Button>
              <Button
                variant={theme === 'dark' ? 'outline' : 'ghost'}
                size="sm"
                onClick={() => onThemeChange('dark')}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                <span className="kurdish-text">تاری</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Translation Settings */}
      <Card className={`p-4 ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="space-y-4">
          <h3 className="text-lg font-medium kurdish-text dark:text-white">
            رێکخستنێن وەرگێڕانێ
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="kurdish-text text-gray-600 dark:text-gray-300">
                زاراڤێ سەرەکی
              </span>
              <div className="flex items-center gap-2">
                {['both', 'behdini', 'sorani'].map(dialect => (
                  <Button
                    key={dialect}
                    variant={defaultDialect === dialect ? 'outline' : 'ghost'}
                    size="sm"
                    onClick={() => setDefaultDialect(dialect)}
                    className="flex items-center gap-2"
                  >
                    <Languages className="h-4 w-4" />
                    <span className="kurdish-text">
                      {dialect === 'both' ? 'هەردوو' : 
                       dialect === 'behdini' ? 'بەهدینی' : 'سۆرانی'}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="kurdish-text text-gray-600 dark:text-gray-300">
                پاراستنا ئۆتۆماتیک
              </span>
              <Switch
                checked={autoSave}
                onCheckedChange={setAutoSave}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="kurdish-text text-gray-600 dark:text-gray-300">
                ژمارا دیرۆکێ
              </span>
              <select
                value={maxHistoryItems}
                onChange={(e) => setMaxHistoryItems(Number(e.target.value))}
                className={`rounded-md border px-3 py-1 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <Card className={`p-4 ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="space-y-4">
          <h3 className="text-lg font-medium kurdish-text dark:text-white">
            کریار
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={saveSettings}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              <span className="kurdish-text">پاراستنا رێکخستنان</span>
            </Button>

            <Button
              variant="outline"
              onClick={resetSettings}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="kurdish-text">ڤەگەڕاندنا رێکخستنان</span>
            </Button>

            <Button
              variant="destructive"
              onClick={clearAllData}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              <span className="kurdish-text">پاقژکرنا هەمی داتایان</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* About Section */}
      <Card className={`p-4 ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="space-y-2">
          <h3 className="text-lg font-medium kurdish-text dark:text-white">
            دەربارە
          </h3>
          <p className="kurdish-text text-gray-600 dark:text-gray-300">
            ڤەرژن: 1.0.0
          </p>
          <p className="kurdish-text text-gray-600 dark:text-gray-300">
            پەرەپێدەر: یونس عثمان
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SettingsTab;