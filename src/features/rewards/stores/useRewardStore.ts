import { create, StoreApi, UseBoundStore } from 'zustand';
import { LostPet } from '@/features/pets/types';

export enum REWARD_SORT_BY {
  REWARD_DESC = 'reward_desc',
  REWARD_ASC = 'reward_asc',
  DATE_DESC = 'date_desc',
  DATE_ASC = 'date_asc',
  DISTANCE = 'distance', // Added for sorting by distance
}

interface RewardStates {
  sortBy: REWARD_SORT_BY;
  selectedPet: LostPet | null;
  isModalOpen: boolean;
}

interface RewardActions {
  setSortBy: (sortBy: REWARD_SORT_BY) => void;
  openModal: (pet: LostPet) => void;
  closeModal: () => void;
}

export const useRewardStore: UseBoundStore<
  StoreApi<RewardStates & RewardActions>
> = create<RewardStates & RewardActions>((set) => ({
  sortBy: REWARD_SORT_BY.REWARD_DESC,
  selectedPet: null,
  isModalOpen: false,
  setSortBy: (sortBy) => set({ sortBy }),
  openModal: (pet) => set({ selectedPet: pet, isModalOpen: true }),
  closeModal: () => set({ selectedPet: null, isModalOpen: false }),
}));
