import { useFetchLostPets } from "@/features/pets/hooks/useFetchLostPets";
import { LostPet } from "@/features/pets/types";
import { useMemo, useState } from "react";
import { REWARD_SORT_BY } from "@/features/rewards/stores/useRewardStore";
import { useLocation as useRouterLocation } from "react-router-dom";

const PETS_PER_PAGE = 8;

// Haversine formula to calculate distance between two points in kilometers
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const nlat1 = Number(lat1);
  const nlon1 = Number(lon1);
  const nlat2 = Number(lat2);
  const nlon2 = Number(lon2);
  if (!isFinite(nlat1) || !isFinite(nlon1) || !isFinite(nlat2) || !isFinite(nlon2)) {
    return Infinity;
  }
  const R = 6371; // Earth's radius in kilometers
  const dLat = (nlat2 - nlat1) * Math.PI / 180;
  const dLon = (nlon2 - nlon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(nlat1 * Math.PI / 180) * Math.cos(nlat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const useRewardsPageLogic = () => {
  const { lostPets, loading, error } = useFetchLostPets();
  const routerLocation = useRouterLocation();
  const routeState = (routerLocation.state as any) || {};
  // Prefer state.ll; fallback to query param ?ll=lat,lng
  let ll = (routeState?.ll as [number, number] | undefined) || undefined;
  if (!ll) {
    const params = new URLSearchParams(routerLocation.search);
    const raw = params.get('ll');
    if (raw) {
      const parts = raw.split(',').map((s) => Number(s.trim()));
      if (parts.length === 2 && isFinite(parts[0]) && isFinite(parts[1])) {
        ll = [parts[0], parts[1]];
      }
    }
  }

  const [activeTab, setActiveTab] = useState("nationwide"); // 'nearby', 'province', 'nationwide'
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [sortBy, setSortBy] = useState("reward_desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Use ll from router state as the only source of truth; do not call geolocation here
  const userLocation = useMemo(() => {
    return ll ? { latitude: ll[0], longitude: ll[1] } : null;
  }, [ll]);

  const filteredAndSortedPets = useMemo(() => {
    let pets: LostPet[] = [...lostPets].filter(
      (pet) => pet.reward && pet.reward > 0
    );

    if (activeTab === "province" && selectedProvince !== "all") {
      pets = pets.filter((pet) => pet.province === selectedProvince);
    }

    // For nearby tab, show all pets but will be sorted by distance
    // No distance filtering, just ensure pets have coordinates for sorting

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
        case REWARD_SORT_BY.DISTANCE:
          // Only apply distance sorting when we have a valid userLocation (ll)
          if (!userLocation) {
            // No ll provided: keep current order (or could fallback to reward_desc)
            return 0;
          }
          const distanceA = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            (a.latitude as number),
            (a.longitude as number)
          );
          const distanceB = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            (b.latitude as number),
            (b.longitude as number)
          );
          return distanceA - distanceB; // Sort from nearest to farthest
        case "reward_desc":
        default:
          return (b.reward ?? 0) - (a.reward ?? 0);
      }
    });

    return sortedPets;
  }, [lostPets, activeTab, selectedProvince, sortBy, userLocation]);

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
    userLocation,
    // Handlers
    handleTabChange,
    handleProvinceChange,
    handleSortChange,
    handlePageChange,
  };
}; 