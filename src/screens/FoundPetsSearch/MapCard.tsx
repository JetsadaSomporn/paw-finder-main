import { PetMapView } from '@/features/pets/components/PetMapView';
import { FoundPet } from '@/features/pets/types';
import { useState } from 'react';

interface IMapCardProps {
  pets: FoundPet[];
  mapCenter: [number, number];
  customMarker: [number, number] | null;
  onMapCenterChange: (center: [number, number]) => void;
  onCurrentLocationChange: (marker: [number, number] | null) => void;
  onGetCurrentLocation: () => void;
  isGettingLocation: boolean;
}

const MapCard = ({
  pets,
  mapCenter,
  customMarker,
  onMapCenterChange,
  onCurrentLocationChange,
  onGetCurrentLocation,
  isGettingLocation,
}: IMapCardProps) => {
  const [mapZoom, setMapZoom] = useState(10);

  return (
    <div className="w-full bg-[#FFFFFF] rounded-2xl shadow-lg p-4 flex flex-col items-stretch">
      <h2 className="text-[18px] font-bold text-[#F4A261] mb-2">
        แผนที่สัตว์ที่พบ
      </h2>
      <PetMapView
        classNames={{
          container: 'w-full rounded-2xl overflow-hidden shadow-md',
        }}
        pets={pets}
        mapCenter={mapCenter}
        mapZoom={mapZoom}
        currentLocation={customMarker}
        onMapCenterChange={onMapCenterChange}
        onMapZoomChange={setMapZoom}
        onCurrentLocationChange={onCurrentLocationChange}
        onGetCurrentLocation={onGetCurrentLocation}
        isGettingLocation={isGettingLocation}
        allowAddMark={true}
      />
    </div>
  );
};

export default MapCard;
