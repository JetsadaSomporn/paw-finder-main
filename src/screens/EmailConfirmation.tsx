import { CheckCircle, Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const EmailConfirmation = () => {
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
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Mail className="h-20 w-20 text-[#F4A261]" />
                <CheckCircle className="h-8 w-8 text-green-500 absolute -bottom-1 -right-1 bg-white rounded-full" />
              </div>
            </div>
            
            <h3 className="text-2xl font-semibold text-[#6C4F3D] mb-4">
              ตรวจสอบอีเมลของคุณ
            </h3>
            
            <div className="space-y-4 text-[#3E3E3E]">
              <p className="text-lg">
                เราได้ส่งลิงก์ยืนยันไปยังอีเมลของคุณแล้ว
              </p>
              
              <div className="bg-[#F7FFE0] border border-[#F4A261] rounded-lg p-4">
                <p className="text-sm">
                  กรุณาคลิกลิงก์ในอีเมลเพื่อยืนยันบัญชีของคุณ หากไม่พบอีเมล กรุณาตรวจสอบในโฟลเดอร์ Spam
                </p>
              </div>
              
              <div className="space-y-2 text-sm">
                <p>ยังไม่ได้รับอีเมล?</p>
                <button className="text-[#F4A261] hover:text-[#6C4F3D] font-medium transition-colors duration-200">
                  ส่งอีเมลยืนยันใหม่
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/signin"
            className="inline-flex items-center space-x-2 text-[#F4A261] hover:text-[#6C4F3D] font-medium transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>กลับไปหน้าเข้าสู่ระบบ</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
