import React from 'react';
import { Heart, Mail, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F7FFE0] border-t border-[#F4A261] mt-12">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <img src="/logo.png" alt="Paw Finder Logo" className="h-16 w-16 object-contain" />
              <div>
                <h2 className="text-lg font-semibold text-[#6C4F3D]">Paw Finder</h2>
                <p className="text-stone-700 mt-1">ช่วยเหลือเจ้าของและสัตว์เลี้ยงที่หายไปให้ได้พบกันอีกครั้ง</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-3">
              <a href="#" aria-label="facebook" className="text-[#F4A261] hover:text-[#6C4F3D]">Facebook</a>
              <a href="#" aria-label="twitter" className="text-[#F4A261] hover:text-[#6C4F3D]">Twitter</a>
              <a href="#" aria-label="instagram" className="text-[#F4A261] hover:text-[#6C4F3D]">Instagram</a>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[#6C4F3D] mb-3">เมนูหลัก</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-stone-700 hover:text-[#F4A261]">หน้าหลัก</a></li>
              <li><a href="#" className="text-stone-700 hover:text-[#F4A261]">แจ้งสัตว์เลี้ยงหาย</a></li>
              <li><a href="#" className="text-stone-700 hover:text-[#F4A261]">สัตว์เลี้ยงที่พบ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#6C4F3D] mb-3">ติดต่อเรา</h3>
            <div className="space-y-3 text-stone-700">
              <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-[#F4A261]" />095-2488080</div>
              <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-[#F4A261]" />pawfinder.contact@gmail.com</div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-amber-100 pt-6 text-center">
          <p className="text-stone-700 text-sm">© {new Date().getFullYear()} สัตว์เลี้ยงหาย. สงวนลิขสิทธิ์ทั้งหมด.</p>
          <div className="flex justify-center items-center mt-2 text-sm text-stone-700">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-[#F4A261] mx-1" />
            <span>เพื่อสัตว์เลี้ยงทุกตัว</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
