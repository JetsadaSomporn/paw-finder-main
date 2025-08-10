import RewardsTable from '@/features/pets/components/RewardsTable';
import { RewardsToolbar } from '@/features/pets/components/RewardsToolbar';
import { useRewardsPageLogic } from '@/features/pets/hooks/useRewardsPageLogic';
import LoadingRewardTable from '@/features/rewards/components/LoadingRewardTable';
import RewardTableNotFound from '@/features/rewards/components/RewardTableNotFound';
import { Pagination, VStack } from '@/shared/components/ui';
import React from 'react';
import LostPetDetailsModal from '@/features/pets/components/LostPetDetailsModal';
import { useRewardStore } from '@/features/rewards/stores/useRewardStore';

const RewardsContent: React.FC<{
  loading: boolean;
  error: string | null;
  paginatedPets: any[]; // Using any to avoid circular dependency issues with types
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  userLocation?: { latitude: number; longitude: number } | null;
}> = ({
  loading,
  paginatedPets,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  userLocation,
}) => {
  if (loading) return <LoadingRewardTable />;

  if (paginatedPets.length === 0) {
    return <RewardTableNotFound />;
  }

  return (
    <VStack className="gap-4 w-full">
  <RewardsTable lostPets={paginatedPets} userLocation={userLocation} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />
    </VStack>
  );
};

export const RewardsPage: React.FC = () => {
  const {
    loading,
    error,
    activeTab,
    selectedProvince,
    paginatedPets,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    sortBy,
  userLocation,
    handleTabChange,
    handleProvinceChange,
    handleSortChange,
    handlePageChange,
  } = useRewardsPageLogic();

  const selectedPet = useRewardStore((state) => state.selectedPet);
  const isModalOpen = useRewardStore((state) => state.isModalOpen);
  const closeModal = useRewardStore((state) => state.closeModal);

  return (
    <div
      className="min-h-screen bg-[#F7FFE0] py-8 px-4 sm:px-6 lg:px-8"
      style={{ fontFamily: 'Rounded Sans Serif, sans-serif' }}
    >
      <VStack className="w-full max-w-7xl mx-auto gap-6">
        <div className="w-full text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-[#6C4F3D] tracking-tight">
            ค่าสินน้ำใจสูงสุด
          </h1>
        </div>

        <RewardsToolbar
          activeTab={activeTab}
          selectedProvince={selectedProvince}
          sortBy={sortBy}
          onTabChange={handleTabChange}
          onProvinceChange={handleProvinceChange}
          onSortChange={handleSortChange}
        />

        <RewardsContent
          loading={loading}
          error={error}
          paginatedPets={paginatedPets}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          userLocation={userLocation}
        />

        {selectedPet && (
          <LostPetDetailsModal
            pet={selectedPet}
            isOpen={isModalOpen}
            onClose={closeModal}
          />
        )}
      </VStack>
    </div>
  );
};
