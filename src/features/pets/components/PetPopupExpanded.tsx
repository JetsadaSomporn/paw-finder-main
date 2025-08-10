import React from 'react';
import { cn } from '../../../lib/utils';
import { FoundPet, LostPet } from '../types';
import { PetPopupHeader } from './PetPopupHeader';
import { PetPopupDetails } from './PetPopupDetails';
import { PetPopupLocation } from './PetPopupLocation';
import { PetPopupContact } from './PetPopupContact';

interface PetPopupExpandedClassNames {
  popupExpanded?: string;
  petImage?: string;
  petImagePlaceholder?: string;
  petInfo?: string;
  petDetails?: string;
  contactInfo?: string;
  closeButton?: string;
}

interface PetPopupExpandedProps {
  pet: FoundPet | LostPet;
  petImageUrl: string | null;
  onToggle: () => void;
  classNames?: PetPopupExpandedClassNames;
}

export const PetPopupExpanded: React.FC<PetPopupExpandedProps> = ({
  pet,
  petImageUrl,
  onToggle,
  classNames = {},
}) => {
  return (
    <div className={cn('space-y-3', classNames.popupExpanded)}>
      {/* Header with image and basic info */}
      <PetPopupHeader
        pet={pet}
        petImageUrl={petImageUrl}
        classNames={{
          petImage: classNames.petImage,
          petImagePlaceholder: classNames.petImagePlaceholder,
          petInfo: classNames.petInfo,
        }}
      />

      {/* Pet Details */}
      <PetPopupDetails
        pet={pet}
        classNames={{
          petDetails: classNames.petDetails,
        }}
      />

      {/* Location Information */}
      <PetPopupLocation pet={pet} />

      {/* Additional Details */}
      {pet.details && (
        <div className="border-t border-gray-200 pt-3">
          <h4 className="font-medium text-gray-900 mb-2">
            รายละเอียดเพิ่มเติม
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed">{pet.details}</p>
        </div>
      )}

      {/* Contact Information */}
      <PetPopupContact
        pet={pet}
        classNames={{
          contactInfo: classNames.contactInfo,
        }}
      />

      {/* Close button */}
      <div className="border-t border-gray-200 pt-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={cn(
            'w-full text-center text-sm text-blue-600 hover:text-blue-700 transition-colors',
            classNames.closeButton
          )}
        >
          ปิดรายละเอียด
        </button>
      </div>
    </div>
  );
};
