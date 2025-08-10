import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// โหลด environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔌 กำลังทดสอบการเชื่อมต่อฐานข้อมูล Supabase...\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ไม่พบ environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅ พบแล้ว' : '❌ ไม่พบ');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ พบแล้ว' : '❌ ไม่พบ');
  process.exit(1);
}

// สร้าง Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('📊 ทดสอบการเชื่อมต่อฐานข้อมูล...');
    
    // ทดสอบการเชื่อมต่อด้วยการดึงข้อมูล version
    const { data, error } = await supabase
      .from('lost_pets')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ:', error.message);
      return false;
    }
    
    console.log('✅ เชื่อมต่อฐานข้อมูลสำเร็จ!');
    console.log('📈 จำนวนข้อมูลใน lost_pets table:', data || 0);
    return true;
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาด:', err.message);
    return false;
  }
}

async function testTables() {
  console.log('\n🔍 ทดสอบการเข้าถึงตารางต่างๆ...');
  
  const tables = [
    'lost_pets',
    'found_pets', 
    'lost_cat_images',
    'found_pet_images'
  ];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: เข้าถึงได้`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
}

async function testCRUD() {
  console.log('\n📝 ทดสอบการเพิ่ม/อ่าน/แก้ไข/ลบข้อมูล (CRUD)...');
  
  try {
    // สร้างข้อมูลทดสอบ
    console.log('➕ กำลังเพิ่มข้อมูลทดสอบ...');
    const testData = {
      pet_name: 'แมวทดสอบ',
      breed: 'เปอร์เซีย',
      colors: 'ขาว',
      description: 'นี่คือข้อมูลทดสอบ',
      contact_name: 'ผู้ทดสอบ',
      contact_phone: '0123456789',
      contact_email: 'test@example.com',
      province: 'กรุงเทพมหานคร',
      district: 'ห้วยขวาง',
      last_seen_location: 'บริเวณบ้านทดสอบ',
      user_id: null,
      status: 'lost'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('lost_pets')
      .insert(testData)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ เพิ่มข้อมูลไม่สำเร็จ:', insertError.message);
      return;
    }
    
    console.log('✅ เพิ่มข้อมูลสำเร็จ ID:', insertData.id);
    
    // อ่านข้อมูล
    console.log('📖 กำลังอ่านข้อมูลที่เพิ่ม...');
    const { data: readData, error: readError } = await supabase
      .from('lost_pets')
      .select('*')
      .eq('id', insertData.id)
      .single();
    
    if (readError) {
      console.log('❌ อ่านข้อมูลไม่สำเร็จ:', readError.message);
    } else {
      console.log('✅ อ่านข้อมูลสำเร็จ:', readData.pet_name);
    }
    
    // แก้ไขข้อมูล
    console.log('✏️ กำลังแก้ไขข้อมูล...');
    const { data: updateData, error: updateError } = await supabase
      .from('lost_pets')
      .update({ pet_name: 'แมวทดสอบ (แก้ไขแล้ว)' })
      .eq('id', insertData.id)
      .select()
      .single();
    
    if (updateError) {
      console.log('❌ แก้ไขข้อมูลไม่สำเร็จ:', updateError.message);
    } else {
      console.log('✅ แก้ไขข้อมูลสำเร็จ:', updateData.pet_name);
    }
    
    // ลบข้อมูล
    console.log('🗑️ กำลังลบข้อมูลทดสอบ...');
    const { error: deleteError } = await supabase
      .from('lost_pets')
      .delete()
      .eq('id', insertData.id);
    
    if (deleteError) {
      console.log('❌ ลบข้อมูลไม่สำเร็จ:', deleteError.message);
    } else {
      console.log('✅ ลบข้อมูลทดสอบสำเร็จ');
    }
    
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาดในการทดสอบ CRUD:', err.message);
  }
}

async function testAuth() {
  console.log('\n🔐 ทดสอบระบบ Authentication...');
  
  try {
    // ทดสอบการดึงข้อมูล session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ เกิดข้อผิดพลาดในการดึง session:', error.message);
    } else {
      console.log('✅ ระบบ Auth พร้อมใช้งาน');
      console.log('👤 Session:', session ? 'มี user ล็อกอินอยู่' : 'ไม่มี user ล็อกอิน');
    }
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาดในการทดสอบ Auth:', err.message);
  }
}

async function runAllTests() {
  console.log('🚀 เริ่มทดสอบฐานข้อมูล Supabase');
  console.log('=' * 50);
  
  const isConnected = await testConnection();
  
  if (isConnected) {
    await testTables();
    await testCRUD();
    await testAuth();
  }
  
  console.log('\n' + '=' * 50);
  console.log('🏁 การทดสอบเสร็จสิ้น');
}

// เรียกใช้งานการทดสอบ
runAllTests().catch(console.error);
