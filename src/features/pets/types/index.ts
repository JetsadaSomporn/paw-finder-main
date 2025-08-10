import { petTypes } from '../constants/pet.constant';
export interface PetImage {
  id: string;
  image_url: string;
}

export interface LostPet {
  id: string;
  pet_type: string;
  pet_name: string;
  breed: string;
  color: string;
  age_years: number;
  age_months: number;
  lost_date: string;
  location: string;
  province: string;
  reward: number | null;
  details: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  status: string;
  created_at: string;
  images: PetImage[];
  latitude?: number;
  longitude?: number;
  sex: string;
  pattern: string;
  has_collar: boolean;
  colors: string;
}

export interface FoundPet {
  id: string;
  user_id: string;
  pet_type: string;
  breed: string;
  pattern: string;
  colors: string;
  found_date: string;
  location: string;
  province: string;
  latitude: number;
  longitude: number;
  details: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  status: string;
  created_at: string;
  updated_at: string;
  images: {
    id: string;
    image_url: string;
  }[];
  has_collar: boolean;
  sex: string;
}

export interface PetFilters {
  province: string;
  petType: string;
  date: string;
}

export interface MapLocation {
  center: [number, number];
  zoom: number;
  customMarker: [number, number] | null;
}

export type FoundPetWithDistance = FoundPet & { distance?: number };

export type PetType = (typeof petTypes)[number]['value'];

export type PetSex = 'male' | 'female' | 'unknown';
