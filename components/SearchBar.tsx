import React, { useState } from 'react';
import { Search, MapPin, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [input, setInput] = useState('');
  const [lastSubmitted, setLastSubmitted] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (trimmedInput && trimmedInput !== lastSubmitted && !isLoading) {
      onSearch(trimmedInput);
      setLastSubmitted(trimmedInput);
    }
  };

  const handleClear = () => setInput('');

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = `${pos.coords.latitude}, ${pos.coords.longitude}`;
          onSearch(loc);
          setLastSubmitted(loc);
        },
        () => alert("Location access denied")
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full relative flex items-center mb-6" role="search">
      <div className="relative w-full group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" size={18} />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search city..."
          className="w-full py-3 pl-12 pr-10 bg-white dark:bg-slate-800 rounded-2xl text-gray-800 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/30 shadow-sm transition-all border border-transparent dark:border-slate-700"
          disabled={isLoading}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {isLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full"></div>
            ) : input ? (
                <button type="button" onClick={handleClear} className="text-gray-400 hover:text-gray-600 focus:outline-none p-1"><X size={16} /></button>
            ) : null}
        </div>
      </div>
      <button type="button" onClick={handleLocationClick} className="ml-3 p-3 bg-white dark:bg-slate-800 rounded-2xl text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-all shadow-sm"><MapPin size={20} /></button>
    </form>
  );
};

export default SearchBar;