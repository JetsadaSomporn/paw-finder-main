import { Info, MapPin, Upload } from 'lucide-react';
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { provinces } from '../data/provinces';
import { PetCharacteristics } from '../features/pets/components/PetCharacteristics';
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

type FormInputs = {
  petType: string;
  petName: string;
  breed: string;
  pattern: string;
  colors: string[];
  ageYears: string;
  ageMonths: string;
  lostDate: string;
  location: string;
  province: string;
  reward: string;
  details: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  sex: string;
  hasCollar: boolean;
  latitude: number;
  longitude: number;
  images: File[];
};

const LostCatForm: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormInputs>({
    defaultValues: {
      petType: 'cat',
      petName: '',
      breed: '',
      pattern: '',
      colors: [],
      ageYears: '0',
      ageMonths: '0',
      lostDate: '',
      location: '',
      province: '',
      reward: '',
      details: '', // เพิ่ม details เป็น empty string
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      sex: 'unknown',
      hasCollar: false,
      latitude: 13.7563,
      longitude: 100.5018,
      images: [],
    },
  });

  const {
    breed,
    pattern,
    colors,
    images,
    sex,
    petType: selectedPetType,
    hasCollar,
  } = watch();

  const { user } = useAuth();
  const [markerPlaced, setMarkerPlaced] = React.useState<boolean>(false);
  const [mapError, setMapError] = React.useState<string | null>(null);
  
  // show a small hint anchored under the header sign-in link and follow it while scrolling
  const showSignInHint = () => {
    if (document.getElementById('auth-hint')) return;

    const signinEl = document.querySelector('a[href="/signin"]');
    const container = document.createElement('div');
    container.id = 'auth-hint';
    container.style.position = 'fixed'; // fixed so it stays relative to viewport
    container.style.zIndex = '10000';
    container.style.padding = '8px 12px';
    container.style.background = 'white';
    container.style.border = '1px solid rgba(0,0,0,0.08)';
    container.style.borderRadius = '8px';
    container.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)';
    container.style.fontSize = '14px';
    container.style.color = '#333';
    // auto-size message-only hint (no action button)
    container.style.width = 'auto';
    container.style.visibility = 'hidden';
    container.innerHTML = `
      <div style="white-space:nowrap;padding:6px 12px">กรุณาเข้าสู่ระบบก่อนส่งข้อมูล</div>
    `;

    document.body.appendChild(container);

  const hintShiftRight = 64; // increased offset to better align under the Sign In link

    const updatePosition = () => {
      const rect = signinEl ? signinEl.getBoundingClientRect() : null;
      if (rect) {
        // ensure natural width is measured while hidden, then show
        container.style.width = 'auto';
        container.style.visibility = 'hidden';
        const measured = container.getBoundingClientRect();
        const cw = measured.width || 200;
        let left = rect.left + rect.width / 2 - cw / 2 + hintShiftRight;
        left = Math.max(8, Math.min(left, window.innerWidth - cw - 8));
        const top = rect.bottom + 8;
        container.style.left = `${left}px`;
        container.style.top = `${top}px`;
        container.style.visibility = 'visible';
      } else {
        // fallback to top-right
        container.style.right = '16px';
        container.style.top = '72px';
        container.style.visibility = 'visible';
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition);

  const removeHint = () => {
      try {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      } catch (e) {
        /* ignore */
      }
      container.remove();
    };

    // auto remove after 5 seconds
    const autoRemove = setTimeout(() => {
      removeHint();
    }, 5000);

    // cleanup if the element is removed by other means
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

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    if (!user) {
      showSignInHint();
      return;
    }
    // Validate that user has placed a marker on the map
    if (!markerPlaced) {
      setMapError('กรุณาปักหมุดตำแหน่งบนแผนที่ก่อนส่งข้อมูล');
      // scroll map into view (if possible)
  const mapContainer = document.querySelector('.rounded-xl.mt-2');
      if (mapContainer && (mapContainer as HTMLElement).scrollIntoView) {
        (mapContainer as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    try {
      
      
     
      // Calculate date of birth based on age and lost date
      const lostDate = new Date(data.lostDate);
      const ageYears = parseInt(data.ageYears);
      const ageMonths = parseInt(data.ageMonths);
      const birthDate = new Date(lostDate);
      birthDate.setFullYear(birthDate.getFullYear() - ageYears);
      birthDate.setMonth(birthDate.getMonth() - ageMonths);
      const formattedBirthDate = birthDate.toISOString().split('T')[0];

      // Prepare the data for submission
      const finalData = {
        pet_type: data.petType,
        pet_name: data.petName,
        breed: data.breed || 'ไม่สามารถระบุได้',
        pattern: data.pattern || 'ไม่สามารถระบุได้',
        colors: data.colors.join(', ') || 'ไม่สามารถระบุได้',
        age_years: parseInt(data.ageYears),
        age_months: parseInt(data.ageMonths),
        date_of_birth: formattedBirthDate,
        lost_date: data.lostDate,
        location: data.location,
        province: data.province,
        latitude: data.latitude,
        longitude: data.longitude,
        reward: data.reward ? Number(data.reward) || null : null,
        details: data.details || 'ไม่มีรายละเอียดเพิ่มเติม', // fallback เป็น default text
        contact_name: data.contactName,
        contact_phone: data.contactPhone,
        contact_email: data.contactEmail,
        status: 'active',
        sex: data.sex,
        has_collar: data.hasCollar,
      };

      // Insert the lost pet report
      const { data: lostPet, error: lostPetError } = await supabase
        .from('lost_pets')
        .insert(finalData)
        .select()
        .single();

      if (lostPetError) throw lostPetError;

      // Upload images if any
      if (data.images && data.images.length > 0) {
        const imagePromises = data.images.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          // const filePath = `${lostPet.id}/${fileName}`;
          const filePath = `public/${lostPet.id}/${fileName}`;
          // const filePath = `${lostPet.id}/${Date.now()}-${fileName.replace(/\s+/g,'_')}`;


          // Upload the image to storage
          console.log('[Upload] will upload', { filePath, name: file.name, size: file.size, type: file.type });
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('lost-pet-images')
            .upload(filePath, file);

          console.log('[Upload] upload result', { filePath, uploadData, uploadError });
          if (uploadError) throw uploadError;

          // Get the public URL
          const { data: publicData } = supabase.storage.from('lost-pet-images').getPublicUrl(filePath);
          console.log('[Upload] getPublicUrl', { filePath, publicData });

          // Insert the image record
          const { error: imageError, data: imageInsert } = await supabase
            .from('lost_pet_images')
            .insert({
              lost_pet_id: lostPet.id,
              image_url: publicData?.publicUrl,
            })
            .select();

          console.log('[Upload] image insert', { filePath, imageInsert, imageError });
          if (imageError) throw imageError;
        });

        await Promise.all(imagePromises);
      }

      toast.success('ส่งข้อมูลสำเร็จ! เราจะติดต่อกลับโดยเร็วที่สุด');
      reset();
    } catch (error: any) {
      // Keep debug logging in development only
      if (process.env.NODE_ENV === 'development') {
        console.error('Error submitting form:', error);
      }

      // Show a generic message to users in production
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
                แจ้งสัตว์เลี้ยงหาย
              </h1>
              <p className="text-white/90 text-base font-medium">
                กรอกข้อมูลเพื่อแจ้งสัตว์เลี้ยงของคุณที่หายไป
                เราจะช่วยกระจายข้อมูลเพื่อเพิ่มโอกาสในการพบเจอ
              </p>
            </div>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 md:p-8 bg-white"
          >
            {/* Pet Info Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#6C4F3D] mb-4 ">
                ข้อมูลสัตว์เลี้ยง
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="petType" className="text-[#2B2B2B] font-medium">ประเภทสัตว์เลี้ยง</Label>
                    <Select
                      value={selectedPetType}
                      onValueChange={handlePetTypeChange}
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
                    {errors.petType && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.petType.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="petName" className="text-[#2B2B2B] font-medium">ชื่อสัตว์เลี้ยง</Label>
                    <Input
                      {...register('petName', {
                        required: 'กรุณาระบุชื่อสัตว์เลี้ยง',
                      })}
                      placeholder="ชื่อสัตว์เลี้ยง"
                      className="border-gray-300 focus:border-[#F4A261] focus:ring-[#F4A261]"
                    />
                    {errors.petName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.petName.message}
                      </p>
                    )}
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
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="ageYears" className="text-[#2B2B2B] font-medium">อายุ (ปี)</Label>
                      <Input
                        {...register('ageYears', {
                          required: 'กรุณาระบุอายุ',
                          min: { value: 0, message: 'อายุต้องไม่น้อยกว่า 0 ปี' },
                          max: { value: 30, message: 'อายุต้องไม่เกิน 30 ปี' },
                        })}
                        type="number"
                        min="0"
                        max="30"
                        placeholder="0"
                        className="border-gray-300 focus:border-[#F4A261] focus:ring-[#F4A261]"
                      />
                      {errors.ageYears && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.ageYears.message}
                        </p>
                      )}
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="ageMonths" className="text-[#2B2B2B] font-medium">อายุ (เดือน)</Label>
                      <Input
                        {...register('ageMonths', {
                          required: 'กรุณาระบุอายุ',
                          min: {
                            value: 0,
                            message: 'อายุต้องไม่น้อยกว่า 0 เดือน',
                          },
                          max: { value: 11, message: 'อายุต้องไม่เกิน 11 เดือน' },
                        })}
                        type="number"
                        min="0"
                        max="11"
                        placeholder="0"
                        className="border-gray-300 focus:border-[#F4A261] focus:ring-[#F4A261]"
                      />
                      {errors.ageMonths && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.ageMonths.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="lostDate" className="text-[#2B2B2B] font-medium">วันที่หาย</Label>
                    <Input
                      {...register('lostDate', {
                        required: 'กรุณาเลือกวันที่หาย',
                      })}
                      type="date"
                      max={today}
                      className="border-gray-300 focus:border-[#F4A261] focus:ring-[#F4A261]"
                    />
                    {errors.lostDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.lostDate.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-[#2B2B2B] font-medium">สถานที่หาย</Label>
                    <Input
                      {...register('location', {
                        required: 'กรุณาระบุสถานที่หาย',
                      })}
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
                    {errors.province && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.province.message}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="sex" className="text-[#2B2B2B] font-medium">เพศ</Label>
                      <Select
                        value={sex}
                        onValueChange={(value) =>
                          setValue('sex', value, { shouldValidate: true })
                        }
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
                    <div className="flex-1 flex items-center gap-2 mt-6">
                      <Switch
                        checked={hasCollar}
                        onCheckedChange={(checked) =>
                          setValue('hasCollar', checked, { shouldValidate: true })
                        }
                        id="has_collar"
                      />
                      <Label htmlFor="has_collar" className="text-[14px] text-[#2B2B2B]">
                        {hasCollar ? 'มีปลอกคอ' : 'ไม่มีปลอกคอ'}
                      </Label>
                    </div>
                  </div>
                </div>
                {/* Map & Image Section */}
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2 text-[#2B2B2B] font-medium">
                      <MapPin className="h-4 w-4 text-[#F4A261]" />
                      ตำแหน่งที่หาย (คลิกที่แผนที่)
                    </Label>
                    <div className={`rounded-xl mt-2 overflow-hidden ${mapError ? 'border-2 border-red-500' : 'border border-[#F4A261]/30'}`}>
                      {mapError && (
                        <div className="text-sm text-red-600 p-2">{mapError}</div>
                      )}
                      <MapSelector onLocationSelect={handleLocationSelect} onUserLocationSelect={(_lat,_lng)=>{ setMarkerPlaced(true); setMapError(null); }} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reward" className="text-[#2B2B2B] font-medium">รางวัล (บาท)</Label>
                    <Input
                      {...register('reward', {
                        pattern: {
                          value: /^\d+$/,
                          message: 'กรุณาระบุตัวเลขเท่านั้น'
                        }
                      })}
                      type="number"
                      min="0"
                      step="1"
                      placeholder="ระบุจำนวนเงิน (ไม่บังคับ)"
                      className="border-gray-300 focus:border-[#F4A261] focus:ring-[#F4A261]"
                    />
                    {errors.reward && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.reward.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="details" className="text-[#2B2B2B] font-medium">รายละเอียดเพิ่มเติม</Label>
                    <Controller
                      name="details"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          id="details"
                          placeholder="อธิบายลักษณะพิเศษ, สภาพร่างกาย, หรือข้อมูลอื่นๆ ที่อาจช่วยในการระบุตัวตน"
                          rows={4}
                          className="border-gray-300 focus:border-[#F4A261] focus:ring-[#F4A261]"
                          onChange={(e) => {
                            field.onChange(e);
                            console.log('Details field changed:', e.target.value);
                          }}
                        />
                      )}
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2 text-[#2B2B2B] font-medium">
                      <Upload className="h-4 w-4 text-[#F4A261]" />
                      รูปภาพสัตว์เลี้ยง (สูงสุด 10 รูป)
                    </Label>
                    <ImageUpload
                      onChange={handleImageChange}
                      maxFiles={10}
                      currentFiles={images}
                    />
                    <p className="text-xs text-[#3E3E3E] mt-1">
                      รูปภาพจะช่วยให้ผู้คนระบุสัตว์เลี้ยงได้ง่ายขึ้น
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Contact Info Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#6C4F3D] mb-4">
                ข้อมูลติดต่อ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="contactName" className="text-[#2B2B2B] font-medium">ชื่อผู้แจ้ง</Label>
                  <Input
                    {...register('contactName', {
                      required: 'กรุณาระบุชื่อผู้แจ้ง',
                    })}
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
                    {...register('contactPhone', {
                      required: 'กรุณาระบุเบอร์โทรศัพท์',
                      pattern: {
                        value: /^[0-9-+\s()]+$/,
                        message: 'กรุณาระบุเบอร์โทรศัพท์ที่ถูกต้อง',
                      },
                    })}
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
                    {...register('contactEmail', {
                      required: 'กรุณาระบุอีเมล',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'กรุณาระบุอีเมลที่ถูกต้อง',
                      },
                    })}
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
                  'ส่งข้อมูลแจ้งสัตว์เลี้ยงหาย'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LostCatForm;
