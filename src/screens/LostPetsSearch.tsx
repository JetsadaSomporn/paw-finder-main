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
              {filteredPets.length === 0 && (
                <div className="p-6 text-center bg-white/60 backdrop-blur-sm rounded-lg mt-6">
                  <div className="mx-auto w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C10 2 9 4 6 4s-4 2-4 4 2 4 4 4 4-2 6-2 4 2 6 2 4-2 4-4-2-4-4-4-2-2-4-2z"/></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-stone-700 mb-2">🐾 ไม่มีผลลัพธ์การค้นหา</h3>
                  <p className="text-sm text-stone-500 mb-4">ลองเปลี่ยนตัวกรองหรือสร้างประกาศใหม่เพื่อช่วยสัตว์เลี้ยงให้กลับบ้าน</p>
                  <div className="flex justify-center">
                    <a href="/lost-pets" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-full shadow-sm hover:shadow-md transition">สร้างประกาศใหม่</a>
                  </div>
                </div>
              )}
            </div>
          </VStack>
        </div>
      </div>
    </div>
  );
};
