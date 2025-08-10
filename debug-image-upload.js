import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function debugImageUploadIssues() {
  console.log('🔍 การวินิจฉัยปัญหาการอัปโหลดภาพ...\n');
  
  try {
    // 1. ตรวจสอบ Console Errors ที่พบบ่อย
    console.log('🚨 ปัญหาที่อาจเกิดขึ้น:');
    
    // ตรวจสอบ CORS
    console.log('\n📡 CORS Policy:');
    try {
      const response = await fetch(`${process.env.VITE_SUPABASE_URL}/storage/v1/bucket`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': process.env.VITE_SUPABASE_ANON_KEY
        }
      });
      console.log('✅ CORS ใช้งานได้:', response.status);
    } catch (corsError) {
      console.log('❌ CORS Error:', corsError.message);
    }
    
    // 2. ตรวจสอบ File Size Limits
    console.log('\n📏 File Size Limits:');
    const sizes = [
      { name: '1KB', size: 1024 },
      { name: '1MB', size: 1024 * 1024 },
      { name: '5MB', size: 5 * 1024 * 1024 },
      { name: '10MB', size: 10 * 1024 * 1024 }
    ];
    
    for (const testSize of sizes) {
      try {
        const testData = Buffer.alloc(testSize.size, 'A');
        const fileName = `test-${testSize.name}-${Date.now()}.txt`;
        
        const { error } = await supabase.storage
          .from('lost-pet-images')
          .upload(`test/${fileName}`, testData);
        
        if (error) {
          console.log(`❌ ${testSize.name}: ${error.message}`);
        } else {
          console.log(`✅ ${testSize.name}: อัปโหลดได้`);
          // ลบทิ้ง
          await supabase.storage.from('lost-pet-images').remove([`test/${fileName}`]);
        }
      } catch (err) {
        console.log(`❌ ${testSize.name}: ${err.message}`);
      }
    }
    
    // 3. ตรวจสอบ MIME Types
    console.log('\n🎨 MIME Types:');
    const mimeTypes = [
      { ext: 'jpg', mime: 'image/jpeg' },
      { ext: 'png', mime: 'image/png' },
      { ext: 'gif', mime: 'image/gif' },
      { ext: 'webp', mime: 'image/webp' }
    ];
    
    for (const type of mimeTypes) {
      try {
        const testImage = Buffer.from('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
        const fileName = `test-${type.ext}-${Date.now()}.${type.ext}`;
        
        const { error } = await supabase.storage
          .from('lost-pet-images')
          .upload(`test/${fileName}`, testImage, {
            contentType: type.mime
          });
        
        if (error) {
          console.log(`❌ ${type.ext} (${type.mime}): ${error.message}`);
        } else {
          console.log(`✅ ${type.ext} (${type.mime}): รองรับ`);
          await supabase.storage.from('lost-pet-images').remove([`test/${fileName}`]);
        }
      } catch (err) {
        console.log(`❌ ${type.ext}: ${err.message}`);
      }
    }
    
    // 4. ตรวจสอบ Authentication
    console.log('\n🔐 Authentication:');
    const { data: user, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('⚠️ User ไม่ได้ล็อกอิน (ใช้ anon access)');
    } else {
      console.log('✅ User ล็อกอินแล้ว:', user.user?.email);
    }
    
    // 5. ตรวจสอบ RLS Policies
    console.log('\n🛡️ RLS Policies:');
    
    // ทดสอบ INSERT ตาราง lost_pet_images
    try {
      const { error: insertError } = await supabase
        .from('lost_pet_images')
        .insert({
          lost_pet_id: '00000000-0000-0000-0000-000000000000', // fake ID
          image_url: 'https://example.com/test.jpg'
        });
      
      if (insertError) {
        console.log('❌ ไม่สามารถ INSERT lost_pet_images:', insertError.message);
      } else {
        console.log('✅ สามารถ INSERT lost_pet_images ได้');
      }
    } catch (err) {
      console.log('❌ INSERT Error:', err.message);
    }
    
    // 6. แนะนำการแก้ไข
    console.log('\n💡 การแก้ไขปัญหาที่แนะนำ:');
    console.log('1. ตรวจสอบ Browser Console (F12) หา JavaScript errors');
    console.log('2. ตรวจสอบ Network tab ดู HTTP response codes');
    console.log('3. ตรวจสอบ file size < 5MB');
    console.log('4. ตรวจสอบ file type เป็น image/jpeg, image/png, image/gif');
    console.log('5. ตรวจสอบ internet connection');
    console.log('6. ลอง refresh หน้าเว็บ');
    
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err.message);
  }
}

debugImageUploadIssues();
