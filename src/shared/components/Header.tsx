import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link, useLocation as useRouterLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const { user, profile, signInHint } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const routerLocation = useRouterLocation();
  const currentState = (routerLocation.state as any) || undefined;
  const llArray = Array.isArray(currentState?.ll)
    ? (currentState.ll as [number, number])
    : undefined;
  const llQuery = llArray ? `?ll=${llArray[0]},${llArray[1]}` : '';

  const handleSignOut = async () => {
    try {
  await supabase.auth.signOut();
  // Force reload/redirect so OAuth sessions (Google) reflect sign-out immediately
  toast.success('ออกจากระบบเรียบร้อย');
  // use hard reload to clear any cached auth state
  window.location.assign('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const signInRef = useRef<HTMLAnchorElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // reposition hint when visible
    const update = () => {
      const hint = hintRef.current;
      const anchor = signInRef.current || document.querySelector('a[href="/signin"]');
      if (!hint) return;
      if (anchor) {
        const rect = (anchor as HTMLElement).getBoundingClientRect();
        hint.style.left = `${Math.max(8, Math.min(rect.left + rect.width / 2 - hint.getBoundingClientRect().width / 2, window.innerWidth - hint.getBoundingClientRect().width - 8))}px`;
        hint.style.top = `${rect.bottom + 8}px`;
      } else {
        hint.style.right = '16px';
        hint.style.top = '72px';
      }
    };

    if (signInHint.visible) {
      update();
      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
    }

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [signInHint.visible, signInHint.message]);

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
                  สวัสดี, {profile?.username || user.email?.split('@')[0] || 'ผู้ใช้'}
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
                  ref={signInRef}
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
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="p-2 rounded-md text-gray-700 hover:text-[#F4A261]">
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

            {/* Sign-in hint rendered by Header when requested via AuthContext */}
            {signInHint.visible && (
              <div
                ref={hintRef}
                id="auth-hint"
                style={{
                  position: 'fixed',
                  zIndex: 20000,
                  padding: '8px 12px',
                  background: 'white',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '8px',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                  fontSize: '14px',
                  color: '#333',
                  whiteSpace: 'nowrap',
                }}
              >
                <div style={{ padding: '6px 12px' }}>{signInHint.message}</div>
              </div>
            )}

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
                  สวัสดี, {profile?.username || user.email?.split('@')[0] || 'ผู้ใช้'}
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
