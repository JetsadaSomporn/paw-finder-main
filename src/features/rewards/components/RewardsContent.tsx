import { LostPet } from '@/features/pets/types';
import { Pagination, VStack } from '@/shared/components/ui';
import React from 'react';
import RewardsTable from '../../pets/components/RewardsTable';
import LoadingRewardTable from './LoadingRewardTable';
import RewardTableNotFound from './RewardTableNotFound';

interface RewardsContentProps {
  loading: boolean;
  paginatedPets: LostPet[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const RewardsContent: React.FC<RewardsContentProps> = ({
  loading,
  paginatedPets,
  ...paginationProps
}) => {
  if (loading) return <LoadingRewardTable className="mx-auto" />;

  if (paginatedPets.length === 0) {
    return <RewardTableNotFound />;
  }

  return (
    <VStack className="gap-4 w-full">
      <RewardsTable lostPets={paginatedPets} />
      <Pagination {...paginationProps} />
    </VStack>
  );
};
