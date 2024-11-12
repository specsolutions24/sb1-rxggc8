import React, { useState, useEffect } from 'react';
import { SearchForm } from './components/SearchForm';
import { DomainDetails } from './components/DomainDetails';
import { AuthModal } from './components/AuthModal';
import { UserProfile } from './components/UserProfile';
import { getDomainInfo } from './services/domainService';
import { storeDomainInfo } from './services/airtableService';
import { Globe2, Search, User, LogOut, Shield } from 'lucide-react';
import type { DomainInfo } from './types/domain';
import type { User as UserType } from './services/authService';
import { Toaster, toast } from 'react-hot-toast';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null);
  const [searchProgress, setSearchProgress] = useState(0);
  const [user, setUser] = useState<UserType | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setIsInitializing(false);
  }, []);

  const handleAuth = (authenticatedUser: UserType) => {
    setUser(authenticatedUser);
    localStorage.setItem('user', JSON.stringify(authenticatedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setDomainInfo(null);
    toast.success('Logged out successfully');
  };

  const simulateProgress = () => {
    setSearchProgress(0);
    const interval = setInterval(() => {
      setSearchProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    return () => clearInterval(interval);
  };

  const handleSearch = async (domain: string) => {
    if (!user) {
      toast.error('Please sign in to perform scans');
      return;
    }

    setIsLoading(true);
    setError(null);
    const cleanup = simulateProgress();

    try {
      const info = await getDomainInfo(domain);
      if (info.error) {
        setError(info.error);
      } else {
        setDomainInfo(info);
        try {
          await storeDomainInfo(domain, info, user.id);
          toast.success('Data successfully saved to Airtable');
        } catch (airtableError) {
          console.error('Failed to save to Airtable:', airtableError);
          toast.error('Failed to save data to Airtable');
        }
      }
    } catch (err) {
      setError('Failed to fetch domain information. Please try again.');
    } finally {
      cleanup();
      setSearchProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setSearchProgress(0);
      }, 500);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg ring-1 ring-slate-700/50">
              <Shield className="w-16 h-16 text-sky-400" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              OSINT Domain Investigation Tool
            </h1>
            <p className="text-slate-400 text-lg max-w-sm">
              Professional-grade domain intelligence and security analysis platform
            </p>
          </div>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-8 py-4 bg-sky-500 text-white rounded-xl 
                     hover:bg-sky-600 transition-all duration-200 
                     shadow-lg hover:shadow-sky-500/25"
          >
            Get Started
          </button>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuth={handleAuth}
        />
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex flex-col items-center space-y-6">
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg ring-1 ring-slate-700/50">
              <Shield className="w-16 h-16 text-sky-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                OSINT Domain Investigation Tool
              </h1>
              <p className="text-slate-400 text-lg">
                Enter a domain name to gather WHOIS information and more
              </p>
            </div>
          </div>
        </header>

        <div className="fixed top-4 right-4 flex items-center space-x-4 z-50">
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-2 shadow-lg ring-1 ring-slate-700/50">
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center space-x-3 px-4 py-2 text-white 
                       hover:bg-slate-700/50 rounded-lg transition-colors duration-200"
            >
              <User className="w-5 h-5" />
              <span>{user.name}</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-2 text-red-400 
                       hover:bg-red-500/10 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {isLoading && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="text-center mb-4">
              <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-sky-400 rounded-full mb-2" />
              <p className="text-slate-400">Gathering information...</p>
            </div>
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded-full bg-slate-800">
                <div 
                  style={{ width: `${searchProgress}%` }}
                  className="transition-all duration-300 ease-out shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-sky-500"
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Search className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {domainInfo && !isLoading && (
          <div className="max-w-4xl mx-auto">
            <DomainDetails domainInfo={domainInfo} />
          </div>
        )}
      </div>

      <Toaster position="top-right" />

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuth={handleAuth}
        />
      )}

      {showProfile && user && (
        <UserProfile
          user={user}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}