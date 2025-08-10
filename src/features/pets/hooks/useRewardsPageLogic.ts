import { useFetchLostPets } from "@/features/pets/hooks/useFetchLostPets";
import { LostPet } from "@/features/pets/types";
import { useMemo, useState } from "react";

const PETS_PER_PAGE = 8;

export const useRewardsPageLogic = () => {
  const { lostPets, loading, error } = useFetchLostPets();

  const [activeTab, setActiveTab] = useState("nationwide"); // 'nearby', 'province', 'nationwide'
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [sortBy, setSortBy] = useState("reward_desc");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSortedPets = useMemo(() => {
    let pets: LostPet[] = [...lostPets].filter(
      (pet) => pet.reward && pet.reward > 0
    );

    if (activeTab === "province" && selectedProvince !== "all") {
      pets = pets.filter((pet) => pet.province === selectedProvince);
    }
    // TODO: 'nearby' tab will require geolocation implementation

    const sortedPets = [...pets].sort((a, b) => {
      switch (sortBy) {
        case "reward_asc":
          return (a.reward ?? 0) - (b.reward ?? 0);
        case "date_desc":
          return (
            new Date(b.lost_date).getTime() - new Date(a.lost_date).getTime()
          );
        case "date_asc":
          return (
            new Date(a.lost_date).getTime() - new Date(b.lost_date).getTime()
          );
        case "reward_desc":
        default:
          return (b.reward ?? 0) - (a.reward ?? 0);
      }
    });

    return sortedPets;
  }, [lostPets, activeTab, selectedProvince, sortBy]);

  const paginatedPets = useMemo(() => {
    const startIndex = (currentPage - 1) * PETS_PER_PAGE;
    return filteredAndSortedPets.slice(
      startIndex,
      startIndex + PETS_PER_PAGE
    );
  }, [filteredAndSortedPets, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedPets.length / PETS_PER_PAGE);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
    if (tab !== "province") {
      setSelectedProvince("all");
    }
  };

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    setCurrentPage(1);
  };

  const handleSortChange = (sortValue: string) => {
    setSortBy(sortValue);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
    // State
    loading,
    error,
    activeTab,
    selectedProvince,
    sortBy,
    currentPage,
    paginatedPets,
    totalPages,
    totalItems: filteredAndSortedPets.length,
    itemsPerPage: PETS_PER_PAGE,
    // Handlers
    handleTabChange,
    handleProvinceChange,
    handleSortChange,
    handlePageChange,
  };
}; 