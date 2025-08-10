import { petColorOptions } from '@/features/pets/constants/pet.constant';

export function translateColorToThai(color: string): string {
  return petColorOptions.find((c) => c.value === color)?.label || color;
}
