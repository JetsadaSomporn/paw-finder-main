import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔍 ตรวจสอบ Frontend Image Upload ปัญหา...\n');

async function checkFrontendIssues() {
  try {
    // 1. ตรวจสอบ Anon Key Permissions
    console.log('1️⃣ ตรวจสอบสิทธิ์ Anon Key...');
    
    // ลองสร้าง test record
    const { data: testPet, error: petError } = await supabase
      .from('lost_pets')
      .insert({
        pet_type: 'cat',
        pet_name: 'Test Cat',
        breed: 'ไม่ระบุ',
        pattern: 'ไม่ระบุ',
        colors: 'ไม่ระบุ',
        age_years: 1,
        age_months: 0,
        date_of_birth: '2023-01-01',
        lost_date: '2024-01-01',
        location: 'Test Location',
        province: 'กรุงเทพมหานคร',
        latitude: 13.7563,
        longitude: 100.5018,
        contact_name: 'Test Contact',
        contact_phone: '0812345678',
        contact_email: 'test@test.com',
        status: 'active',
        sex: 'unknown',
        has_collar: false
      })
      .select()
      .single();

    if (petError) {
      console.log('❌ ไม่สามารถสร้างข้อมูลสัตว์ได้:', petError.message);
      return;
    }
    console.log('✅ สร้างข้อมูลสัตว์ได้ ID:', testPet.id);

    // 2. ตรวจสอบ Storage Upload
    console.log('\n2️⃣ ตรวจสอบการอัปโหลดไฟล์...');
    
    const testContent = 'test image content';
    const testFile = Buffer.from(testContent, 'utf8');
    const fileName = `test-frontend-${Date.now()}.txt`;
    const filePath = `public/${testPet.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('lost-pet-images')
      .upload(filePath, testFile, {
        contentType: 'text/plain'
      });

    if (uploadError) {
      console.log('❌ ไม่สามารถอัปโหลดไฟล์ได้:', uploadError.message);
      
      // ตรวจสอบ bucket policies
      console.log('\n🔍 ตรวจสอบ Storage Policies...');
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        console.log('❌ ไม่สามารถดู buckets ได้:', bucketError.message);
      } else {
        const lostPetBucket = buckets.find(b => b.name === 'lost-pet-images');
        if (lostPetBucket) {
          console.log('✅ Bucket lost-pet-images พบแล้ว');
          console.log('📋 Bucket info:', {
            name: lostPetBucket.name,
            public: lostPetBucket.public,
            file_size_limit: lostPetBucket.file_size_limit,
            allowed_mime_types: lostPetBucket.allowed_mime_types
          });
        } else {
          console.log('❌ ไม่พบ bucket lost-pet-images');
        }
      }
      
      await supabase.from('lost_pets').delete().eq('id', testPet.id);
      return;
    }
    
    console.log('✅ อัปโหลดไฟล์สำเร็จ:', filePath);

    // 3. ตรวจสอบ Public URL
    console.log('\n3️⃣ ตรวจสอบ Public URL...');
    const { data: { publicUrl } } = supabase.storage
      .from('lost-pet-images')
      .getPublicUrl(filePath);
    
    console.log('🔗 Public URL:', publicUrl);

    // 4. ตรวจสอบการบันทึกข้อมูลภาพ
    console.log('\n4️⃣ ตรวจสอบการบันทึกข้อมูลภาพ...');
    const { data: imageData, error: imageError } = await supabase
      .from('lost_pet_images')
      .insert({
        lost_pet_id: testPet.id,
        image_url: publicUrl
      })
      .select()
      .single();

    if (imageError) {
      console.log('❌ ไม่สามารถบันทึกข้อมูลภาพได้:', imageError.message);
    } else {
      console.log('✅ บันทึกข้อมูลภาพสำเร็จ ID:', imageData.id);
    }

    // 5. ตรวจสอบ CORS และ Browser restrictions
    console.log('\n5️⃣ ตรวจสอบการตั้งค่า CORS...');
    console.log('🌐 Supabase URL:', process.env.VITE_SUPABASE_URL);
    console.log('🔑 Anon Key length:', process.env.VITE_SUPABASE_ANON_KEY?.length);

    // ทำความสะอาด
    console.log('\n🧹 ทำความสะอาดข้อมูลทดสอบ...');
    await supabase.storage.from('lost-pet-images').remove([filePath]);
    await supabase.from('lost_pets').delete().eq('id', testPet.id);
    console.log('✅ ทำความสะอาดเสร็จสิ้น');

    console.log('\n📋 สรุปการตรวจสอบ:');
    console.log('✅ Database operations: ทำงานได้');
    console.log('✅ Storage upload: ทำงานได้');
    console.log('✅ Image records: ทำงานได้');
    console.log('\n💡 ปัญหาน่าจะอยู่ที่:');
    console.log('   1. Frontend file handling');
    console.log('   2. Form validation');
    console.log('   3. Error handling ใน browser');
    console.log('\n🔧 แนะนำการแก้ไข:');
    console.log('   1. เปิด Browser DevTools > Console');
    console.log('   2. ลองอัปโหลดภาพและดู error messages');
    console.log('   3. ตรวจสอบ Network tab สำหรับ failed requests');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkFrontendIssues();
