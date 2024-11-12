import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchFormProps {
  onSearch: (domain: string) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [domain, setDomain] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain.trim()) {
      onSearch(domain.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative group">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="Enter domain name (e.g., example.com)"
          className="w-full px-5 py-4 pr-14 text-white bg-slate-800/50 rounded-xl shadow-lg 
                   border border-slate-700/50 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50
                   transition-all duration-300 group-hover:shadow-xl outline-none
                   placeholder:text-slate-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 
                   hover:text-sky-400 disabled:opacity-50 transition-colors duration-300
                   bg-slate-800/50 rounded-lg hover:bg-slate-700/50 disabled:hover:bg-slate-800/50"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}