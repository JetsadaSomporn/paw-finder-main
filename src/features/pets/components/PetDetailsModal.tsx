import { FoundPet, PetSex } from '@/features/pets/types';
import { translateProvince } from '@/lib/utils';
import LocationMap from '@/shared/components/LocationMap';
import { Button } from '@/shared/components/ui';
import {
  Calendar,
  CircleDot,
  Heart,
  MapPin,
  Palette,
  PawPrint,
  Phone,
  Tag,
  User,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { PetType } from '../types';
import { formatDate } from '../utils/dateUtils';
import {
  renderPetColorsMessage,
  translatePetBreed,
  translatePetSex,
  translatePetType,
} from '../utils/pet.util';

interface PetDetailsModalProps {
  pet: FoundPet | null;
  isOpen: boolean;
  onClose: () => void;
}

const DetailItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-start text-sm">
    <div className="text-[#F4A261] mr-3 mt-0.5">{icon}</div>
    <div className="flex flex-col">
      <span className="font-semibold text-[#6C4F3D]">{label}</span>
      <span className="text-[#3E3E3E] font-medium">{value}</span>
    </div>
  </div>
);

const PetDetailsModal: React.FC<PetDetailsModalProps> = ({
  pet,
  isOpen,
  onClose,
}) => {
  const [activeImage, setActiveImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (pet?.images && pet.images.length > 0) {
      setActiveImage(pet.images[0].image_url);
    } else {
      setActiveImage('/cat-placeholder.png');
    }
  }, [pet]);

  // Keyboard navigation for images
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isOpen || !pet?.images || pet.images.length <= 1) return;
      
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        const currentIndex = pet.images.findIndex(img => img.image_url === activeImage);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : pet.images.length - 1;
        setActiveImage(pet.images[prevIndex].image_url);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        const currentIndex = pet.images.findIndex(img => img.image_url === activeImage);
        const nextIndex = currentIndex < pet.images.length - 1 ? currentIndex + 1 : 0;
        setActiveImage(pet.images[nextIndex].image_url);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen, activeImage, pet]);

  if (!isOpen || !pet) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 font-sans"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] relative overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/70 rounded-full hover:bg-gray-200 transition-colors z-20"
          aria-label="Close modal"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>

        <div className="flex-grow overflow-y-auto">
          <div className="bg-[#F7FFE0] p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Image Gallery & Description */}
              <div className="space-y-6">
                <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative group">
                  <img
                    src={activeImage}
                    alt="Pet"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/cat-placeholder.png';
                    }}
                  />
                  
                  {/* Image counter overlay */}
                  {pet.images && pet.images.length > 1 && (
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {pet.images.findIndex(img => img.image_url === activeImage) + 1} / {pet.images.length}
                    </div>
                  )}
                  
                  {/* Navigation arrows on hover for main image */}
                  {pet.images && pet.images.length > 1 && (
                    <>
                      <button
                        onClick={() => {
                          const currentIndex = pet.images.findIndex(img => img.image_url === activeImage);
                          const prevIndex = currentIndex > 0 ? currentIndex - 1 : pet.images.length - 1;
                          setActiveImage(pet.images[prevIndex].image_url);
                        }}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        aria-label="Previous image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          const currentIndex = pet.images.findIndex(img => img.image_url === activeImage);
                          const nextIndex = currentIndex < pet.images.length - 1 ? currentIndex + 1 : 0;
                          setActiveImage(pet.images[nextIndex].image_url);
                        }}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        aria-label="Next image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
                {/* Thumbnail Gallery - Only show if there are multiple images */}
                {pet.images && pet.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {pet.images.map((image, index) => (
                      <div
                        key={image.id || index}
                        className={`aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 hover:border-[#F4A261] ${
                          activeImage === image.image_url
                            ? 'border-[#F4A261] ring-2 ring-[#F4A261]/30'
                            : 'border-transparent'
                        }`}
                        onClick={() => setActiveImage(image.image_url)}
                      >
                        <img
                          src={image.image_url}
                          alt={`Pet image ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/cat-placeholder.png';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Navigation arrows for multiple images */}
                {pet.images && pet.images.length > 1 && (
                  <div className="flex justify-center gap-4 mt-4">
                    <button
                      onClick={() => {
                        const currentIndex = pet.images.findIndex(img => img.image_url === activeImage);
                        const prevIndex = currentIndex > 0 ? currentIndex - 1 : pet.images.length - 1;
                        setActiveImage(pet.images[prevIndex].image_url);
                      }}
                      className="bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 hover:shadow-lg"
                      aria-label="Previous image"
                    >
                      <svg className="w-5 h-5 text-[#F4A261]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="flex items-center text-sm text-gray-600 bg-white/80 px-3 py-2 rounded-full">
                      {pet.images.findIndex(img => img.image_url === activeImage) + 1} / {pet.images.length}
                    </span>
                    <button
                      onClick={() => {
                        const currentIndex = pet.images.findIndex(img => img.image_url === activeImage);
                        const nextIndex = currentIndex < pet.images.length - 1 ? currentIndex + 1 : 0;
                        setActiveImage(pet.images[nextIndex].image_url);
                      }}
                      className="bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 hover:shadow-lg"
                      aria-label="Next image"
                    >
                      <svg className="w-5 h-5 text-[#F4A261]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg text-[#6C4F3D] mb-2">
                    รายละเอียดเพิ่มเติม
                  </h3>
                  <p className="text-[#2B2B2B] text-sm leading-relaxed">
                    {pet.details || 'ไม่มีรายละเอียดเพิ่มเติม'}
                  </p>
                </div>
              </div>

              {/* Right Column: Pet Details */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-bold text-[#F4A261] uppercase tracking-widest">
                    สัตว์ที่ถูกพบ
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-white/50 rounded-2xl shadow-inner">
                  <DetailItem
                    icon={<PawPrint size={20} />}
                    label="ประเภท"
                    value={translatePetType(pet.pet_type as PetType)}
                  />
                  <DetailItem
                    icon={<Tag size={20} />}
                    label="สายพันธุ์"
                    value={translatePetBreed(pet.breed)}
                  />
                  <DetailItem
                    icon={<Palette size={20} />}
                    label="สี"
                    value={renderPetColorsMessage(pet.colors)}
                  />
                  <DetailItem
                    icon={<Calendar size={20} />}
                    label="วันที่พบ"
                    value={formatDate(pet.found_date)}
                  />
                  <DetailItem
                    icon={<MapPin size={20} />}
                    label="สถานที่"
                    value={`${pet.location}, ${translateProvince(
                      pet.province
                    )}`}
                  />
                  <DetailItem
                    icon={<CircleDot size={20} />}
                    label="ปลอกคอ"
                    value={pet.has_collar ? 'มี' : 'ไม่มี'}
                  />
                  <DetailItem
                    icon={<Heart size={20} />}
                    label="เพศ"
                    value={translatePetSex(pet.sex as PetSex)}
                  />
                </div>
                <div className="rounded-2xl overflow-hidden">
                  <LocationMap
                    latitude={pet.latitude}
                    longitude={pet.longitude}
                  />
                </div>

                <div>
                  <h3 className="font-bold text-lg text-[#6C4F3D] mb-4">
                    ข้อมูลติดต่อผู้พบ
                  </h3>
                  <div className="space-y-5 p-6 bg-white/50 rounded-2xl shadow-inner">
                    <DetailItem
                      icon={<User size={20} />}
                      label="ชื่อผู้พบ"
                      value={pet.contact_name || 'ไม่มีข้อมูล'}
                    />
                    <DetailItem
                      icon={<Phone size={20} />}
                      label="เบอร์ติดต่อ"
                      value={pet.contact_phone}
                    />
                  </div>
                </div>
                <div className="text-center pt-4">
                  <Button
                    onClick={onClose}
                    variant="secondary"
                    className="w-full sm:w-auto"
                  >
                    กลับ
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetailsModal;
