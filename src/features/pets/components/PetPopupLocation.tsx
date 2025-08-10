import React from "react";
import { FoundPet } from "../types";
import { LostPet } from "../hooks/useFetchLostPets";
import { isFoundPet, isLostPet } from "../utils/dateUtils";

interface PetPopupLocationProps {
  pet: FoundPet | LostPet;
}

export const PetPopupLocation: React.FC<PetPopupLocationProps> = ({ pet }) => {
  return (
    <>
      {/* Location Details */}
      {isFoundPet(pet) && (
        <div className="border-t border-gray-200 pt-3">
          <h4 className="font-medium text-gray-900 mb-2">สถานที่พบ</h4>
          <p className="text-sm text-gray-700">{pet.location}</p>
        </div>
      )}

      {/* Current Location */}
      {isLostPet(pet) && (
        <div className="border-t border-gray-200 pt-3">
          <h4 className="font-medium text-gray-900 mb-2">ตำแหน่งปัจจุบัน</h4>
          <p className="text-sm text-gray-700">{pet.location}</p>
        </div>
      )}
    </>
  );
}; 