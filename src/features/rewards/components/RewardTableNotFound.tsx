import { SearchX } from 'lucide-react';

const RewardTableNotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full text-center py-20 px-6 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
      <div className="p-4 bg-gray-200 rounded-full mb-4">
        <SearchX className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-800">
        ไม่พบสัตว์เลี้ยงที่ตรงเงื่อนไข
      </h3>
      <p className="mt-2 text-md text-gray-500 max-w-md">
        ลองปรับเปลี่ยนฟิลเตอร์การค้นหาของคุณ หรือกลับมาตรวจสอบอีกครั้งในภายหลัง
      </p>
    </div>
  );
};

export default RewardTableNotFound;
