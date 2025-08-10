import { provinces } from '@/data/provinces';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function translateProvince(province: string) {
  return provinces.find((p) => p.value === province)?.label;
}
