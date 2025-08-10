import React from 'react';
import { cn } from '../../../lib/utils';
import { LostPet } from '../hooks/useFetchLostPets';
import { FoundPet } from '../types';
import { translatePetBreed, translatePetType } from '../utils/pet.util';

interface PetPopupCompactClassNames {
  popupCompact?: string;
  petImage?: string;
  petImagePlaceholder?: string;
  petInfo?: string;
}

interface PetPopupCompactProps {
  pet: FoundPet | LostPet;
  petImageUrl: string | null;
  classNames?: PetPopupCompactClassNames;
}

export const PetPopupCompact: React.FC<PetPopupCompactProps> = ({
  pet,
  petImageUrl,
  classNames = {},
}) => {
  return (
    <div className={cn('flex items-center space-x-3', classNames.popupCompact)}>
      <div className="flex-shrink-0">
        {petImageUrl ? (
          <img
            src={petImageUrl}
            alt={pet.pet_type}
            className={cn(
              'w-16 h-16 object-cover rounded-lg border-2 border-gray-200',
              classNames.petImage
            )}
          />
        ) : (
          <div
            className={cn(
              'w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center',
              classNames.petImagePlaceholder
            )}
          >
            <span className="text-gray-500 text-xs">ไม่มีรูป</span>
          </div>
        )}
      </div>
      <div className={cn('flex-1 min-w-0', classNames.petInfo)}>
        <h3 className="font-semibold text-gray-900 truncate">
          {translatePetType(pet.pet_type)} - {translatePetBreed(pet.breed)}
        </h3>
        <p className="text-sm text-gray-600 truncate">
          {translatePetBreed(pet.breed)}
        </p>
        <div className="mt-1">
          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">
            สัตว์เลี้ยงที่พบ
          </span>
        </div>
        <p className="text-xs text-blue-600 mt-1">คลิกเพื่อดูรายละเอียด</p>
      </div>
    </div>
  );
};
