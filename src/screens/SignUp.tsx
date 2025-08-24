import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, UserPlus, User, X, FileText } from 'lucide-react';
import { FaFacebookF } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { loadTermsOfService, loadPrivacyPolicy } from '../shared/utils/documentLoader.util';
import { motion } from 'framer-motion';


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
    // Facebook OAuth re-enabled (previous maintenance toast preserved as comment)
    try {
      // const { error } = await supabase.auth.signInWithOAuth({
      //   provider: 'facebook',
      //   options: {
      //     redirectTo: `${window.location.origin}/auth/callback`
      //   }
      // })
      ;
      if (error) throw error;
      
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
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36 }} className="w-full max-w-2xl">
        <div className="bg-white/75 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-amber-50">
          <div className="flex items-center gap-4 mb-4">
            <img src="/logo.png" alt="Paw Finder Logo" className="h-14 w-14 object-contain" />
            <div>
              <h2 className="text-2xl font-semibold text-[#6C4F3D]">สัตว์เลี้ยงหาย</h2>
              <p className="text-sm text-stone-600">สมัครสมาชิกเพื่อช่วยเหลือสัตว์เลี้ยงที่หายไป</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="username" className="block text-xs font-medium text-[#6C4F3D] mb-2 uppercase tracking-wide">ชื่อผู้ใช้ (Username)</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F4A261] h-5 w-5" />
                <input id="username" name="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-10 pr-3 py-3 rounded-xl border border-stone-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#F4A261] transition-shadow" placeholder="ชื่อผู้ใช้" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-[#6C4F3D] mb-2 uppercase tracking-wide">อีเมล</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F4A261] h-5 w-5" />
                <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-3 py-3 rounded-xl border border-stone-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#F4A261] transition-shadow" placeholder="กรอกอีเมลของคุณ" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-[#6C4F3D] mb-2 uppercase tracking-wide">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F4A261] h-5 w-5" />
                <input id="password" name="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-3 py-3 rounded-xl border border-stone-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#F4A261] transition-shadow" placeholder="กรอกรหัสผ่านของคุณ" />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-[#6C4F3D] mb-2 uppercase tracking-wide">ยืนยันรหัสผ่าน</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F4A261] h-5 w-5" />
                <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-3 py-3 rounded-xl border border-stone-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#F4A261] transition-shadow" placeholder="กรอกรหัสผ่านอีกครั้ง" />
              </div>
            </div>

            <div className="md:col-span-2 flex items-start gap-3">
              <input id="acceptTerms" name="acceptTerms" type="checkbox" ref={acceptRef} checked={acceptTerms} onChange={(e) => { setAcceptTerms(e.target.checked); if (e.target.checked) { e.currentTarget.setCustomValidity(''); } else { e.currentTarget.setCustomValidity('กรุณายอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัวเพื่อดำเนินการต่อ'); } }} onInvalid={(e) => { (e.target as HTMLInputElement).setCustomValidity('กรุณายอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัวเพื่อดำเนินการต่อ'); }} onInput={(e) => { (e.currentTarget as HTMLInputElement).setCustomValidity(''); }} className="mt-1 h-4 w-4 text-[#F4A261] focus:ring-[#F4A261] border-gray-300 rounded" required />
              <label htmlFor="acceptTerms" className="text-sm text-stone-700">ฉันยอมรับ <button type="button" className="text-[#F4A261] hover:text-[#6C4F3D] underline font-medium" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setModalContent('terms'); setShowTermsModal(true); }}>เงื่อนไขการใช้งาน</button> และ <button type="button" className="text-[#F4A261] hover:text-[#6C4F3D] underline font-medium" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setModalContent('privacy'); setShowTermsModal(true); }}>นโยบายความเป็นส่วนตัว</button></label>
            </div>

            {error && (
              <div className="md:col-span-2 text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</div>
            )}

            <div className="md:col-span-2">
              <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-3 rounded-full py-3 px-4 bg-gradient-to-r from-[#F4A261] to-[#E8956A] text-white font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                <UserPlus className="h-5 w-5 text-white" />
                {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
              </motion.button>
            </div>

            <div className="md:col-span-2 flex items-center my-2">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="px-3 text-sm text-stone-500">หรือ</span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            <div className="md:col-span-2 space-y-2">
              <button type="button" onClick={handleGoogleSignUp} disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 border border-stone-200 bg-white text-stone-700 hover:shadow-sm transition-shadow"><FcGoogle className="h-5 w-5" />สมัครด้วย Google</button>
              <button type="button" onClick={handleFacebookSignUp} disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 border border-stone-200 bg-white text-black hover:shadow-sm transition-shadow"><FaFacebookF className="h-5 w-5 text-[#1877F2]" />สมัครด้วย Facebook</button>
            </div>

            <div className="md:col-span-2 text-center">
              <p className="text-sm text-stone-600">มีบัญชีแล้ว? <Link to="/signin" className="font-medium text-[#F4A261] hover:text-[#6C4F3D]">เข้าสู่ระบบ</Link></p>
            </div>
          </form>

          {/* Terms and Privacy Modal */}
          {showTermsModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-4xl max-h-[80vh] w-full overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-[#6C4F3D] flex items-center"><FileText className="h-6 w-6 mr-2 text-[#F4A261]" />{modalContent === 'terms' ? 'เงื่อนไขการใช้งาน' : 'นโยบายความเป็นส่วนตัว'}</h3>
                  <button onClick={() => setShowTermsModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="h-6 w-6" /></button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh]"><div className="whitespace-pre-wrap text-sm leading-relaxed text-[#3E3E3E]">{modalContent === 'terms' ? (termsText || 'กำลังโหลดเงื่อนไขการใช้งาน...') : (privacyText || 'กำลังโหลดนโยบายความเป็นส่วนตัว...')}</div></div>
                <div className="p-6 border-t border-gray-200 bg-gray-50"><button onClick={() => setShowTermsModal(false)} className="w-full px-4 py-2 bg-[#F4A261] text-white rounded-lg hover:bg-[#6C4F3D] transition-colors duration-200">ปิด</button></div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;