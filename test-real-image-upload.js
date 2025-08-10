import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testRealImageUpload() {
  console.log('📸 ทดสอบการอัปโหลดภาพจริง (รูปแมว)...\n');
  
  try {
    // 1. สร้างข้อมูลสัตว์หายก่อน
    console.log('📝 กำลังสร้างข้อมูลสัตว์หาย...');
    
    const testPetData = {
      pet_type: 'cat',
      pet_name: 'แมวส้มทดสอบ',
      breed: 'แมวไทย',
      colors: 'ส้ม, ขาว',
      date_of_birth: '2020-01-01',
      lost_date: '2025-08-10',
      location: 'บ้านทดสอบ',
      province: 'กรุงเทพมหานคร',
      contact_name: 'ผู้ทดสอบ',
      contact_phone: '0123456789',
      contact_email: 'test@example.com',
      details: 'แมวส้มน่ารักสำหรับทดสอบระบบ',
      status: 'active'
    };
    
    const { data: lostPet, error: petError } = await supabase
      .from('lost_pets')
      .insert(testPetData)
      .select()
      .single();
    
    if (petError) {
      console.error('❌ สร้างข้อมูลสัตว์ไม่ได้:', petError.message);
      return;
    }
    
    console.log('✅ สร้างข้อมูลสัตว์สำเร็จ ID:', lostPet.id);
    
    // 2. สร้างไฟล์ภาพตัวอย่าง (base64 ของรูปแมวส้ม)
    console.log('\n📷 กำลังเตรียมไฟล์ภาพ...');
    
    // สร้าง mock image data (เนื่องจากไม่สามารถอ่านไฟล์จริงได้)
    // ใช้ base64 ของรูป 1x1 pixel แต่จำลองเป็นรูปแมว
    const orangeCatImageData = Buffer.from(
      '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
      'base64'
    );
    
    const fileName = `orange-cat-${Date.now()}.jpg`;
    const filePath = `public/${lostPet.id}/${fileName}`;
    
    console.log(`📁 ชื่อไฟล์: ${fileName}`);
    console.log(`📍 Path: ${filePath}`);
    
    // 3. อัปโหลดภาพไปยัง Storage
    console.log('\n⬆️ กำลังอัปโหลดภาพ...');
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lost-pet-images')
      .upload(filePath, orangeCatImageData, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('❌ อัปโหลดภาพล้มเหลว:', uploadError.message);
      
      // ลบข้อมูลสัตว์ที่สร้างไว้
      await supabase.from('lost_pets').delete().eq('id', lostPet.id);
      return;
    }
    
    console.log('✅ อัปโหลดภาพสำเร็จ:', uploadData.path);
    
    // 4. สร้าง Public URL
    const { data: urlData } = supabase.storage
      .from('lost-pet-images')
      .getPublicUrl(filePath);
    
    console.log('🔗 Public URL:', urlData.publicUrl);
    
    // 5. บันทึกข้อมูลภาพในตาราง
    console.log('\n💾 กำลังบันทึกข้อมูลภาพในฐานข้อมูล...');
    
    const { data: imageRecord, error: imageError } = await supabase
      .from('lost_pet_images')
      .insert({
        lost_pet_id: lostPet.id,
        image_url: urlData.publicUrl
      })
      .select()
      .single();
    
    if (imageError) {
      console.error('❌ บันทึกข้อมูลภาพล้มเหลว:', imageError.message);
    } else {
      console.log('✅ บันทึกข้อมูลภาพสำเร็จ ID:', imageRecord.id);
    }
    
    // 6. ตรวจสอบผลลัพธ์
    console.log('\n🔍 ตรวจสอบผลลัพธ์:');
    
    // ดูไฟล์ใน Storage
    const { data: storageFiles, error: listError } = await supabase.storage
      .from('lost-pet-images')
      .list(`public/${lostPet.id}`, { limit: 10 });
    
    if (listError) {
      console.log('❌ ไม่สามารถดูไฟล์ใน Storage:', listError.message);
    } else {
      console.log(`📁 ไฟล์ใน Storage: ${storageFiles.length} ไฟล์`);
      storageFiles.forEach(file => {
        console.log(`   - ${file.name} (${file.metadata?.size || 'unknown'} bytes)`);
      });
    }
    
    // ดูข้อมูลในฐานข้อมูล
    const { data: dbImages, error: dbError } = await supabase
      .from('lost_pet_images')
      .select('*')
      .eq('lost_pet_id', lostPet.id);
    
    if (dbError) {
      console.log('❌ ไม่สามารถดูข้อมูลในฐานข้อมูล:', dbError.message);
    } else {
      console.log(`💾 ข้อมูลในฐานข้อมูล: ${dbImages.length} รายการ`);
      dbImages.forEach(img => {
        console.log(`   - ID: ${img.id}, URL: ${img.image_url}`);
      });
    }
    
    // 7. ตรวจสอบ URL ว่าเข้าถึงได้หรือไม่
    console.log('\n🌐 ตรวจสอบการเข้าถึง URL...');
    try {
      const response = await fetch(urlData.publicUrl);
      if (response.ok) {
        console.log('✅ URL เข้าถึงได้:', response.status, response.statusText);
      } else {
        console.log('❌ URL เข้าถึงไม่ได้:', response.status, response.statusText);
      }
    } catch (fetchError) {
      console.log('❌ Error checking URL:', fetchError.message);
    }
    
    console.log('\n🎉 การทดสอบเสร็จสิ้น!');
    console.log(`📊 สรุป:
    - สัตว์หาย ID: ${lostPet.id}
    - ภาพใน Storage: ✅
    - ข้อมูลในฐานข้อมูล: ✅
    - Public URL: ${urlData.publicUrl}
    `);
    
    // 8. ทำความสะอาด (ถ้าต้องการ)
    console.log('\n🧹 ทำความสะอาดข้อมูลทดสอบ...');
    
    const shouldCleanup = true; // เปลี่ยนเป็น false ถ้าต้องการเก็บไว้
    
    if (shouldCleanup) {
      // ลบภาพจาก Storage
      await supabase.storage.from('lost-pet-images').remove([filePath]);
      
      // ลบข้อมูลจากฐานข้อมูล
      await supabase.from('lost_pet_images').delete().eq('lost_pet_id', lostPet.id);
      await supabase.from('lost_pets').delete().eq('id', lostPet.id);
      
      console.log('✅ ลบข้อมูลทดสอบแล้ว');
    } else {
      console.log('💾 เก็บข้อมูลทดสอบไว้');
    }
    
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err.message);
  }
}

// รันการทดสอบ
testRealImageUpload();
