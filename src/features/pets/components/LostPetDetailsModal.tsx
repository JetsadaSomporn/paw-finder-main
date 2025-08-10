import React, { useState } from 'react';
import {
  X,
  Calendar,
  Tag,
  Palette,
  Award,
  Map as MapIcon,
  PawPrint,
  User,
  Phone,
  Mail,
  Heart,
  CircleDot,
} from 'lucide-react';
import { LostPet, PetType, PetSex } from '@/features/pets/types';
import { formatDate } from '../utils/dateUtils';
import { translateProvince } from '@/lib/utils';
import {
  renderPetColorsMessage,
  translatePetBreed,
  translatePetType,
  translatePetSex,
} from '../utils/pet.util';
import LocationMap from '@/shared/components/LocationMap';

interface LostPetDetailsModalProps {
  pet: LostPet;
  isOpen: boolean;
  onClose: () => void;
}

const DetailCard: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
}> = ({ label, value, icon }) => (
  <div className="bg-secondary p-4 rounded-xl text-center">
    <div className="flex justify-center mb-2 text-primary">{icon}</div>
    <p className="text-sm text-textSecondary">{label}</p>
    <p className="font-bold text-textPrimary text-lg">{value}</p>
  </div>
);

const LostPetDetailsModal: React.FC<LostPetDetailsModalProps> = ({
  pet,
  isOpen,
  onClose,
}) => {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  if (!isOpen) return null;

  const images = pet.images || [];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 font-sans"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <div className="w-8"></div>
          <h3 className="text-xl font-bold text-gray-800 text-center">
            รายละเอียดสัตว์เลี้ยงหาย
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto flex-grow">
          {images.length > 0 ? (
            <>
              <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-lg mb-4 flex items-center justify-center bg-gray-50">
                <img
                  src={images[selectedImageIdx]?.image_url}
                  alt={pet.pet_name}
                  className="w-full h-full object-contain"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 mb-6 justify-center">
                  {images.map((img, idx) => (
                    <button
                      key={img.image_url}
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`border-2 rounded-lg overflow-hidden focus:outline-none transition-all duration-150 ${
                        idx === selectedImageIdx
                          ? 'border-primary scale-105'
                          : 'border-gray-200 opacity-70 hover:opacity-100'
                      }`}
                      style={{ width: 64, height: 64 }}
                      aria-label={`ดูรูปที่ ${idx + 1}`}
                    >
                      <img
                        src={img.image_url}
                        alt={`pet thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-80 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
              <p className="text-gray-500">ไม่มีรูปภาพ</p>
            </div>
          )}

          <div className="text-center mb-8">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-textPrimary tracking-tight">
              {pet.pet_name}
            </h2>
            {pet.reward && (
              <div className="inline-flex items-center mt-2 bg-green-100 text-green-800 text-xl sm:text-2xl font-bold px-4 py-2 rounded-full">
                <Award className="w-7 h-7 mr-2" />
                <span>ค่าสินน้ำใจ ฿{pet.reward.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <DetailCard
              label="ประเภท"
              value={translatePetType(pet.pet_type as PetType)}
              icon={<PawPrint size={28} />}
            />
            <DetailCard
              label="สายพันธุ์"
              value={translatePetBreed(pet.breed)}
              icon={<Tag size={28} />}
            />
            <DetailCard
              label="สี"
              value={renderPetColorsMessage(pet.colors)}
              icon={<Palette size={28} />}
            />
            <DetailCard
              label="เพศ"
              value={translatePetSex(pet.sex as PetSex)}
              icon={<Heart size={28} />}
            />
            <DetailCard
              label="ปลอกคอ"
              value={pet.has_collar ? 'มี' : 'ไม่มี'}
              icon={<CircleDot size={28} />}
            />
            <DetailCard
              label="อายุ"
              value={`${pet.age_years} ปี ${pet.age_months} เดือน`}
              icon={<Calendar size={28} />}
            />
          </div>

          <div className="space-y-8">
            <div>
              <h4 className="text-xl font-bold text-textPrimary mb-3 border-l-4 border-primary pl-3">
                ข้อมูลสำหรับติดต่อ
              </h4>
              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                <p className="flex items-center text-textSecondary">
                  <User className="w-5 h-5 mr-3 text-gray-500" />
                  <strong>ผู้ประกาศ:</strong>
                  <span className="ml-2">{pet.contact_name}</span>
                </p>
                <p className="flex items-center text-textSecondary">
                  <Phone className="w-5 h-5 mr-3 text-gray-500" />
                  <strong>เบอร์โทรศัพท์:</strong>
                  <a
                    href={`tel:${pet.contact_phone}`}
                    className="ml-2 text-primary hover:underline"
                  >
                    {pet.contact_phone}
                  </a>
                </p>
                <p className="flex items-center text-textSecondary">
                  <Mail className="w-5 h-5 mr-3 text-gray-500" />
                  <strong>อีเมล:</strong>
                  <a
                    href={`mailto:${pet.contact_email}`}
                    className="ml-2 text-primary hover:underline"
                  >
                    {pet.contact_email}
                  </a>
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-textPrimary mb-3 border-l-4 border-primary pl-3">
                ข้อมูลการหาย
              </h4>
              <div className="text-textSecondary space-y-2 pl-4">
                <p>
                  <strong>วันที่หาย:</strong> {formatDate(pet.lost_date)}
                </p>
                <p>
                  <strong>สถานที่:</strong> {pet.location},{' '}
                  {translateProvince(pet.province)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-textPrimary mb-3 border-l-4 border-primary pl-3">
                รายละเอียดเพิ่มเติม
              </h4>
              <p className="text-textSecondary pl-4">{pet.details ?? '-'}</p>
            </div>

            {pet.latitude && pet.longitude && (
              <div>
                <h4 className="text-xl font-bold text-textPrimary mb-3 border-l-4 border-primary pl-3">
                  ตำแหน่งที่หาย
                </h4>
                <div className="pl-4">
                  <LocationMap
                    className="h-[400px]"
                    latitude={pet.latitude}
                    longitude={pet.longitude}
                  />
                  <div className="mt-4 text-center">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${pet.latitude},${pet.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-primary hover:bg-[#e85c50] transition-colors duration-200"
                    >
                      <MapIcon className="w-5 h-5 mr-2" />
                      เปิดใน Google Maps
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LostPetDetailsModal;
