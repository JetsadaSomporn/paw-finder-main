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

  const navigate = useNavigate();
  const { user } = useAuth();

  const showSignInHint = () => {
    if (document.getElementById('auth-hint')) return;
    const signinEl = document.querySelector('a[href="/signin"]');
    const container = document.createElement('div');
    container.id = 'auth-hint';
    container.style.position = 'fixed';
    container.style.zIndex = '10000';
    container.style.padding = '8px 12px';
    container.style.background = 'white';
    container.style.border = '1px solid rgba(0,0,0,0.08)';
    container.style.borderRadius = '8px';
    container.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)';
    container.style.fontSize = '14px';
    container.style.color = '#333';
    container.style.width = '260px';
    container.innerHTML = `
      <div style="display:flex;gap:8px;align-items:center;justify-content:space-between;white-space:nowrap">
        <div style="flex:1">กรุณาเข้าสู่ระบบก่อนส่งข้อมูล</div>
        <button id="auth-hint-btn" style="background:#F4A261;color:white;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;margin-left:8px">เข้าสู่ระบบ</button>
      </div>
    `;
    document.body.appendChild(container);

    const hintWidth = 260;
    const updatePosition = () => {
      const rect = signinEl ? signinEl.getBoundingClientRect() : null;
      if (rect) {
        let left = rect.left + rect.width / 2 - hintWidth / 2;
        left = Math.max(8, Math.min(left, window.innerWidth - hintWidth - 8));
        container.style.left = `${left}px`;
        container.style.top = `${rect.bottom + 8}px`;
      } else {
        container.style.right = '16px';
        container.style.top = '72px';
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition);

    const btn = container.querySelector('#auth-hint-btn') as HTMLButtonElement | null;
    const removeHint = () => {
      try {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      } catch (e) {}
      container.remove();
    };

    btn?.addEventListener('click', () => {
      removeHint();
      navigate('/signin');
    });

    const autoRemove = setTimeout(() => {
      removeHint();
    }, 5000);

    const observer = new MutationObserver(() => {
      if (!document.body.contains(container)) {
        clearTimeout(autoRemove);
        try {
          window.removeEventListener('scroll', updatePosition);
          window.removeEventListener('resize', updatePosition);
        } catch (e) {}
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };

  const onSubmit: SubmitHandler<FoundPetFormInputs> = async (data) => {
    if (!user) {
      showSignInHint();
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
              <div className="rounded-xl border border-[#F4A261]/30 overflow-hidden">
                <MapSelector onLocationSelect={handleLocationSelect} />
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
