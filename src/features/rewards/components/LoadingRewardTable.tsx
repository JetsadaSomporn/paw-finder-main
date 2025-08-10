import React from 'react';

const LoadingRewardTable: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="flex justify-center">
        <img
          src="/logo.png"
          alt="Paw Finder Logo"
          className="w-24 h-24 object-contain animate-bounce"
        />
      </div>
      <p className="text-[#6C4F3D] text-lg font-medium">กำลังโหลดข้อมูล...</p>
    </div>
  );
};

export default LoadingRewardTable;
