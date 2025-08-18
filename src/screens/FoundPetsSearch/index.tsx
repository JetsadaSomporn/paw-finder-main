import FoundPetCard from '@/features/pets/components/FoundPetCard';
import PetDetailsModal from '@/features/pets/components/PetDetailsModal';
import { useFetchFoundPets } from '@/features/pets/hooks/useFetchFoundPets';
import { FoundPet } from '@/features/pets/types';
import {
  convertFoundPetsToFoundPetWithDistance,
  filterFoundPets,
  sortFoundPets,
} from '@/features/pets/utils/pet.util';
import LoadingScreen from '@/shared/components/LoadingScreen';
import { Slider, VStack } from '@/shared/components/ui';
import React, { useState, useEffect } from 'react';
import { PetSearchFilters } from '../../features/pets/components/PetSearchFilters';
import { PetFilters } from '../../features/pets/types';
import { useGeolocation } from '../../shared/hooks/useGeolocation';
import MapCard from './MapCard';
import { useSyncLocation } from './index.hook';
import { useLocation as useRouterLocation, useNavigate } from 'react-router-dom';

const DEFAULT_FILTERS: PetFilters = {
  province: 'all',
  petType: 'all',
  date: '',
};

export const DEFAULT_MAP_CENTER: [number, number] = [13.7563, 100.5018];

export const FoundPetsSearch: React.FC = () => {
  const { foundPets, loading, error } = useFetchFoundPets(true);

  const {
    location,
    getCurrentLocation,
    loading: geoLoading,
    onUpdateLocation,
  } = useGeolocation();

  const [filters, setFilters] = useState<PetFilters>(DEFAULT_FILTERS);

  const [selectedPet, setSelectedPet] = useState<FoundPet | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (pet: FoundPet) => {
    setSelectedPet(pet);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const petsWithDistance = convertFoundPetsToFoundPetWithDistance(
    foundPets,
    location ?? DEFAULT_MAP_CENTER
  );

  const filteredPets = filterFoundPets(petsWithDistance, filters);

  const [mapCenter, setMapCenter] =
    useState<[number, number]>(DEFAULT_MAP_CENTER);

  // responsive items per page for the slider
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    if (typeof window === 'undefined') return 3;
    const w = window.innerWidth;
    if (w < 640) return 1; // mobile
    if (w < 1024) return 2; // tablet
    return 3; // desktop
  });

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      if (w < 640) setItemsPerPage(1);
      else if (w < 1024) setItemsPerPage(2);
      else setItemsPerPage(3);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const sortedPets = sortFoundPets(filteredPets);

  useSyncLocation({
    location,
    setMapCenter,
    onUpdateLocation,
  });

  // Get current location when component mounts (only once)
  useEffect(() => {
    getCurrentLocation();
  }, []); // Empty dependency array - run only once on mount

  // Propagate current "green pin" to router state so other pages (e.g., Rewards) can read it
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  useEffect(() => {
    if (!location) return;
    const prevState = (routerLocation.state as any) || {};
    const prevLL = prevState.ll as [number, number] | undefined;
    const isSame = Array.isArray(prevLL)
      && prevLL.length === 2
      && prevLL[0] === location[0]
      && prevLL[1] === location[1];
    if (isSame) return;
    const nextState = { ...prevState, ll: location };
    // Replace to avoid adding history entries on every move
    navigate('.', { replace: true, state: nextState });
  }, [location, navigate]);

  if (loading) return <LoadingScreen message="กำลังค้นหาสัตว์เลี้ยงที่พบ..." />;

  if (error)
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-[#F4A261] font-medium text-lg">
        Error: {error}
      </div>
    );

  return (
    <>
      <div
        className="min-h-screen bg-[#F7FFE0] py-8 px-2 md:px-0"
        style={{ fontFamily: 'Rounded Sans Serif, sans-serif' }}
      >
        <VStack className="w-full max-w-7xl mx-auto gap-8">
          <div className="w-full mb-2 text-center">
            <h1 className="text-[24px] md:text-[32px] font-bold text-[#6C4F3D] mb-2 tracking-tight">
              ค้นหาสัตว์เลี้ยงที่พบ
            </h1>
            <p className="text-[14px] md:text-[18px] text-[#3E3E3E]">
              ใช้แผนที่และฟิลเตอร์เพื่อค้นหาสัตว์เลี้ยงที่อาจเป็นของคุณ
            </p>
          </div>
          <div className="w-full flex flex-col gap-8">
            <section className="w-full bg-[#FFFFFF] rounded-2xl shadow-lg p-6 flex flex-col justify-start items-stretch mb-4 md:mb-0">
              <h2 className="text-[18px] font-bold text-[#6C4F3D] mb-4">
                ฟิลเตอร์ค้นหา
              </h2>
              <PetSearchFilters
                classNames={{ container: 'w-full' }}
                filters={filters}
                onFilterChange={(key, value) =>
                  setFilters((f) => ({ ...f, [key]: value }))
                }
                loading={loading}
              />
            </section>
            <MapCard
              pets={filteredPets}
              mapCenter={mapCenter}
              customMarker={location}
              onMapCenterChange={setMapCenter}
              onCurrentLocationChange={(location) => {
                if (location) {
                  onUpdateLocation(location);
                }
              }}
              onGetCurrentLocation={getCurrentLocation}
              isGettingLocation={geoLoading}
            />
          </div>
          {/* Pet Cards Grid */}
          <div className="w-full">
            <h2 className="text-[18px] font-bold text-[#6C4F3D] mb-4">
              รายการสัตว์ที่พบ
            </h2>
            {filteredPets.length === 0 ? (
              <div className="col-span-full text-center text-[#3E3E3E] text-[16px] py-8">
                ไม่พบสัตว์ที่ตรงกับเงื่อนไข
              </div>
            ) : (
              <Slider itemsPerPage={itemsPerPage}>
                {sortedPets?.map((pet) => (
                  <div key={pet.id} className="px-2 py-4">
                    <FoundPetCard
                      pet={pet}
                      distance={pet.distance}
                      onOpenModal={(_type) => handleOpenModal(pet)}
                    />
                  </div>
                ))}
              </Slider>
            )}
          </div>
        </VStack>
      </div>
      {selectedPet && (
        <PetDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          pet={selectedPet}
        />
      )}
    </>
  );
};
