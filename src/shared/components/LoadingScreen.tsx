import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'กำลังโหลด...' 
}) => {
  return (
    <div className="min-h-screen bg-[#F7FFE0] flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <img 
            src="/logo.png" 
            alt="Paw Finder Logo" 
            className="w-24 h-24 object-contain animate-bounce"
          />
        </div>
        <p className="text-[#6C4F3D] text-lg font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
