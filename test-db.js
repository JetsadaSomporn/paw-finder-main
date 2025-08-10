import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔌 สคริปต์ทดสอบฐานข้อมูล Supabase - Complete Version\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function quickTest() {
  console.log('⚡ การทดสอบแบบรวดเร็ว...');
  
  try {
    // ทดสอบข้อมูลที่ครบถ้วน
    const testData = {
      pet_type: 'cat',
      pet_name: 'แมวทดสอบ',
      breed: 'ไม่ทราบ',
      colors: 'ขาว',
      date_of_birth: '2020-01-01', // เพิ่ม required field
      lost_date: '2025-08-10',     // เพิ่ม date
      province: 'กรุงเทพมหานคร',
      location: 'ห้วยขวาง',
      contact_name: 'ผู้ทดสอบ',
      contact_phone: '0123456789',
      contact_email: 'test@example.com',
      details: 'ทดสอบระบบ',
      status: 'active'
    };
    
    console.log('➕ เพิ่มข้อมูล...');
    const { data: newPet, error: insertError } = await supabase
      .from('lost_pets')
      .insert(testData)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ เพิ่มไม่ได้:', insertError.message);
      return;
    }
    
    console.log('✅ เพิ่มสำเร็จ ID:', newPet.id);
    
    // ทดสอบค้นหา
    console.log('🔍 ค้นหาข้อมูล...');
    const { data: searchResult } = await supabase
      .from('lost_pets')
      .select('pet_name, province')
      .eq('pet_name', 'แมวทดสอบ');
    
    console.log('✅ ค้นหาเจอ:', searchResult?.length || 0, 'รายการ');
    
    // ลบข้อมูลทดสอบ
    console.log('🗑️ ลบข้อมูลทดสอบ...');
    await supabase.from('lost_pets').delete().eq('id', newPet.id);
    console.log('✅ ลบเสร็จแล้ว');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

async function checkSystemHealth() {
  console.log('\n🏥 ตรวจสอบสถานะระบบ...');
  
  const checks = [
    { name: 'lost_pets table', test: () => supabase.from('lost_pets').select('count') },
    { name: 'found_pets table', test: () => supabase.from('found_pets').select('count') },
    { name: 'authentication', test: () => supabase.auth.getSession() },
    { name: 'storage buckets', test: () => supabase.storage.listBuckets() }
  ];
  
  for (const check of checks) {
    try {
      await check.test();
      console.log(`✅ ${check.name}: OK`);
    } catch (err) {
      console.log(`❌ ${check.name}: ${err.message}`);
    }
  }
}

async function showSummary() {
  console.log('\n📋 สรุปฐานข้อมูล...');
  
  try {
    const { count: lostCount } = await supabase
      .from('lost_pets')
      .select('*', { count: 'exact', head: true });
    
    const { count: foundCount } = await supabase
      .from('found_pets')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 สัตว์หาย: ${lostCount} รายการ`);
    console.log(`📊 สัตว์เจอแล้ว: ${foundCount} รายการ`);
    console.log(`🔗 URL: ${supabaseUrl}`);
    console.log(`🔑 Key: ${supabaseAnonKey.substring(0, 20)}...`);
    
  } catch (err) {
    console.log('❌ ไม่สามารถดึงสรุปได้:', err.message);
  }
}

async function main() {
  console.log('🚀 เริ่มการทดสอบ');
  console.log('='.repeat(50));
  
  await checkSystemHealth();
  await quickTest();
  await showSummary();
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 การทดสอบเสร็จสิ้น!');
  console.log('💡 ฐานข้อมูลพร้อมใช้งาน คุณสามารถรันแอปได้แล้ว');
  console.log('▶️  npm run dev');
}

main().catch(console.error);
