import { CatColor } from '@/data/catColors';
import { REWARD_SORT_BY } from '@/features/rewards/stores/useRewardStore';
import { translateColorToThai } from '@/shared/utils/color.util';
import {
  catBreedOptions,
  catColorOptions,
  catPatternOptions,
  dogBreedOptions,
  dogColorOptions,
  dogPatternOptions,
  petBreedOptions,
  petColorOptions,
  petTypes,
} from '../constants/pet.constant';
import {
  FoundPet,
  FoundPetWithDistance,
  LostPet,
  PetFilters,
  PetType,
} from '../types';
import { calculateDistance } from './locationUtils';
import { petPatternOptions } from '../constants/pet.constant';

export function getPetColors(colors: string): string | string[] {
  if (colors.includes(',')) {
    return colors
      .split(',')
      .map((color) => translateColorToThai(color as CatColor)) as string[];
  }

  return translateColorToThai(colors as CatColor) as string;
}

export function getPetColorOptions(petType: PetType) {
  switch (petType) {
    case 'cat':
      return catColorOptions;
    case 'dog':
      return dogColorOptions;
    default:
      throw new Error('Invalid pet type');
  }
}

export function getPetBreedOptions(petType: PetType) {
  switch (petType) {
    case 'cat':
      return catBreedOptions;
    case 'dog':
      return dogBreedOptions;
    default:
      throw new Error('Invalid pet type');
  }
}

export function getPetPatternOptions(petType: PetType) {
  switch (petType) {
    case 'cat':
      return catPatternOptions;
    case 'dog':
      return dogPatternOptions;
    default:
      throw new Error('Invalid pet type');
  }
}

export function translatePetType(type: PetType): string {
  return petTypes.find((option) => option.value === type)?.label || type;
}

export function translatePetBreed(breed: string): string {
  return (
    petBreedOptions.find((option) => option.value === breed)?.label || breed
  );
}

export function translatePetPattern(pattern: string): string {
  return (
    petPatternOptions.find((option) => option.value === pattern)?.label ||
    pattern
  );
}

export function translatePetColor(color: string): string {
  return (
    petColorOptions.find((option) => option.value === color)?.label || color
  );
}

export function renderPetColorsMessage(colors: string): string {
  if (!colors) return '';

  const trimmedColors = colors.replace(/\s+/g, '');

  const hasMultipleColors = trimmedColors.includes(',');

  if (hasMultipleColors) {
    const colorArray = trimmedColors.split(',');
    const translatedColors = colorArray.map((color) =>
      translatePetColor(color)
    );
    return translatedColors.join(', ');
  }

  return translatePetColor(trimmedColors);
}

export function translatePetSex(sex: 'male' | 'female' | 'unknown'): string {
  if (sex === 'male') return 'ตัวผู้';
  if (sex === 'female') return 'ตัวเมีย';
  return 'ไม่ระบุ';
}

export function filterFoundPets(
  foundPetsWithDistance: FoundPetWithDistance[],
  filters: PetFilters
) {
  const filteredFoundPets = foundPetsWithDistance.filter((pet) => {
    if (filters.petType !== 'all' && pet.pet_type !== filters.petType) {
      return false;
    }
    if (filters.province !== 'all' && pet.province !== filters.province) {
      return false;
    }
    if (filters.date !== '' && pet.found_date !== filters.date) {
      return false;
    }
    return true;
  });
  return filteredFoundPets;
}

export function sortFoundPets(foundPets: FoundPetWithDistance[]) {
  const sortedPets = foundPets.sort((a, b) => {
    const distanceA = a.distance ?? Infinity;
    const distanceB = b.distance ?? Infinity;
    return distanceA - distanceB;
  });
  return sortedPets;
}

export function convertFoundPetsToFoundPetWithDistance(
  foundPets: FoundPet[],
  currentLocation: [number, number]
): FoundPetWithDistance[] {
  const [latitude, longitude] = currentLocation;
  let formattedFoundPets = foundPets.map((p) => ({
    ...p,
    distance: undefined as number | undefined,
  }));

  if (location) {
    formattedFoundPets = formattedFoundPets.map((pet) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        pet.latitude,
        pet.longitude
      );
      return { ...pet, distance };
    });

    formattedFoundPets.sort(
      (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity)
    );
  }

  return formattedFoundPets;
}

export function sortLostPetsForReward(
  lostPets: LostPet[],
  sortMode: REWARD_SORT_BY
) {
  let sortedPets = [...lostPets];

  switch (sortMode) {
    case REWARD_SORT_BY.DATE_ASC:
      sortedPets.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateA - dateB;
      });
      break;
    case REWARD_SORT_BY.DATE_DESC:
      sortedPets.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });
      break;
    case REWARD_SORT_BY.REWARD_DESC:
      sortedPets.sort((a, b) => {
        const rewardA = a.reward ?? 0;
        const rewardB = b.reward ?? 0;
        return rewardB - rewardA;
      });
      break;
    case REWARD_SORT_BY.REWARD_ASC:
      sortedPets.sort((a, b) => {
        const rewardA = a.reward ?? 0;
        const rewardB = b.reward ?? 0;
        return rewardA - rewardB;
      });
      break;
    default:
      sortedPets.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });
  }

  return sortedPets;
}
