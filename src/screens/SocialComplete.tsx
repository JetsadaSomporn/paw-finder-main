import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

const SocialComplete: React.FC = () => {
  const [username, setUsername] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          navigate('/signin');
          return;
        }

        // load profile if exists
        const user = data.session.user;
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile?.username) setUsername(profile.username);
        if (profile?.terms_accepted_at) setAcceptTerms(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [navigate]);

  const validateUsername = (u: string) => {
    return /^[a-zA-Z0-9_]{3,30}$/.test(u);
  };

  const handleSave = async () => {
    setError('');
    if (!validateUsername(username)) {
      setError('Username ต้องมี 3-30 ตัวอักษร และใช้ได้เฉพาะ a-z, 0-9, _');
      return;
    }

    if (!acceptTerms) {
      setError('กรุณายอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว');
      return;
    }

    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', username)
        .single();

      if (existing) {
        setError('Username นี้ถูกใช้แล้ว');
        setSaving(false);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) {
        setError('ไม่พบบัญชีผู้ใช้');
        setSaving(false);
        return;
      }

      // upsert profile
      const updates: any = {
        id: user.id,
        username: username,
        terms_accepted_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FFE0] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-[#F4A261] animate-spin mx-auto" />
          <p className="mt-4 text-[#3E3E3E]">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FFE0] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-[#F4A261]">
          <h3 className="text-2xl font-semibold text-[#6C4F3D] mb-4">เกือบเรียบร้อย</h3>
          <p className="text-sm text-[#3E3E3E] mb-4">กรุณาตั้งชื่อผู้ใช้ และยอมรับเงื่อนไขการใช้งานเพื่อเข้าสู่ระบบ</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#6C4F3D]">ชื่อผู้ใช้ (Username)</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[#F4A261] rounded-lg bg-white"
                placeholder="ชื่อผู้ใช้ 3-30 ตัวอักษร (a-z, 0-9, _)"
              />
            </div>

            <div className="flex items-start space-x-3">
              <input
                id="socialAccept"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-[#F4A261] focus:ring-[#F4A261] border-gray-300 rounded"
              />
              <label htmlFor="socialAccept" className="text-sm text-[#3E3E3E]">
                ฉันยอมรับ <button type="button" className="text-[#F4A261] underline">เงื่อนไขการใช้งาน</button> และ <button type="button" className="text-[#F4A261] underline">นโยบายความเป็นส่วนตัว</button>
              </label>
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>}

            <div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full px-4 py-3 bg-[#F4A261] text-white rounded-lg hover:bg-[#6C4F3D]"
              >
                {saving ? 'กำลังบันทึก...' : 'ยืนยันและเข้าสู่ระบบ'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialComplete;
