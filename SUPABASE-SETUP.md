# 📋 คู่มือ Setup Supabase สำหรับ Paw Finder

## 🔑 ขั้นตอนที่ 1: เชื่อมต่อ API Keys
✅ **เสร็จแล้ว** - ไฟล์ .env มี:
```
VITE_SUPABASE_URL=https://djhyjpltfiqukofumlij.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

## 🗃️ ขั้นตอนที่ 2: สร้างตารางฐานข้อมูล (Schema)

### ตารางที่ต้องสร้าง:

#### 1. **lost_pets** (ตารางหลัก - สัตว์หาย)
```sql
- id (UUID)
- pet_name (ชื่อสัตว์)
- breed (สายพันธุ์)
- colors (สี)
- province (จังหวัด)
- contact_name (ชื่อผู้ติดต่อ)
- contact_phone (เบอร์โทร)
- contact_email (อีเมล)
- reward (ค่าตอบแทน)
- status (สถานะ: active/found/closed)
- และอื่นๆ อีกหลายฟิลด์
```

#### 2. **found_pets** (ตารางสัตว์เจอแล้ว)
```sql
- id, pet_type, breed, color
- found_date, location, province
- contact_name, contact_phone, contact_email
- status
```

#### 3. **lost_cat_images** (ตารางรูปภาพสัตว์หาย)
```sql
- id, lost_cat_id, image_url
```

#### 4. **found_pet_images** (ตารางรูปภาพสัตว์เจอ)
```sql
- id, found_pet_id, image_url
```

## 🔐 ขั้นตอนที่ 3: ตั้งค่า Security (RLS & Policies)

### Row Level Security (RLS):
- ✅ เปิดใช้งาน RLS บนทุกตาราง
- ✅ กำหนด Policies ให้:
  - ทุกคนดูข้อมูลได้
  - เฉพาะเจ้าของแก้ไขข้อมูลตัวเองได้

## 📁 ขั้นตอนที่ 4: Setup Storage Buckets
```
- lost-pet-images (เก็บรูปสัตว์หาย)
- found-pet-images (เก็บรูปสัตว์เจอ)
```

## 🚀 วิธีการ Setup:

### แบบที่ 1: ใช้ SQL Editor ใน Supabase Dashboard
```
1. เข้า https://supabase.com/dashboard
2. เลือกโปรเจค
3. ไปที่ SQL Editor
4. Copy & Paste ไฟล์ .sql ทีละไฟล์ตามลำดับ
5. Run ทีละไฟล์
```

### แบบที่ 2: ใช้ Supabase CLI (ง่ายกว่า)
```bash
npx supabase init
npx supabase db reset
```

## 📋 ไฟล์ Migration ที่ต้องรัน (15 ไฟล์):
```
supabase/migrations/
├── 20250604111317_stark_base.sql        ← ตารางหลัก (lost_cats)
├── 20250604112528_violet_art.sql        ← เพิ่มฟีเจอร์
├── 20250604112658_shrill_scene.sql      ← แก้ไข schema
├── 20250604112926_warm_valley.sql       ← เพิ่ม validation
├── 20250604124537_dry_flame.sql         ← ปรับปรุงตาราง
├── 20250604132415_divine_villa.sql      ← เปลี่ยนเป็น lost_pets
├── 20250604133200_fragrant_summit.sql   ← เพิ่ม fields
├── 20250604140000_found_pets_schema.sql ← ตาราง found_pets
├── 20250604150000_add_coordinates_to_lost_pets.sql ← GPS
├── 20250613162302_remote_schema.sql     ← ปรับปรุงใหญ่
├── 20250623154047_remote_schema.sql     ← Schema ล่าสุด
├── 20250626075635_allow_insert_lost_pets_rls.sql ← Security
├── 20250626080133_allow_crud_pet_images_rls.sql  ← Security รูป
├── 20250626081414_allow-anyone-found-pet-bucket.sql ← Storage
└── 20250626130015_add_sex_and_collar_to_pets.sql ← เพิ่มฟิลด์
```

## ✅ วิธีตรวจสอบว่า Setup สำเร็จ:
```bash
npm run test-db
```

## 🆘 ถ้าติดปัญหา:
1. **Schema ไม่ตรง** → รัน migration files ใหม่
2. **RLS Error** → ตรวจสอบ policies
3. **Storage Error** → สร้าง buckets ใหม่

---
**💡 สรุป:** ต้องรัน 15 ไฟล์ .sql ตามลำดับ เพื่อสร้างตาราง + security + storage ให้ครบถ้วน
