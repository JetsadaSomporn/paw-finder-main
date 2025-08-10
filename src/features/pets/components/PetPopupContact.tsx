import React from 'react';
import { Mail, Phone } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { FoundPet, LostPet } from '../types';

interface PetPopupContactClassNames {
  contactInfo?: string;
}

interface PetPopupContactProps {
  pet: FoundPet | LostPet;
  classNames?: PetPopupContactClassNames;
}

export const PetPopupContact: React.FC<PetPopupContactProps> = ({
  pet,
  classNames = {},
}) => {
  return (
    <div
      className={cn('border-t border-gray-200 pt-3', classNames.contactInfo)}
    >
      <h4 className="text-gray-900 mb-2">ข้อมูลติดต่อ</h4>
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-600">ผู้แจ้ง:</span>
          <span className="text-gray-900">{pet.contact_name}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Phone className="h-3 w-3 text-gray-400" />
          <span className="text-gray-900">{pet.contact_phone}</span>
        </div>
        {pet.contact_email && (
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-3 w-3 text-gray-400" />
            <span className="text-gray-900">{pet.contact_email}</span>
          </div>
        )}
      </div>
    </div>
  );
};
