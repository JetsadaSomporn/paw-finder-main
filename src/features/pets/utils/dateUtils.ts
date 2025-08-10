import { LostPet } from "../hooks/useFetchLostPets";
import { FoundPet } from "../types";

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return "เมื่อวาน";
  } else if (diffDays < 7) {
    return `${diffDays} วันที่แล้ว`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} สัปดาห์ที่แล้ว`;
  } else {
    return formatDate(dateString);
  }
};

export function isFoundPet(pet: FoundPet | LostPet): pet is FoundPet {
  return "found_date" in pet;
}

export function isLostPet(pet: FoundPet | LostPet): pet is LostPet {
  return "lost_date" in pet;
}
