import { useFetchLostPets } from '@/features/pets/hooks/useFetchLostPets';
import { VStack } from '@/shared/components/ui';
import React, { useEffect, useState } from 'react';
import { PetMapView } from '../features/pets/components/PetMapView';
import { PetSearchFilters } from '../features/pets/components/PetSearchFilters';
import { LostPet, PetFilters } from '../features/pets/types';
import { useGeolocation } from '../shared/hooks/useGeolocation';

const DEFAULT_FILTERS: PetFilters = {
  province: 'all',
  petType: 'all',
  date: '',
};

export const DEFAULT_MAP_CENTER: [number, number] = [13.7563, 100.5018];

export const LostPetsSearch: React.FC = () => {
  const { lostPets, loading, error } = useFetchLostPets();

  const {
    location,
    getCurrentLocation,
    loading: geoLoading,
  } = useGeolocation();

  const [filters, setFilters] = useState<PetFilters>(DEFAULT_FILTERS);
  const [filteredPets, setFilteredPets] = useState<LostPet[]>([]);
  const [mapCenter, setMapCenter] =
    useState<[number, number]>(DEFAULT_MAP_CENTER);
  const [mapZoom, setMapZoom] = useState(10);
  const [customMarker, setCustomMarker] = useState<[number, number] | null>(
    null
  );

  useEffect(() => {
    if (location) {
      setMapCenter(location);
      setCustomMarker(location);
    }
  }, [location]);

  useEffect(() => {
    setFilteredPets(lostPets);
  }, [lostPets]);

  function handleSearch() {
    const filtered = lostPets.filter((pet) => {
      if (filters.petType !== 'all') {
        return pet.pet_type === filters.petType;
      }
      if (filters.province !== 'all') {
        return pet.province === filters.province;
      }

      if (filters.date !== '') {
        return pet.lost_date === filters.date;
      }

      return true;
    });

    setFilteredPets(filtered);
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F7FFE0] py-8 px-4">
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F4A261]"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#F7FFE0] py-8 px-4">
      <div className="flex justify-center items-center min-h-[40vh] text-[#F4A261] font-medium text-lg">
        Error: {error}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7FFE0] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="w-full mb-6 text-center">
          <h1 className="text-[24px] md:text-[32px] font-bold text-[#6C4F3D] mb-2 tracking-tight">
            ค้นหาสัตว์เลี้ยงที่หาย
          </h1>
          <p className="text-[14px] md:text-[18px] text-[#3E3E3E]">
            ใช้แผนที่และฟิลเตอร์เพื่อค้นหาสัตว์เลี้ยงที่หายไป
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <VStack className="w-full p-8 gap-6">
            <div className="w-full">
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
                onSearch={handleSearch}
              />
            </div>
            <div className="w-full">
              <h2 className="text-[18px] font-bold text-[#6C4F3D] mb-4">
                แผนที่แสดงตำแหน่ง
              </h2>
              <PetMapView
                classNames={{ container: 'w-full' }}
                pets={filteredPets}
                mapCenter={mapCenter}
                mapZoom={mapZoom}
                currentLocation={customMarker}
                onMapCenterChange={setMapCenter}
                onMapZoomChange={setMapZoom}
                onCurrentLocationChange={setCustomMarker}
                onGetCurrentLocation={getCurrentLocation}
                isGettingLocation={geoLoading}
                allowAddMark={false}
              />
            </div>
          </VStack>
        </div>
      </div>
    </div>
  );
};
