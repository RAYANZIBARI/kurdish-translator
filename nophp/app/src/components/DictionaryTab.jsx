import React, { useState, useMemo } from 'react';
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

const DictionaryTab = ({ theme }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 50;

  const categories = [
    { id: 'all', name: 'هەمی' },
    { id: 'common_words', name: 'پەیڤێن گشتی' },
    { id: 'common_phrases', name: 'رستێن گشتی' },
    { id: 'verbs', name: 'کار' },
    { id: 'pronouns', name: 'جهناڤ' },
    { id: 'time', name: 'دەم' },
    { id: 'numbers', name: 'ژمارە' }
  ];

  // Function to flatten dictionary
  const flattenDictionary = (obj, category = '', result = []) => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result.push({
          english: key.replace(/_/g, ' '),
          kurdish: value,
          category: category || 'other'
        });
      } else if (typeof value === 'object') {
        flattenDictionary(value, key, result);
      }
    }
    return result;
  };

  // Dictionary data
  const dictionary = {
    common_words: {
      hello: "سڵاڤ",
      goodbye: "خاتر",
      thank_you: "سپاس",
      please: "تکایە",
      yes: "بەلێ",
      no: "نەخێر"
    },
    // Add more dictionary data here
  };

  const words = useMemo(() => flattenDictionary(dictionary), []);

  // Filter words based on search and category
  const filteredWords = words.filter(word => {
    const matchesSearch = !searchTerm || 
      word.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.kurdish.includes(searchTerm);
    const matchesCategory = currentCategory === 'all' || 
      word.category === currentCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredWords.length / itemsPerPage);
  const currentWords = filteredWords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="گەڕیان ل فەرهەنگێ..."
            className={`w-full pl-10 pr-4 py-3 rounded-lg kurdish-text ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
            }`}
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="absolute right-3 top-3.5"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div>
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
            <span className="kurdish-text">کاتیگۆری</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
              showFilters ? 'rotate-180' : ''
            }`} />
          </Button>

          {showFilters && (
            <div className="flex flex-wrap gap-2 mt-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCurrentCategory(cat.id);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full transition-all duration-200 kurdish-text text-sm ${
                    currentCategory === cat.id
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dictionary Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentWords.map((word, index) => (
          <Card
            key={index}
            className={`p-4 transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-700'
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {word.english}
              </span>
              <span className="kurdish-text font-medium dark:text-white">
                {word.kurdish}
              </span>
            </div>
            <div className="text-xs mt-2 kurdish-text text-gray-400 dark:text-gray-500">
              {categories.find(cat => cat.id === word.category)?.name || word.category}
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <span className="kurdish-text text-gray-700 dark:text-gray-300">
            بەرپەر {currentPage} ژ {totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default DictionaryTab;