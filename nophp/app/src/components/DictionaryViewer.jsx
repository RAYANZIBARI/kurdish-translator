import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Book,
  X
} from 'lucide-react';

const DictionaryViewer = ({ theme, dictionary }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  // Convert dictionary to flat array of word pairs
  const flattenDictionary = (obj, prefix = '') => {
    let items = [];
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        items.push({
          english: prefix ? `${prefix} ${key.replace(/_/g, ' ')}` : key.replace(/_/g, ' '),
          behdini: value,
          category: prefix.split('.')[0] || 'گشتی'
        });
      } else if (typeof value === 'object' && value !== null) {
        items = [...items, ...flattenDictionary(value, prefix ? `${prefix}.${key}` : key)];
      }
    }
    return items;
  };

  const allWords = useMemo(() => flattenDictionary(dictionary), [dictionary]);

  // Filter words based on search
  const filteredWords = useMemo(() => {
    if (!searchTerm) return allWords;
    const term = searchTerm.toLowerCase();
    return allWords.filter(
      word => 
        word.english.toLowerCase().includes(term) ||
        word.behdini.includes(term)
    );
  }, [allWords, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredWords.length / itemsPerPage);
  const currentWords = filteredWords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Card className={`w-full max-w-4xl mx-auto mt-4 ${
      theme === 'dark' 
        ? 'bg-gray-800/90 border-gray-700' 
        : 'bg-white/90 backdrop-blur-sm'
    }`}>
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Book className="h-5 w-5 text-blue-500" />
            <CardTitle className="kurdish-text text-xl">
              فەرهەنگا پەیڤان
            </CardTitle>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 kurdish-text">
            {filteredWords.length} پەیڤ
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Search input */}
        <div className="relative">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="گەڕیان..."
            className={`kurdish-text pl-10 ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-200'
            }`}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="absolute right-3 top-2.5"
            >
              <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Words grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentWords.map((word, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                theme === 'dark'
                  ? 'bg-gray-700/50 hover:bg-gray-700'
                  : 'bg-gray-50 hover:bg-gray-100'
              } transition-colors duration-200`}
            >
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {word.english}
                </span>
                <span className="kurdish-text font-medium">
                  {word.behdini}
                </span>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 kurdish-text">
                {word.category}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600'
                : 'bg-white'
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <span className="kurdish-text text-sm text-gray-500 dark:text-gray-400">
            بەرپەر {currentPage} ژ {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600'
                : 'bg-white'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DictionaryViewer;