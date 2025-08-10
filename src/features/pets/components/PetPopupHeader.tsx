import React from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { FoundPet } from '../types';
import { formatDate, isFoundPet } from '../utils/dateUtils';
import { LostPet } from '../hooks/useFetchLostPets';
import {
  renderPetColorsMessage,
  translatePetBreed,
  translatePetColor,
  translatePetType,
} from '../utils/pet.util';

interface PetPopupHeaderClassNames {
  petImage?: string;
  petImagePlaceholder?: string;
  petInfo?: string;
}

interface PetPopupHeaderProps {
  pet: FoundPet | LostPet;
  petImageUrl: string | null;
  classNames?: PetPopupHeaderClassNames;
}

export const PetPopupHeader: React.FC<PetPopupHeaderProps> = ({
  pet,
  petImageUrl,
  classNames = {},
}) => {
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0">
        {petImageUrl ? (
          <img
            src={petImageUrl}
            alt={pet.pet_type}
            className={cn(
              'w-20 h-20 object-cover rounded-lg border-2 border-gray-200',
              classNames.petImage
            )}
          />
        ) : (
          <div
            className={cn(
              'w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center',
              classNames.petImagePlaceholder
            )}
          >
            <span className="text-gray-500 text-xs">ไม่มีรูป</span>
          </div>
        )}
      </div>
      <div className={cn('flex-1 min-w-0', classNames.petInfo)}>
        <h3 className="font-semibold text-gray-900">
          {translatePetType(pet.pet_type)} - {translatePetBreed(pet.breed)}
        </h3>
        <p className="text-sm text-gray-600">
          สี:{' '}
          {isFoundPet(pet)
            ? renderPetColorsMessage(pet.colors)
            : translatePetColor(pet.color)}
        </p>
        <div className="flex items-center space-x-1 mt-1">
          <Calendar className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-500">
            {isFoundPet(pet) ? 'พบเมื่อ: ' : 'หายเมื่อ: '}
            {formatDate(isFoundPet(pet) ? pet.found_date : pet.lost_date)}
          </span>
        </div>
        <div className="mt-2">
          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">
            สัตว์เลี้ยงที่พบ
          </span>
        </div>
      </div>
    </div>
  );
};
