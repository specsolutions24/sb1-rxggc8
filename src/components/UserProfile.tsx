import React from 'react';
import { User, UserScan, getUserScans, deleteScan } from '../services/authService';
import { Clock, Globe2, Building2, Trash2, AlertCircle } from 'lucide-react';

interface UserProfileProps {
  user: User;
  onClose: () => void;
}

export function UserProfile({ user, onClose }: UserProfileProps) {
  const [scans, setScans] = React.useState<UserScan[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showConfirmDelete, setShowConfirmDelete] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchScans();
  }, [user.id]);

  const fetchScans = async () => {
    const userScans = await getUserScans(user.id);
    setScans(userScans);
    setIsLoading(false);
  };

  const handleDeleteScan = async (scanId: string) => {
    setIsLoading(true);
    const success = await deleteScan(scanId);
    if (success) {
      await fetchScans();
    }
    setShowConfirmDelete(null);
    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateDuration = (start: string, end: string) => {
    const duration = new Date(end).getTime() - new Date(start).getTime();
    return `${(duration / 1000).toFixed(2)}s`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-8 rounded-xl shadow-xl max-w-3xl w-full relative animate-fadeIn max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Profile</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-4 py-2 rounded-lg 
                     hover:bg-slate-700/50 transition-colors duration-200"
          >
            Close
          </button>
        </div>

        <div className="bg-slate-700/50 p-6 rounded-lg mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-sky-500/20 p-4 rounded-full">
              <span className="text-2xl text-sky-500">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">{user.name}</h3>
              <p className="text-slate-400">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Recent Scans</h3>
            <span className="text-sm text-slate-400">
              {scans.length} scan{scans.length !== 1 ? 's' : ''} total
            </span>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-current 
                            border-t-transparent text-sky-400 rounded-full" />
            </div>
          ) : scans.length > 0 ? (
            <div className="grid gap-4">
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  className="bg-slate-700/30 p-4 rounded-lg hover:bg-slate-700/50 
                           transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Globe2 className="w-4 h-4 text-sky-400" />
                        <span className="text-white font-medium">
                          {scan.domainName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-400">
                        <Clock className="w-4 h-4" />
                        <div className="space-y-1">
                          <div>Started: {formatDate(scan.scanStarted)}</div>
                          <div>Completed: {formatDate(scan.scanEnded)}</div>
                          <div>Duration: {calculateDuration(scan.scanStarted, scan.scanEnded)}</div>
                        </div>
                      </div>
                      {scan.organization && (
                        <div className="flex items-center space-x-2 text-sm text-slate-400">
                          <Building2 className="w-4 h-4" />
                          <span>{scan.organization}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {showConfirmDelete === scan.id ? (
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <button
                            onClick={() => handleDeleteScan(scan.id)}
                            className="text-red-400 hover:text-red-300 text-sm font-medium"
                          >
                            Confirm Delete
                          </button>
                          <button
                            onClick={() => setShowConfirmDelete(null)}
                            className="text-slate-400 hover:text-slate-300 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowConfirmDelete(scan.id)}
                          className="text-slate-400 hover:text-red-400 p-2 rounded-lg
                                   hover:bg-red-400/10 transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              No scans found. Start by scanning a domain!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}