import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const AuthCallback = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setMessage(error.message || 'เกิดข้อผิดพลาดในการยืนยันอีเมล');
          return;
        }

        if (data.session) {
          // Check if profile exists and has username/terms
          try {
            const user = data.session.user;
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();

            const needsUsername = !profileData || !profileData.username;
            const needsTerms = !profileData || !profileData.terms_accepted_at;

            // Determine if the sign-in was via a social provider (non-email)
            const identities = (user as any)?.identities as Array<any> | undefined;
            const signedInWithSocial = Array.isArray(identities)
              ? identities.some((id) => id.provider && id.provider !== 'email')
              : false;

            // Only redirect social provider sign-ins to the social-complete flow.
            if (signedInWithSocial && (needsUsername || needsTerms)) {
              navigate('/social-complete');
              return;
            }

            setStatus('success');
            setMessage('ยืนยันอีเมลสำเร็จ! กำลังนำคุณไปยังหน้าหลัก...');
            setTimeout(() => {
              navigate('/');
            }, 1200);
            return;
          } catch (err) {
            console.error('Error checking profile:', err);
            setStatus('error');
            setMessage('เกิดข้อผิดพลาดขณะตรวจสอบโปรไฟล์');
            return;
          }
        } else {
          setStatus('error');
          setMessage('ไม่พบข้อมูลการยืนยัน');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setStatus('error');
        setMessage('เกิดข้อผิดพลาดที่ไม่คาดคิด');
      }
    };

    handleAuthCallback();
  }, [navigate]);

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
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 border border-[#F4A261]">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <div className="flex justify-center mb-6">
                  <Loader2 className="h-20 w-20 text-[#F4A261] animate-spin" />
                </div>
                <h3 className="text-2xl font-semibold text-[#6C4F3D] mb-4">
                  กำลังยืนยันอีเมล...
                </h3>
                <p className="text-[#3E3E3E]">
                  กรุณารอสักครู่
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="flex justify-center mb-6">
                  <CheckCircle className="h-20 w-20 text-green-500" />
                </div>
                <h3 className="text-2xl font-semibold text-[#6C4F3D] mb-4">
                  ยืนยันสำเร็จ!
                </h3>
                <p className="text-[#3E3E3E]">
                  {message}
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="flex justify-center mb-6">
                  <XCircle className="h-20 w-20 text-red-500" />
                </div>
                <h3 className="text-2xl font-semibold text-[#6C4F3D] mb-4">
                  เกิดข้อผิดพลาด
                </h3>
                <p className="text-[#3E3E3E] mb-6">
                  {message}
                </p>
                <button
                  onClick={() => navigate('/signin')}
                  className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#F4A261] hover:bg-[#6C4F3D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F4A261] transition-colors duration-200"
                >
                  กลับไปหน้าเข้าสู่ระบบ
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
