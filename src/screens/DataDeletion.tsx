import React from 'react';

const DataDeletion: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Data Deletion Instructions – Paw Finder</h1>
      <p className="mb-4">ถ้าคุณต้องการลบบัญชี/ข้อมูลทั้งหมดจาก Paw Finder ให้ทำตามขั้นตอน:</p>
      <ol className="list-decimal list-inside mb-4 space-y-2">
        <li>
          ส่งอีเมลไปที่ <a href="mailto:jetsadasompornar@gmail.com" className="text-blue-600 underline">jetsadasompornar@gmail.com</a>
          โดยใช้ <strong>อีเมลที่ใช้ล็อกอิน</strong> หรือแนบ <strong>Facebook profile link/ID</strong>.
        </li>
        <li>
          หัวเรื่อง: <strong>Request to Delete Paw Finder Account</strong>
        </li>
        <li>
          ระบุข้อมูลยืนยันตัวตน: อีเมลที่สมัคร / FB ID / หมายเลขโทรศัพท์ (ถ้ามี)
        </li>
      </ol>

      <p className="mb-4">เมื่อได้รับคำขอ เราจะลบข้อมูลบัญชี (โปรไฟล์, โพสต์, สื่อที่อัพโหลด) ภายใน <strong>30 วัน</strong>.
      ข้อมูลที่ต้องเก็บตามกฎหมาย (เช่น logs บางส่วน) จะถูกเก็บรักษาเท่าที่จำเป็นเท่านั้น.</p>

      <p>หากต้องการสอบถามสถานะการลบ โปรดติดต่ออีเมลด้านบน</p>
    </div>
  );
};

export default DataDeletion;
