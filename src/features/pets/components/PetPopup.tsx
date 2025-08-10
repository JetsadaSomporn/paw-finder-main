import React from "react";
import { cn } from "../../../lib/utils";
import { LostPet } from "../hooks/useFetchLostPets";
import { FoundPet } from "../types";
import { PetPopupCompact } from "./PetPopupCompact";
import { PetPopupExpanded } from "./PetPopupExpanded";

interface PetPopupClassNames {
  popup?: string;
  popupCompact?: string;
  popupExpanded?: string;
  petImage?: string;
  petImagePlaceholder?: string;
  petInfo?: string;
  petDetails?: string;
  contactInfo?: string;
  closeButton?: string;
}

interface PetPopupProps {
  pet: FoundPet | LostPet;
  isExpanded: boolean;
  onToggle: () => void;
  classNames?: PetPopupClassNames;
}

export const PetPopup: React.FC<PetPopupProps> = ({
  pet,
  isExpanded,
  onToggle,
  classNames = {},
}) => {
  const petImageUrl =
    pet.images && pet.images.length > 0 ? pet.images[0].image_url : null;

  return (
    <div
      className={cn(
        "w-full cursor-pointer transition-all duration-300 min-w-max",
        isExpanded ? "bg-white" : "bg-gray-50",
        classNames.popup
      )}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      {!isExpanded ? (
        <PetPopupCompact
          pet={pet}
          petImageUrl={petImageUrl}
          classNames={{
            popupCompact: classNames.popupCompact,
            petImage: classNames.petImage,
            petImagePlaceholder: classNames.petImagePlaceholder,
            petInfo: classNames.petInfo,
          }}
        />
      ) : (
        <PetPopupExpanded
          pet={pet}
          petImageUrl={petImageUrl}
          onToggle={onToggle}
          classNames={{
            popupExpanded: classNames.popupExpanded,
            petImage: classNames.petImage,
            petImagePlaceholder: classNames.petImagePlaceholder,
            petInfo: classNames.petInfo,
            petDetails: classNames.petDetails,
            contactInfo: classNames.contactInfo,
            closeButton: classNames.closeButton,
          }}
        />
      )}
    </div>
  );
};
