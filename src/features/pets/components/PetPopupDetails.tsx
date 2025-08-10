import React from 'react';
import { provinces } from '../../../data/provinces';
import { cn } from '../../../lib/utils';
import { petTypes } from '../constants/pet.constant';
import { FoundPet, LostPet } from '../types';
import { isFoundPet } from '../utils/dateUtils';
import {
  renderPetColorsMessage,
  translatePetColor,
  translatePetPattern,
} from '../utils/pet.util';

interface PetPopupDetailsClassNames {
  petDetails?: string;
}

interface PetPopupDetailsProps {
  pet: FoundPet | LostPet;
  classNames?: PetPopupDetailsClassNames;
}

export const PetPopupDetails: React.FC<PetPopupDetailsProps> = ({
  pet,
  classNames = {},
}) => {
  return (
    <div className={cn('border-t border-gray-200 pt-3', classNames.petDetails)}>
      <h4 className="font-medium text-gray-900 mb-2">รายละเอียดสัตว์เลี้ยง</h4>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">ประเภท:</span>
          <span className="text-gray-900">
            {petTypes.find((type) => type.value === pet.pet_type)?.label ||
              pet.pet_type}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">พันธุ์:</span>
          <span className="text-gray-900">{pet.breed}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">ลาย:</span>
          <span className="text-gray-900">
            {isFoundPet(pet) ? translatePetPattern(pet.pattern) : 'ไม่ระบุ'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">สี:</span>
          <span className="text-gray-900">
            {isFoundPet(pet)
              ? renderPetColorsMessage(pet.colors)
              : translatePetColor(pet.color)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">จังหวัด:</span>
          <span className="text-gray-900">
            {provinces.find((prov) => prov.value === pet.province)?.label ||
              pet.province}
          </span>
        </div>
      </div>
    </div>
  );
};
