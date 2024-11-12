import React from 'react';
import { Search } from 'lucide-react';

interface DomainInputProps {
  domain: string;
  setDomain: (domain: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const DomainInput: React.FC<DomainInputProps> = ({ domain, setDomain, onSubmit, isLoading }) => {
  const isValidDomain = (domain: string) => {
    const pattern = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return pattern.test(domain);
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="Enter domain (e.g., example.com)"
          className="w-full px-4 py-3 pl-4 pr-12 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/5 backdrop-blur-sm border-gray-600"
        />
        <button
          type="submit"
          disabled={!isValidDomain(domain) || isLoading}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md ${
            isValidDomain(domain) && !isLoading
              ? 'bg-blue-500 hover:bg-blue-600'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          <Search className="w-5 h-5 text-white" />
        </button>
      </div>
    </form>
  );
};

export default DomainInput;