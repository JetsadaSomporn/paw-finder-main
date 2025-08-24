import React from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'กำลังโหลด...' }) => {
  return (
    <div className="min-h-screen bg-[#F7FFE0] flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.28 }} className="text-center bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-stone-100">
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="Paw Finder Logo" className="w-20 h-20 object-contain" />
        </div>
        <p className="text-[#6C4F3D] text-lg font-medium">{message}</p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
