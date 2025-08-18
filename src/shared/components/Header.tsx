import React, { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation as useRouterLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, profile, profileLoading, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const routerLocation = useRouterLocation();
  const currentState = (routerLocation.state as any) || undefined;
  const llArray = Array.isArray(currentState?.ll)
    ? (currentState.ll as [number, number])
    : undefined;
  const llQuery = llArray ? `?ll=${llArray[0]},${llArray[1]}` : '';

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error('Error calling signOut from context:', e);
    } finally {
      // Always redirect to home to ensure UI refresh
      try {
        window.location.assign('/');
      } catch (e) {
        window.location.reload();
      }
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
              <Link to="/" state={currentState} className="flex items-center space-x-2">
                <img
                  src="/logo.png"
                  alt="Paw Finder Logo"
                  className="h-24 w-24 object-contain"
                />
                <span className="text-xl font-bold text-[#F4A261]">
                  PawFinder
                </span>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/lost-pets"
              state={currentState}
              className="text-gray-700 hover:text-[#F4A261] px-3 py-2 text-md font-medium"
            >
              แจ้งสัตว์เลี้ยงหาย
            </Link>
            <Link
              to="/found-pets"
              state={currentState}
              className="text-gray-700 hover:text-[#F4A261] px-3 py-2 text-md font-medium"
            >
              แจ้งพบสัตว์เลี้ยง
            </Link>
            <Link
              to="/found-search"
              state={currentState}
              className="text-gray-700 hover:text-[#F4A261] px-3 py-2 text-md font-medium"
            >
              สัตว์เลี้ยงที่พบ
            </Link>
            <Link
              to={{ pathname: '/rewards', search: llQuery }}
              state={currentState}
              className="text-gray-700 hover:text-[#F4A261] px-3 py-2 text-md font-medium"
            >
              รางวัล
            </Link>
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {profileLoading && user && (
                    <span className="inline-block w-20 h-4 bg-gray-200 rounded animate-pulse align-middle" aria-label="กำลังโหลดโปรไฟล์" />
                  )}
                  {!profileLoading && user && (
                    <>สวัสดี, {profile?.username || user.email?.split('@')[0] || 'ผู้ใช้'}</>
                  )}
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
                <Link
                  to="/signin"
                  state={currentState}
                  className="text-gray-700 hover:text-[#F4A261] px-3 py-2 text-sm font-medium"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  to="/signup"
                  state={currentState}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#F4A261] hover:bg-[#FF5A4A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F4A261]"
                >
                  สมัครสมาชิก
                </Link>
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
            <Link
              to="/"
              state={currentState}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#F4A261] hover:bg-gray-50"
            >
              หน้าหลัก
            </Link>
            <Link
              to="/lost-pets"
              state={currentState}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#F4A261] hover:bg-gray-50"
            >
              แจ้งสัตว์เลี้ยงหาย
            </Link>
            <Link
              to="/found-pets"
              state={currentState}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#F4A261] hover:bg-gray-50"
            >
              แจ้งพบสัตว์เลี้ยง
            </Link>
            <Link
              to="/found-search"
              state={currentState}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#F4A261] hover:bg-gray-50"
            >
              สัตว์เลี้ยงที่พบ
            </Link>
            <Link
              to={{ pathname: '/rewards', search: llQuery }}
              state={currentState}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#F4A261] hover:bg-gray-50"
            >
              รางวัล
            </Link>
            {user ? (
              <div className="px-3 py-2 space-y-2">
                <p className="text-sm text-gray-700">
                  {profileLoading && user && (
                    <span className="inline-block w-24 h-4 bg-gray-200 rounded animate-pulse" aria-label="กำลังโหลดโปรไฟล์" />
                  )}
                  {!profileLoading && user && (
                    <>สวัสดี, {profile?.username || user.email?.split('@')[0] || 'ผู้ใช้'}</>
                  )}
                </p>
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
                <Link
                  to="/signin"
                  state={currentState}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#F4A261] hover:bg-gray-50"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  to="/signup"
                  state={currentState}
                  className="block px-3 py-2 text-base font-medium text-white bg-[#F4A261] hover:bg-[#FF5A4A] rounded-md"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
