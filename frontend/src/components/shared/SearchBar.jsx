import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`flex items-center gap-2 bg-white/5 border-white/10 rounded-xl px-4 py-2.5 transition-all ${
        focused ? 'border-indigo-400 ring-2 ring-green-500/30' : 'border-white/10'
      }`}
    >
      <Search size={18} className="text-gray-500 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="flex-1 outline-none text-sm text-white placeholder:text-gray-500 bg-transparent"
      />
      {value && (
        <button onClick={() => onChange('')} className="text-gray-500 hover:text-gray-300">
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
