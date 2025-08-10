import React, { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const Header: React.FC = () => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <a href="/" className="flex items-center space-x-2">
                <img
                  src="/logo.png"
                  alt="Paw Finder Logo"
                  className="h-24 w-24 object-contain"
                />
                <span className="text-xl font-bold text-[#F4A261]">
                  PawFinder
                </span>
              </a>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a
              href="/lost-pets"
              className="text-gray-700 hover:text-[#F4A261] px-3 py-2 text-md font-medium"
            >
              แจ้งสัตว์เลี้ยงหาย
            </a>
            <a
              href="/found-pets"
              className="text-gray-700 hover:text-[#F4A261] px-3 py-2 text-md font-medium"
            >
              แจ้งพบสัตว์เลี้ยง
            </a>
            <a
              href="/found-search"
              className="text-gray-700 hover:text-[#F4A261] px-3 py-2 text-md font-medium"
            >
              สัตว์เลี้ยงที่พบ
            </a>
            <a
              href="/rewards"
              className="text-gray-700 hover:text-[#F4A261] px-3 py-2 text-md font-medium"
            >
              รางวัล
            </a>
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  สวัสดี, {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#F4A261] hover:bg-[#FF5A4A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F4A261]"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-2">ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <a
                  href="/signin"
                  className="text-gray-700 hover:text-[#F4A261] px-3 py-2 text-sm font-medium"
                >
                  เข้าสู่ระบบ
                </a>
                <a
                  href="/signup"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#F4A261] hover:bg-[#FF5A4A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F4A261]"
                >
                  สมัครสมาชิก
                </a>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#F4A261] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#F4A261]"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            <a
              href="/"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#F4A261] hover:bg-gray-50"
            >
              หน้าหลัก
            </a>
            <a
              href="/lost-pets"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#F4A261] hover:bg-gray-50"
            >
              แจ้งสัตว์เลี้ยงหาย
            </a>
            <a
              href="/found-pets"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#F4A261] hover:bg-gray-50"
            >
              แจ้งพบสัตว์เลี้ยง
            </a>
            <a
              href="/found-search"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#F4A261] hover:bg-gray-50"
            >
              สัตว์เลี้ยงที่พบ
            </a>
            <a
              href="/rewards"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#F4A261] hover:bg-gray-50"
            >
              รางวัล
            </a>
            {user ? (
              <div className="px-3 py-2 space-y-2">
                <p className="text-sm text-gray-700">สวัสดี, {user.email}</p>
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-white bg-[#F4A261] hover:bg-[#FF5A4A] rounded-md"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-2">ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <div className="px-3 py-2 space-y-2">
                <a
                  href="/signin"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#F4A261] hover:bg-gray-50"
                >
                  เข้าสู่ระบบ
                </a>
                <a
                  href="/signup"
                  className="block px-3 py-2 text-base font-medium text-white bg-[#F4A261] hover:bg-[#FF5A4A] rounded-md"
                >
                  สมัครสมาชิก
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
