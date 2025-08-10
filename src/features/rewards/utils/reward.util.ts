import {
  catBreedOptions,
  catPatternOptions,
  dogBreedOptions,
  dogPatternOptions,
} from '@/features/pets/constants/pet.constant';
import { LostPet } from '@/features/pets/types';
import { REWARD_SORT_BY } from '../stores/useRewardStore';
import {
  catColorOptions,
  dogColorOptions,
} from '@/features/pets/constants/pet.constant';

export function sortPetsForRewardsTable(
  pets: LostPet[],
  sortBy: REWARD_SORT_BY
) {
  return pets.sort((a, b) => {
    const defaultSortedPets =
      new Date(a.lost_date).getTime() - new Date(b.lost_date).getTime();
    if (sortBy === REWARD_SORT_BY.REWARD_DESC) {
      return (b.reward ?? 0) - (a.reward ?? 0);
    }
    if (sortBy === REWARD_SORT_BY.REWARD_ASC) {
      return (a.reward ?? 0) - (b.reward ?? 0);
    }
    if (sortBy === REWARD_SORT_BY.DATE_DESC) {
      return new Date(b.lost_date).getTime() - new Date(a.lost_date).getTime();
    }

    if (sortBy === REWARD_SORT_BY.DATE_ASC) {
      return new Date(a.lost_date).getTime() - new Date(b.lost_date).getTime();
    }

    return defaultSortedPets;
  });
}

export function renderPetDescriptionText(pet: LostPet): string {
  const { breed, colors, pet_type, pattern, sex, has_collar } = pet;

  const extractedColors = colors ? colors.trim().split(',') : [];

  const breedOptions = pet_type === 'cat' ? catBreedOptions : dogBreedOptions;

  const patternOptions =
    pet_type === 'cat' ? catPatternOptions : dogPatternOptions;

  const colorOptions = pet_type === 'cat' ? catColorOptions : dogColorOptions;

  const translatedSex = sex === 'male' ? 'ผู้' : 'เมีย';

  const translatedBreed = breedOptions.find(
    (option) => option.value === breed
  )?.label;

  const translatedPattern = patternOptions.find(
    (option) => option.value === pattern
  )?.label;

  const translatedColor = extractedColors.map(
    (color) => colorOptions.find((option) => option.value === color)?.label
  );

  const translatedHasCollar = has_collar ? 'มีปลอก' : 'ไม่มีปลอก';

  const translatedPetType = pet_type === 'cat' ? 'แมว' : 'สุนัข';

  return `${translatedPetType}\n เพศ : ${translatedSex} ${translatedPattern} ${translatedBreed} ${translatedColor} ${translatedHasCollar}`;
}
