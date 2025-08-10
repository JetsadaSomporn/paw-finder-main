🎯 **แก้ไขปัญหา pet_type null constraint**

## ✅ การแก้ไขที่ทำแล้ว:

### 1. เพิ่ม Default Value
```typescript
defaultValues: {
  petType: 'cat',  // ← เพิ่มค่าเริ่มต้น
  sex: 'unknown',
  hasCollar: false,
  // ...
}
```

### 2. เพิ่ม Client-side Validation
```typescript
// Validate required fields
if (!data.petType) {
  toast.error('กรุณาเลือกประเภทสัตว์เลี้ยง');
  return;
}
```

### 3. เพิ่ม Fallback Value
```typescript
const finalData = {
  pet_type: data.petType || 'cat', // ← fallback หากเป็น undefined
  // ...
}
```

### 4. เพิ่ม UI Indicators
- เพิ่ม * ข้างป้าย "ประเภทสัตว์เลี้ยง *"
- เพิ่ม required attribute
- แสดง error message หาก petType ไม่ได้เลือก

### 5. เพิ่ม Debug Logging
```typescript
console.log('📊 ข้อมูลที่จะส่ง:', finalData);
console.log('🔍 Pet Type:', finalData.pet_type);
```

## 🧪 การทดสอบ:

1. **รีเฟรชหน้าเว็บ**: http://localhost:5174/
2. **ไปหน้าแจ้งสัตว์หาย**
3. **ตรวจสอบ**:
   - ประเภทสัตว์เลี้ยงจะถูกเลือกเป็น "แมว" อัตโนมัติ
   - ป้ายจะแสดง * เพื่อระบุว่าเป็นฟิลด์จำเป็น
4. **กรอกข้อมูลและส่ง**
5. **ดู Console logs**:
   - จะแสดง pet_type ที่ถูกส่ง
   - ไม่ควรมี null constraint error อีก

## 🔍 Error ที่คาดหวัง (หากยังมี):

หากยังพบปัญหา อาจเป็นเพราะ:
1. Form state ไม่ sync
2. React Hook Form validation ไม่ทำงาน
3. ข้อมูลสูญหายระหว่างการส่ง

**ลองทดสอบและดู console logs ครับ!** 🚀
