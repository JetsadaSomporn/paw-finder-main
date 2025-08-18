import { FoundPet, PetType } from '@/features/pets/types';
import {
  renderPetColorsMessage,
  translatePetBreed,
  translatePetType,
} from '@/features/pets/utils/pet.util';
import { Button } from '@/shared/components/ui';
import { Map, MapPin } from 'lucide-react';
import React from 'react';
import FoundPetCardImage from './FoundPetCardImage';
import { translateProvince } from '@/lib/utils';

interface FoundPetCardProps {
  pet: FoundPet;
  distance?: number;
  onOpenModal: (type: 'details' | 'contact') => void;
}

const FoundPetCard: React.FC<FoundPetCardProps> = ({
  pet,
  distance,
  onOpenModal,
}) => {
  return (
    <>
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full flex flex-col font-[Rounded Sans Serif,sans-serif]">
        <FoundPetCardImage pet={pet} />
        <div className="p-5 flex-grow flex flex-col">
          <h3 className="text-xl md:text-2xl font-bold text-[#1A1A1A] mb-1 truncate">
            {translatePetType(pet.pet_type as PetType)}{' '}
            {translatePetBreed(pet.breed)}
          </h3>
          <p className="text-[#6B6B6B] text-sm mb-1">
            {renderPetColorsMessage(pet.colors)}
          </p>
          {distance !== undefined && (
            <p className="text-xs font-semibold text-[#F4A261] mb-2">
              ห่างจากคุณประมาณ {distance.toFixed(1)} กิโลเมตร
            </p>
          )}
          <div className="flex items-center justify-between text-[#6B6B6B] text-xs mt-2 mb-4">
            <div className="flex items-center min-w-0">
              <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-[#F4A261]" />
              <span
                className="truncate"
                title={`${pet.location}, ${pet.province}`}
              >
                {pet.location}, {translateProvince(pet.province)}
              </span>
            </div>
            <a
              href={`https://www.google.com/maps?q=${pet.latitude},${pet.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 p-1.5 rounded-full hover:bg-[#FFD1DC] transition-colors"
              aria-label="Open in Google Maps"
            >
              <Map className="w-5 h-5 text-[#F4A261]" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-auto">
            <Button
              className="w-full bg-[#F4A261] hover:bg-[#FFD1DC] text-white font-bold py-3 rounded-lg transition-colors"
              onClick={() => onOpenModal('details')}
            >
              ดูรายละเอียด
            </Button>
            <Button
              className="w-full bg-[#FEEEEE] hover:bg-[#FFD1DC] text-[#F4A261] font-bold py-3 rounded-lg border border-[#F4A261] transition-colors"
              onClick={() => onOpenModal('contact')}
            >
              ติดต่อผู้พบ
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FoundPetCard;
