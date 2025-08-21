import { zodResolver } from '@hookform/resolvers/zod';
import { Info, MapPin, Upload } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { provinces } from '../data/provinces';
import { PetCharacteristics } from '../features/pets/components/PetCharacteristics';
import {
  FoundPetFormInputs,
  FoundPetFormSchema,
} from '../features/pets/types/foundPetFormSchema';
import { supabase } from '../lib/supabase';
import ImageUpload from '../shared/components/ImageUpload';
import MapSelector from '../shared/components/MapSelector';
import { Button } from '../shared/components/ui/button';
import { Input } from '../shared/components/ui/input';
import { Label } from '../shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../shared/components/ui/select';
import { Switch } from '../shared/components/ui/switch';
import { Textarea } from '../shared/components/ui/textarea';
import { petTypes } from '@/features/pets/constants/pet.constant';
import { FaFacebookF } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

const today = new Date().toISOString().split('T')[0];

const FORM_DEFAULT_VALUES: FoundPetFormInputs = {
  sex: 'unknown',
  hasCollar: false,
  breed: '',
  pattern: '',
  colors: [],
  latitude: 13.7563,
  longitude: 100.5018,
  images: [],
  petType: '',
  foundDate: today,
  location: '',
  province: '',
  details: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
};

const FoundPetForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FoundPetFormInputs>({
    resolver: zodResolver(FoundPetFormSchema),
    defaultValues: FORM_DEFAULT_VALUES,
  });

  const {
    breed = '',
    pattern = '',
    colors = [],
    images = [],
    sex,
    petType: selectedPetType,
    hasCollar,
  } = watch();

  const { user, refreshProfile } = useAuth();
  // Marker & inline auth panel state
  const [markerPlaced, setMarkerPlaced] = React.useState<boolean>(false);
  const [mapError, setMapError] = React.useState<string | null>(null);

  // Inline auth panel (anchored under top-right sign-in link if present)
  const [showAuthPanel, setShowAuthPanel] = React.useState(false);
  const [authEmail, setAuthEmail] = React.useState('');
  const [authPassword, setAuthPassword] = React.useState('');
  const [authLoading, setAuthLoading] = React.useState(false);
  const [authPanelPos, setAuthPanelPos] = React.useState<{ left?: number; top?: number; right?: number }>(() => ({}));

  const computeAuthPanelPos = (offsetX = 0) => {
    const signinEl = document.querySelector('a[href="/signin"]') || document.querySelector('[data-signin]') || document.querySelector('a[href*="signin"]');
    if (signinEl && (signinEl as HTMLElement).getBoundingClientRect) {
      const rect = (signinEl as HTMLElement).getBoundingClientRect();
      const left = rect.left + rect.width / 2 + offsetX;
      const top = rect.bottom + 8;
      setAuthPanelPos({ left: Math.round(left), top: Math.round(top) });
    } else {
      setAuthPanelPos({ right: 16, top: 72 });
    }
  };

  const handleOpenAuthPanel = (prefillEmail?: string) => {
    if (prefillEmail) setAuthEmail(prefillEmail);
    computeAuthPanelPos();
    setShowAuthPanel(true);
  };

  const handleCloseAuthPanel = () => {
    setShowAuthPanel(false);
    setAuthEmail('');
    setAuthPassword('');
    setAuthLoading(false);
  };

  React.useEffect(() => {
    if (!showAuthPanel) return;
    const onUpdate = () => computeAuthPanelPos();
    window.addEventListener('resize', onUpdate);
    window.addEventListener('scroll', onUpdate, { passive: true });
    return () => {
      window.removeEventListener('resize', onUpdate);
      window.removeEventListener('scroll', onUpdate);
    };
  }, [showAuthPanel]);

  const handleAuthSignIn = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!authEmail) return toast.error('กรุณากรอกอีเมล');
    setAuthLoading(true);
    try {
      const result = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      } as any);
      if (result.error) throw result.error;
      toast.success('เข้าสู่ระบบเรียบร้อย');
      // Refresh profile in AuthContext so header and other UI update without a full page reload
      try {
        await refreshProfile();
      } catch (err) {
        // ignore refresh errors
      }
      handleCloseAuthPanel();
    } catch (err: any) {
      toast.error(err?.message || 'เข้าสู่ระบบไม่สำเร็จ');
      setAuthLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    // Save a lightweight draft to sessionStorage before redirecting to OAuth
    try {
      const draft = {
        sex: watch('sex'),
        petType: watch('petType'),
        breed: watch('breed'),
        pattern: watch('pattern'),
        colors: watch('colors'),
        latitude: watch('latitude'),
        longitude: watch('longitude'),
        foundDate: watch('foundDate'),
        location: watch('location'),
        province: watch('province'),
        details: watch('details'),
        contactName: watch('contactName'),
        contactPhone: watch('contactPhone'),
        contactEmail: watch('contactEmail'),
        hasCollar: watch('hasCollar'),
        markerPlaced,
      };
      try {
        sessionStorage.setItem('foundPetDraft', JSON.stringify(draft));
      } catch (err) {
        /* ignore sessionStorage errors */
      }

      if (provider === 'facebook') {
        // Facebook OAuth re-enabled (previous maintenance toast preserved as comment)
        try {
          await supabase.auth.signInWithOAuth({ provider });
          /*
          toast('กำลังปรับปรุงระบบ กรุณาใช้งานผ่าน Google หรือช่องทางอื่นชั่วคราว');
          */
        } catch (e) {
          if (process.env.NODE_ENV === 'development') console.error(e);
          toast.error('ไม่สามารถเริ่มการเข้าสู่ระบบแบบ OAuth ได้');
        }
      } else {
        await supabase.auth.signInWithOAuth({ provider });
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') console.error(e);
      toast.error('ไม่สามารถเริ่มการเข้าสู่ระบบแบบ OAuth ได้');
    }
  };

  // Restore draft if present (useful after OAuth redirect)
  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem('foundPetDraft');
      if (!raw) return;
      const draft = JSON.parse(raw);
      // Reset form fields (omit images)
      reset({
        sex: draft.sex ?? FORM_DEFAULT_VALUES.sex,
        petType: draft.petType ?? FORM_DEFAULT_VALUES.petType,
        breed: draft.breed ?? FORM_DEFAULT_VALUES.breed,
        pattern: draft.pattern ?? FORM_DEFAULT_VALUES.pattern,
        colors: draft.colors ?? FORM_DEFAULT_VALUES.colors,
        latitude: draft.latitude ?? FORM_DEFAULT_VALUES.latitude,
        longitude: draft.longitude ?? FORM_DEFAULT_VALUES.longitude,
        foundDate: draft.foundDate ?? FORM_DEFAULT_VALUES.foundDate,
        location: draft.location ?? FORM_DEFAULT_VALUES.location,
        province: draft.province ?? FORM_DEFAULT_VALUES.province,
        details: draft.details ?? FORM_DEFAULT_VALUES.details,
        contactName: draft.contactName ?? FORM_DEFAULT_VALUES.contactName,
        contactPhone: draft.contactPhone ?? FORM_DEFAULT_VALUES.contactPhone,
        contactEmail: draft.contactEmail ?? FORM_DEFAULT_VALUES.contactEmail,
        hasCollar: draft.hasCollar ?? FORM_DEFAULT_VALUES.hasCollar,
        images: FORM_DEFAULT_VALUES.images,
      });
      if (draft.markerPlaced) setMarkerPlaced(true);
      // remove draft once restored
      sessionStorage.removeItem('foundPetDraft');
    } catch (err) {
      /* ignore parsing errors */
    }
  }, [reset]);

  const onSubmit: SubmitHandler<FoundPetFormInputs> = async (data) => {
    if (!user) {
      handleOpenAuthPanel(data.contactEmail || '');
      return;
    }
    // Validate that user has placed a marker
    if (!markerPlaced) {
      setMapError('กรุณาปักหมุดตำแหน่งบนแผนที่ก่อนส่งข้อมูล');
      const mapContainer = document.querySelector('.rounded-xl.mt-2');
      if (mapContainer && (mapContainer as HTMLElement).scrollIntoView) {
        (mapContainer as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    try {
      setValue('images', []); // clear images in form
      // Prepare the data for submission
      const finalData = {
        pet_type: data.petType,
        breed: data.breed || 'ไม่สามารถระบุได้',
        pattern: data.pattern || 'ไม่สามารถระบุได้',
        colors: data.colors?.join(', ') || 'ไม่สามารถระบุได้',
        found_date: data.foundDate,
        location: data.location,
        province: data.province,
        latitude: data.latitude,
        longitude: data.longitude,
        details: data.details,
        contact_name: data.contactName,
        contact_phone: data.contactPhone,
        contact_email: data.contactEmail,
        status: 'active',
        sex: data.sex,
        has_collar: data.hasCollar,
      };

      // Insert the found pet report
      const { data: foundPet, error: foundPetError } = await supabase
        .from('found_pets')
        .insert(finalData)
        .select()
        .single();

      if (foundPetError) throw foundPetError;

      // Upload images if any
      if (data.images && data.images.length > 0) {
        const imagePromises = data.images.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `public/${foundPet.id}/${fileName}`;

          // Upload the image to storage
          const { error: uploadError } = await supabase.storage
            .from('found-pet-images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Get the public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from('found-pet-images').getPublicUrl(filePath);

          // Insert the image record
          const { error: imageError } = await supabase
            .from('found_pet_images')
            .insert({
              found_pet_id: foundPet.id,
              image_url: publicUrl,
            });

          if (imageError) throw imageError;
        });

        await Promise.all(imagePromises);
      }

      toast.success(
        'ส่งข้อมูลสำเร็จ! เราจะช่วยกระจายข้อมูลเพื่อหาผู้เป็นเจ้าของ'
      );
      reset();
    } catch (error: any) {
      console.log(error.message);
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleImageChange = (files: File[]) => {
    if (files.length > 10) {
      toast.error('อัพโหลดได้สูงสุด 10 รูปเท่านั้น');
      return;
    }
    setValue('images', files, { shouldValidate: true });
  };

  const handlePetTypeChange = (value: string) => {
    setValue('petType', value, { shouldValidate: true });
    setValue('breed', '');
    setValue('pattern', '');
    setValue('colors', []);
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setValue('latitude', lat, { shouldValidate: true });
    setValue('longitude', lng, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-[#F7FFE0] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-[20px] shadow-lg p-0 md:p-0 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#F4A261] to-[#E8956A] p-8 flex items-center gap-4">
            <div className="bg-white rounded-full p-3 shadow flex items-center justify-center">
              <Info className="h-8 w-8 text-[#F4A261]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 ">
                แจ้งพบสัตว์เลี้ยง
              </h1>
              <p className="text-white/90 text-base font-medium">
                กรอกข้อมูลเพื่อแจ้งสัตว์เลี้ยงที่คุณพบ
                เราจะช่วยกระจายข้อมูลเพื่อหาผู้เป็นเจ้าของ
              </p>
            </div>
          </div>

          {/* Inline auth panel (anchored under top-right sign-in link if present) */}
          {showAuthPanel && (
            <div
              className="fixed z-[9999] w-[360px] bg-white rounded-lg shadow-lg border p-4"
              role="dialog"
              aria-modal
              style={{
                left: authPanelPos.left ? `${authPanelPos.left}px` : undefined,
                right: authPanelPos.right ? `${authPanelPos.right}px` : undefined,
                top: authPanelPos.top ? `${authPanelPos.top}px` : undefined,
                transform: authPanelPos.left ? 'translateX(-50%)' : undefined,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">เข้าสู่ระบบ</div>
                <button onClick={handleCloseAuthPanel} className="text-gray-500">✕</button>
              </div>
              <form onSubmit={handleAuthSignIn} className="space-y-2">
                <input type="email" placeholder="อีเมล" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full border px-3 py-2 rounded" />
                <input type="password" placeholder="รหัสผ่าน" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full border px-3 py-2 rounded" />
                <div className="flex gap-2">
                  <button type="submit" disabled={authLoading} className="flex-1 bg-[#F4A261] text-white py-2 rounded">{authLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</button>
                  <button type="button" onClick={() => window.location.href = '/signin'} className="px-3 py-2 rounded border">หน้าเข้าสู่ระบบ</button>
                </div>
                <div className="mt-2 text-center text-sm text-gray-500">หรือเข้าสู่ระบบด้วย</div>
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => handleOAuth('google')} className="flex-1 border rounded py-2 bg-white text-gray-700 border-gray-300"><FcGoogle className="inline h-4 w-4 mr-2" />Google</button>
                  <button type="button" onClick={() => handleOAuth('facebook')} className="flex-1 border rounded py-2 bg-white text-black border-gray-300"><FaFacebookF className="inline h-4 w-4 mr-2 text-[#1877F2]" />Facebook</button>
                </div>
              </form>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 md:p-8 bg-white"
          >
            {/* Pet Info Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#6C4F3D] mb-4">
                ข้อมูลสัตว์เลี้ยง
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="petType" className="text-[#2B2B2B] font-medium">ประเภทสัตว์เลี้ยง</Label>
                    <Select
                      value={selectedPetType}
                      onValueChange={handlePetTypeChange}
                      errorMessage={errors.petType?.message}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-[#F4A261] focus:ring-[#F4A261]">
                        <SelectValue placeholder="เลือกประเภทสัตว์เลี้ยง" />
                      </SelectTrigger>
                      <SelectContent>
                        {petTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedPetType && (
                    <PetCharacteristics
                      breed={breed}
                      pattern={pattern}
                      colors={colors}
                      onBreedChange={(val) =>
                        setValue('breed', val, { shouldValidate: true })
                      }
                      onPatternChange={(val) =>
                        setValue('pattern', val, { shouldValidate: true })
                      }
                      onColorsChange={(val) =>
                        setValue('colors', val, { shouldValidate: true })
                      }
                      petType={selectedPetType as 'cat' | 'dog'}
                    />
                  )}
                  <div>
                    <Label htmlFor="sex" className="text-[#2B2B2B] font-medium">เพศ</Label>
                    <Select
                      value={sex}
                      onValueChange={(value) =>
                        setValue('sex', value, { shouldValidate: true })
                      }
                      errorMessage={errors.sex?.message}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-[#F4A261] focus:ring-[#F4A261]">
                        <SelectValue placeholder="เลือกเพศ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">ตัวผู้</SelectItem>
                        <SelectItem value="female">ตัวเมีย</SelectItem>
                        <SelectItem value="unknown">ไม่สามารถระบุ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <Label htmlFor="hasCollar" className="text-[#2B2B2B] font-medium">มีปลอกคอ</Label>
                    <Switch
                      checked={hasCollar}
                      onCheckedChange={(checked) =>
                        setValue('hasCollar', checked, { shouldValidate: true })
                      }
                      id="hasCollar"
                    />
                    <span className="text-[#3E3E3E] text-sm">
                      {hasCollar ? 'มีปลอกคอ' : 'ไม่มีปลอกคอ'}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="foundDate" className="text-[#2B2B2B] font-medium">วันที่พบ</Label>
                    <Input 
                      {...register('foundDate')} 
                      type="date" 
                      max={today}
                      className="border-gray-300 focus:border-[#F4A261] focus:ring-[#F4A261]"
                    />
                    {errors.foundDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.foundDate.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-[#2B2B2B] font-medium">สถานที่พบ</Label>
                    <Input
                      {...register('location')}
                      placeholder="เช่น ถนนสุขุมวิท, ห้างสรรพสินค้าเซ็นทรัล"
                      className="border-gray-300 focus:border-[#F4A261] focus:ring-[#F4A261]"
                    />
                    {errors.location && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.location.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="province" className="text-[#2B2B2B] font-medium">จังหวัด</Label>
                    <Select
                      value={watch('province')}
                      onValueChange={(value) =>
                        setValue('province', value, { shouldValidate: true })
                      }
                      errorMessage={errors.province?.message}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-[#F4A261] focus:ring-[#F4A261]">
                        <SelectValue placeholder="เลือกจังหวัด" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces
                          .sort((a, b) => a.label.localeCompare(b.label))
                          .map((province) => (
                            <SelectItem
                              key={province.value}
                              value={province.value}
                            >
                              {province.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#6C4F3D] mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#F4A261]" /> ตำแหน่งที่พบ
              </h2>
              <div className={`rounded-xl mt-2 overflow-hidden ${mapError ? 'border-2 border-red-500' : 'border border-[#F4A261]/30'}`}>
                {mapError && (
                  <div className="text-sm text-red-600 p-2">{mapError}</div>
                )}
                <MapSelector onLocationSelect={handleLocationSelect} onUserLocationSelect={(_lat,_lng)=>{ setMarkerPlaced(true); setMapError(null); }} />
              </div>
            </div>

            {/* Images Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#6C4F3D] mb-4  flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#F4A261]" /> รูปภาพสัตว์เลี้ยง
              </h2>
              <ImageUpload
                onChange={handleImageChange}
                maxFiles={10}
                currentFiles={images}
              />
              <p className="text-xs text-[#3E3E3E] mt-2">
                รูปภาพจะช่วยให้ผู้เป็นเจ้าของระบุสัตว์เลี้ยงได้ง่ายขึ้น (สูงสุด 10
                รูป)
              </p>
            </div>

            {/* Details Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#6C4F3D] mb-4">
                รายละเอียดเพิ่มเติม
              </h2>
              <Textarea
                {...register('details')}
                placeholder="อธิบายลักษณะพิเศษ, สภาพร่างกาย, หรือข้อมูลอื่นๆ ที่อาจช่วยในการระบุตัวตน"
                rows={4}
                className="border-gray-300 focus:border-[#F4A261] focus:ring-[#F4A261]"
              />
            </div>

            {/* Contact Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#6C4F3D] mb-4">
                ข้อมูลติดต่อ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="contactName" className="text-[#2B2B2B] font-medium">ชื่อผู้แจ้ง</Label>
                  <Input
                    {...register('contactName')}
                    placeholder="ชื่อ-นามสกุล"
                    className="border-gray-300 focus:border-[#F4A261] focus:ring-[#F4A261]"
                  />
                  {errors.contactName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.contactName.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="contactPhone" className="text-[#2B2B2B] font-medium">เบอร์โทรศัพท์</Label>
                  <Input
                    {...register('contactPhone')}
                    placeholder="081-234-5678"
                    className="border-gray-300 focus:border-[#F4A261] focus:ring-[#F4A261]"
                  />
                  {errors.contactPhone && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.contactPhone.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="contactEmail" className="text-[#2B2B2B] font-medium">อีเมล</Label>
                  <Input
                    {...register('contactEmail')}
                    type="email"
                    placeholder="example@email.com"
                    className="border-gray-300 focus:border-[#F4A261] focus:ring-[#F4A261]"
                  />
                  {errors.contactEmail && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.contactEmail.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full text-lg font-bold py-3 bg-[#F4A261] hover:bg-[#E8956A] text-white border-none"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    กำลังส่งข้อมูล...
                  </>
                ) : (
                  'ส่งข้อมูลแจ้งพบสัตว์เลี้ยง'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FoundPetForm;
