import { Lock, LogIn, Mail, Facebook } from "lucide-react";
import { FaGoogle } from 'react-icons/fa';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      });
      if (error) throw error;
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
            เข้าสู่ระบบเพื่อช่วยเหลือสัตว์เลี้ยงที่หายไป
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-10 py-3 border border-[#F4A261] placeholder-[#3E3E3E] text-[#2B2B2B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4A261] focus:border-[#F4A261] focus:z-10 sm:text-sm bg-white"
                  placeholder="กรอกรหัสผ่านของคุณ"
                />
              </div>
            </div>
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
                <LogIn className="h-5 w-5 text-white group-hover:text-white" />
              </span>
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
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

          {/* Social Sign In Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleFacebookSignIn}
              disabled={loading}
              className={`w-full flex items-center justify-center px-4 py-3 border rounded-lg text-white font-medium transition-colors duration-200 bg-[#1877F2] hover:bg-[#166FE5]`}
            >
              <Facebook className="h-5 w-5 mr-2" />
              เข้าสู่ระบบด้วย Facebook
            </button>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className={`w-full flex items-center justify-center px-4 py-3 border rounded-lg font-medium transition-colors duration-200 bg-white hover:bg-gray-50 text-gray-700 border-gray-300`}
            >
              <FaGoogle className="h-5 w-5 mr-2" />
              เข้าสู่ระบบด้วย Google
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-[#3E3E3E]">
              ยังไม่มีบัญชี?{" "}
              <Link
                to="/signup"
                className="font-medium text-[#F4A261] hover:text-[#6C4F3D] transition-colors duration-200"
              >
                สมัครสมาชิก
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
