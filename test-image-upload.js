import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testImageUpload() {
  console.log('📸 ทดสอบการอัปโหลดภาพ...\n');
  
  try {
    // 1. ตรวจสอบ Storage Buckets
    console.log('🗂️ ตรวจสอบ Storage Buckets:');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Error getting buckets:', bucketError.message);
      return;
    }
    
    console.log('✅ Buckets ที่มี:');
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (public: ${bucket.public})`);
    });
    
    // 2. ตรวจสอบ Bucket Policies
    console.log('\n🔐 ตรวจสอบ Bucket Policies:');
    const bucketNames = ['lost-pet-images', 'found-pet-images'];
    
    for (const bucketName of bucketNames) {
      console.log(`\n📦 Bucket: ${bucketName}`);
      
      // ลองดูไฟล์ในบัคเก็ต
      const { data: files, error: listError } = await supabase.storage
        .from(bucketName)
        .list('public', { limit: 5 });
      
      if (listError) {
        console.log(`❌ ไม่สามารถดูไฟล์ได้: ${listError.message}`);
      } else {
        console.log(`✅ สามารถดูไฟล์ได้ (${files.length} ไฟล์)`);
      }
    }
    
    // 3. สร้างไฟล์ทดสอบ
    console.log('\n📄 สร้างไฟล์ทดสอบ:');
    const testImageContent = Buffer.from('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
    const testFileName = `test-${Date.now()}.png`;
    const testFilePath = `public/${testFileName}`;
    
    console.log(`📝 กำลังอัปโหลด: ${testFileName}`);
    
    // 4. ทดสอบอัปโหลดไปยัง lost-pet-images
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lost-pet-images')
      .upload(testFilePath, testImageContent, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.log('❌ อัปโหลดล้มเหลว:', uploadError.message);
      
      // ตรวจสอบรายละเอียดข้อผิดพลาด
      console.log('📋 รายละเอียด Error:');
      console.log('   Code:', uploadError.statusCode);
      console.log('   Message:', uploadError.message);
      
      // ตรวจสอบสิทธิ์การอัปโหลด
      console.log('\n🔍 ตรวจสอบสิทธิ์:');
      
      // ลองสร้าง bucket ใหม่
      const { data: createData, error: createError } = await supabase.storage
        .createBucket('lost-pet-images', { public: true });
      
      if (createError && !createError.message.includes('already exists')) {
        console.log('❌ ไม่สามารถสร้าง bucket ได้:', createError.message);
      } else {
        console.log('✅ Bucket พร้อมใช้งาน');
      }
      
    } else {
      console.log('✅ อัปโหลดสำเร็จ:', uploadData.path);
      
      // 5. ทดสอบดึง URL สาธารณะ
      const { data: urlData } = supabase.storage
        .from('lost-pet-images')
        .getPublicUrl(testFilePath);
      
      console.log('🔗 Public URL:', urlData.publicUrl);
      
      // 6. ลบไฟล์ทดสอบ
      const { error: deleteError } = await supabase.storage
        .from('lost-pet-images')
        .remove([testFilePath]);
      
      if (deleteError) {
        console.log('⚠️ ลบไฟล์ทดสอบไม่ได้:', deleteError.message);
      } else {
        console.log('🗑️ ลบไฟล์ทดสอบแล้ว');
      }
    }
    
    // 7. ตรวจสอบตาราง images
    console.log('\n📊 ตรวจสอบตาราง Image:');
    
    const { data: lostImages, error: lostImagesError } = await supabase
      .from('lost_pet_images')
      .select('*')
      .limit(3);
    
    if (lostImagesError) {
      console.log('❌ ตาราง lost_pet_images:', lostImagesError.message);
    } else {
      console.log(`✅ ตาราง lost_pet_images: ${lostImages.length} รายการ`);
    }
    
    const { data: foundImages, error: foundImagesError } = await supabase
      .from('found_pet_images')
      .select('*')
      .limit(3);
    
    if (foundImagesError) {
      console.log('❌ ตาราง found_pet_images:', foundImagesError.message);
    } else {
      console.log(`✅ ตาราง found_pet_images: ${foundImages.length} รายการ`);
    }
    
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err.message);
  }
}

// รันการทดสอบ
testImageUpload();
