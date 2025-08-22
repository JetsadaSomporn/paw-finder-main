import React from 'react';
import { Heart, MapPin, Mail, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <div className="mb-4">
          <img src="/logo.png" alt="Paw Finder Logo" className="h-10 w-auto mx-auto" />
        </div>
        <p className="text-sm text-stone-600 mb-4">ช่วยเหลือเจ้าของและสัตว์เลี้ยงที่หายไปให้ได้พบกันอีกครั้ง</p>
        <div className="flex justify-center items-center space-x-4 mb-4">
          <a href="#" className="text-stone-600 hover:text-amber-500 hover:underline transition-colors">นโยบายความเป็นส่วนตัว</a>
          <a href="#" className="text-stone-600 hover:text-amber-500 hover:underline transition-colors">ข้อกำหนดการให้บริการ</a>
        </div>
        <p className="text-xs text-stone-500">© {new Date().getFullYear()} Paw Finder — Built with <span className="text-amber-400">♥</span></p>
      </div>
    </footer>
  );
};

export default Footer;
