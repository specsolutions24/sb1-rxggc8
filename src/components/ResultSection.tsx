import React from 'react';

interface ResultSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const ResultSection: React.FC<ResultSectionProps> = ({ title, icon, children }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 space-y-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-500/10 rounded-lg">{icon}</div>
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
};

export default ResultSection;