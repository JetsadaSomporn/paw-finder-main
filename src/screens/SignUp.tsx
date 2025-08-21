import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, UserPlus, User, X, FileText } from 'lucide-react';
import { FaGoogle, FaFacebookF } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { loadTermsOfService, loadPrivacyPolicy } from '../shared/utils/documentLoader.util';


const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [modalContent, setModalContent] = useState<'terms' | 'privacy'>('terms');
  const [termsText, setTermsText] = useState<string>('');
  const [privacyText, setPrivacyText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const acceptRef = useRef<HTMLInputElement | null>(null);

  // โหลดเนื้อหาจากไฟล์ .txt เมื่อเปิด modal
  useEffect(() => {
    const loadDocuments = async () => {
      if (showTermsModal && (!termsText || !privacyText)) {
        try {
          const [terms, privacy] = await Promise.all([
            loadTermsOfService(),
            loadPrivacyPolicy()
          ]);
          setTermsText(terms);
          setPrivacyText(privacy);
        } catch (error) {
          console.error('Error loading documents:', error);
          setTermsText('ไม่สามารถโหลดเงื่อนไขการใช้งานได้');
          setPrivacyText('ไม่สามารถโหลดนโยบายความเป็นส่วนตัวได้');
        }
      }
    };

    loadDocuments();
  }, [showTermsModal, termsText, privacyText]);

  // Social Login Functions
  const handleFacebookSignUp = async () => {
  // Allow social signups even if terms not yet accepted; the user can accept later in the flow
  setLoading(true);
  setError('');
    // Facebook currently under maintenance — show themed notice and keep original call commented
    try {
      /*
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
      */
      toast('กำลังปรับปรุงระบบ กรุณาใช้งานผ่าน Google หรือช่องทางอื่นชั่วคราว');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
  // Allow social signups even if terms not yet accepted; the user can accept later in the flow
  setLoading(true);
  setError('');
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      setError(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google');
    } finally {
      setLoading(false);
    }
  };

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // ตรวจสอบการยอมรับเงื่อนไข
    if (!acceptTerms) {
      setError('กรุณายอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว');
      setLoading(false);
      return;
    }

    // ตรวจสอบ username
    if (!username || username.length < 3 || username.length > 30) {
      setError('Username ต้องมี 3-30 ตัวอักษร');
      setLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username ใช้ได้เฉพาะตัวอักษร ตัวเลข และ _ เท่านั้น');
      setLoading(false);
      return;
    }

    // ตรวจสอบ username ซ้ำ
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .ilike('username', username.toLowerCase())
      .single();

    if (existingUser) {
      setError('Username นี้ถูกใช้แล้ว กรุณาเลือกใหม่');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      setLoading(false);
      return;
    }

    try {
  const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });


      if (error) throw error;

      // สร้าง profile พร้อม username
      if (data.user) {
        const { error: insertError } = await supabase
          .from('profiles')
          .upsert([
            {
              id: data.user.id,
              username: username,
            }
          ], { onConflict: 'id' });

        if (insertError) {
          // Surface the DB error so the user knows signup didn't persist fully
          throw insertError;
        }

        // Best-effort: refresh auth context so UI shows username immediately
        try {
          await refreshProfile(data.user.id);
        } catch (err) {
          // ignore refresh failure
        }
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation required
        navigate('/email-confirmation');
      } else {
        // Direct login (email confirmation disabled)
        navigate('/');
      }
    } catch (error: any) {
      setError(error.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FFE0] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Paw Finder Logo" 
                className="h-24 w-24 object-contain"
              />
              <h2 className="text-3xl font-bold text-[#6C4F3D]">
                สัตว์เลี้ยงหาย
              </h2>
            </div>
          </div>
          <p className="mt-2 text-center text-sm text-[#3E3E3E]">
            สมัครสมาชิกเพื่อช่วยเหลือสัตว์เลี้ยงที่หายไป
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
           <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#6C4F3D]">
                ชื่อผู้ใช้ (Username)
              </label>
              <div className="mt-1 relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#F4A261] h-5 w-5" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none relative block w-full px-10 py-3 border border-[#F4A261] placeholder-[#3E3E3E] text-[#2B2B2B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4A261] focus:border-[#F4A261] focus:z-10 sm:text-sm bg-white"
                  placeholder="ชื่อผู้ใช้"
                />
              </div>
            </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#6C4F3D]">
                อีเมล
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#F4A261] h-5 w-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-10 py-3 border border-[#F4A261] placeholder-[#3E3E3E] text-[#2B2B2B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4A261] focus:border-[#F4A261] focus:z-10 sm:text-sm bg-white"
                  placeholder="กรอกอีเมลของคุณ"
                />
              </div>
            </div>
           
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#6C4F3D]">
                รหัสผ่าน
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#F4A261] h-5 w-5" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-10 py-3 border border-[#F4A261] placeholder-[#3E3E3E] text-[#2B2B2B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4A261] focus:border-[#F4A261] focus:z-10 sm:text-sm bg-white"
                  placeholder="กรอกรหัสผ่านของคุณ"
                />
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#6C4F3D]">
                ยืนยันรหัสผ่าน
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#F4A261] h-5 w-5" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none relative block w-full px-10 py-3 border border-[#F4A261] placeholder-[#3E3E3E] text-[#2B2B2B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4A261] focus:border-[#F4A261] focus:z-10 sm:text-sm bg-white"
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                />
              </div>
            </div>
          </div>

          {/* Terms and Privacy Policy Checkbox */}
          <div className="flex items-start space-x-3">
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              ref={acceptRef}
              checked={acceptTerms}
              onChange={(e) => {
                setAcceptTerms(e.target.checked);
                // clear or set custom validity in Thai
                if (e.target.checked) {
                  e.currentTarget.setCustomValidity('');
                } else {
                  e.currentTarget.setCustomValidity('กรุณายอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัวเพื่อดำเนินการต่อ');
                }
              }}
              onInvalid={(e) => {
                // set the custom message shown by the browser when validation fails
                (e.target as HTMLInputElement).setCustomValidity('กรุณายอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัวเพื่อดำเนินการต่อ');
              }}
              onInput={(e) => {
                // clear custom validity as the user interacts
                (e.currentTarget as HTMLInputElement).setCustomValidity('');
              }}
              className="mt-1 h-4 w-4 text-[#F4A261] focus:ring-[#F4A261] border-gray-300 rounded"
              required
            />
            <label htmlFor="acceptTerms" className="text-sm text-[#3E3E3E]">
              ฉันยอมรับ{' '}
              <button
                type="button"
                className="text-[#F4A261] hover:text-[#6C4F3D] underline font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setModalContent('terms');
                  setShowTermsModal(true);
                }}
              >
                เงื่อนไขการใช้งาน
              </button>
              {' '}และ{' '}
              <button
                type="button"
                className="text-[#F4A261] hover:text-[#6C4F3D] underline font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setModalContent('privacy');
                  setShowTermsModal(true);
                }}
              >
                นโยบายความเป็นส่วนตัว
              </button>
            </label>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#F4A261] hover:bg-[#6C4F3D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F4A261] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <UserPlus className="h-5 w-5 text-white group-hover:text-white" />
              </span>
              {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#F7FFE0] text-gray-500">หรือ</span>
            </div>
          </div>

          {/* Social Login Buttons (Google first, Facebook below) */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border rounded-lg font-medium transition-colors duration-200 bg-white hover:bg-gray-50 border-gray-300 text-gray-700 cursor-pointer"
            >
              <FaGoogle className="h-5 w-5 mr-2" />
              สมัครด้วย Google
            </button>

            <button
              type="button"
              onClick={handleFacebookSignUp}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border rounded-lg font-medium transition-colors duration-200 bg-white hover:bg-gray-50 text-black border-gray-300 cursor-pointer"
            >
              <FaFacebookF className="h-5 w-5 mr-2" />
              สมัครด้วย Facebook
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-[#3E3E3E]">
              มีบัญชีแล้ว?{" "}
              <Link
                to="/signin"
                className="font-medium text-[#F4A261] hover:text-[#6C4F3D] transition-colors duration-200"
              >
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        </form>

        {/* Terms and Privacy Modal */}
        {showTermsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl max-h-[80vh] w-full overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-[#6C4F3D] flex items-center">
                  <FileText className="h-6 w-6 mr-2 text-[#F4A261]" />
                  {modalContent === 'terms' ? 'เงื่อนไขการใช้งาน' : 'นโยบายความเป็นส่วนตัว'}
                </h3>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-[#3E3E3E]">
                  {modalContent === 'terms' ? 
                    (termsText || 'กำลังโหลดเงื่อนไขการใช้งาน...') : 
                    (privacyText || 'กำลังโหลดนโยบายความเป็นส่วนตัว...')
                  }
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="w-full px-4 py-2 bg-[#F4A261] text-white rounded-lg hover:bg-[#6C4F3D] transition-colors duration-200"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUp;