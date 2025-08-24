import { Lock, LogIn, Mail } from "lucide-react";
import { FaFacebookF } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { motion } from 'framer-motion';

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Check if it's an email confirmation error
        if (error.message.includes('Email not confirmed')) {
          setError('กรุณายืนยันอีเมลของคุณก่อนเข้าสู่ระบบ');
        } else {
          throw error;
        }
        return;
      }

      if (data.user) {
        navigate("/");
      }
    } catch (error: any) {
      setError(error.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      // Facebook OAuth re-enabled (previous maintenance toast preserved as comment)
      // const { error } = await supabase.auth.signInWithOAuth({
      //   provider: 'facebook',
      //   options: { redirectTo: `${window.location.origin}/auth/callback` }
      // });
      if (error) throw error;
      
      toast('กำลังปรับปรุงระบบ กรุณาใช้งานผ่าน Google หรือช่องทางอื่นชั่วคราว');
      
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Facebook');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google');
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="min-h-screen bg-[#F7FFE0] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="bg-white/70 backdrop-blur-sm border border-amber-100/40 rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-4 mb-4">
            <img src="/logo.png" alt="Paw Finder Logo" className="h-16 w-16 object-contain" />
            <div>
              <h2 className="text-2xl font-semibold text-[#6C4F3D]">สัตว์เลี้ยงหาย</h2>
              <p className="text-sm text-[#4B4B4B]">เข้าสู่ระบบเพื่อช่วยเหลือสัตว์เลี้ยงที่หายไป</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-[#6C4F3D] mb-2 uppercase tracking-wider">
                อีเมล
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F4A261] h-5 w-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-3 py-3 rounded-xl border border-stone-200 bg-white text-[#2B2B2B] placeholder-[#8B8B8B] focus:outline-none focus:ring-2 focus:ring-[#F4A261] focus:border-[#F4A261] transition-shadow"
                  placeholder="กรอกอีเมลของคุณ"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-[#6C4F3D] mb-2 uppercase tracking-wider">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F4A261] h-5 w-5" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-3 py-3 rounded-xl border border-stone-200 bg-white text-[#2B2B2B] placeholder-[#8B8B8B] focus:outline-none focus:ring-2 focus:ring-[#F4A261] focus:border-[#F4A261] transition-shadow"
                  placeholder="กรอกรหัสผ่านของคุณ"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-3 rounded-full py-3 px-4 bg-gradient-to-r from-[#F4A261] to-[#F4A261] text-white font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="h-5 w-5 text-white" />
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </motion.button>

            <div className="flex items-center my-2">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="px-3 text-sm text-stone-500">หรือ</span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 border border-stone-200 bg-white text-stone-700 hover:shadow-sm transition-shadow"
              >
                <FcGoogle className="h-5 w-5" />
                เข้าสู่ระบบด้วย Google
              </button>

              <button
                type="button"
                onClick={handleFacebookSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 border border-stone-200 bg-white text-black hover:shadow-sm transition-shadow"
              >
                <FaFacebookF className="h-5 w-5 text-[#1877F2]" />
                เข้าสู่ระบบด้วย Facebook
              </button>
            </div>

            <p className="text-center text-sm text-stone-600 mt-3">
              ยังไม่มีบัญชี?{' '}
              <Link to="/signup" className="font-medium text-[#F4A261] hover:text-[#6C4F3D]">
                สมัครสมาชิก
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;
