export const loadTermsOfService = async (): Promise<string> => {
  try {
    const response = await fetch('/term of service.txt');
    if (!response.ok) {
      throw new Error('Failed to load Terms of Service');
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading Terms of Service:', error);
    return 'ไม่สามารถโหลดเงื่อนไขการใช้งานได้ กรุณาลองใหม่อีกครั้ง';
  }
};

export const loadPrivacyPolicy = async (): Promise<string> => {
  try {
    const response = await fetch('/privacy of policy.txt');
    if (!response.ok) {
      throw new Error('Failed to load Privacy Policy');
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading Privacy Policy:', error);
    return 'ไม่สามารถโหลดนโยบายความเป็นส่วนตัวได้ กรุณาลองใหม่อีกครั้ง';
  }
};

// ฟังก์ชันสำหรับแปลงข้อความ plain text ให้มี format ที่อ่านง่าย
export const formatTextContent = (text: string): string => {
  return text
    .replace(/\n\n/g, '</p><p className="text-justify">')
    .replace(/\n•\s*/g, '</p><li>')
    .replace(/(\d+\.\s[^•\n]+)/g, '</p><h3 className="text-lg font-semibold text-[#6C4F3D] mt-6">$1</h3><p className="text-justify">');
};
