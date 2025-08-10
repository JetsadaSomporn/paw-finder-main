import { Icon } from 'leaflet';
import { ChevronLeft, ChevronRight, Navigation } from 'lucide-react';
import React, { useState } from 'react';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { cn } from '../../../lib/utils';
import { FoundPet, LostPet } from '../types';
import { PetPopup } from './PetPopup';

// Fix for default marker icons in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const greenIcon = new Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  iconRetinaUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to control map view
function MapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  React.useEffect(() => {
    map.setView(center, zoom, {
      animate: true,
      duration: 1.0,
    });
  }, [center, zoom, map]);

  return null;
}

// Map click handler component
function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface PetMapViewClassNames {
  container?: string;
  header?: string;
  backButton?: string;
  locationButton?: string;
  navigationControls?: string;
  mapContainer?: string;
  popup?: string;
  popupCompact?: string;
  popupExpanded?: string;
  petImage?: string;
  petImagePlaceholder?: string;
  petInfo?: string;
  petDetails?: string;
  contactInfo?: string;
  closeButton?: string;
}

interface PetMapViewProps {
  pets: (FoundPet | LostPet)[];
  mapCenter: [number, number];
  mapZoom: number;
  currentLocation: [number, number] | null;
  onMapCenterChange: (center: [number, number]) => void;
  onMapZoomChange: (zoom: number) => void;
  onCurrentLocationChange: (marker: [number, number] | null) => void;
  onGetCurrentLocation: () => void;
  isGettingLocation?: boolean;
  allowAddMark?: boolean;
  classNames?: PetMapViewClassNames;
}

export const PetMapView: React.FC<PetMapViewProps> = ({
  pets,
  mapCenter,
  mapZoom,
  currentLocation: customMarker,
  onMapCenterChange,
  onMapZoomChange,
  onCurrentLocationChange: onCustomMarkerChange,
  onGetCurrentLocation,
  isGettingLocation = false,
  allowAddMark = true,
  classNames = {},
}) => {
  const [expandedPopupId, setExpandedPopupId] = useState<string | null>(null);
  const [selectedPetIndex, setSelectedPetIndex] = useState(0);

  const petsWithCoords = pets.filter((pet) => pet.latitude && pet.longitude);

  const handlePopupClick = (petId: string) => {
    setExpandedPopupId(expandedPopupId === petId ? null : petId);
  };

  const navigateToNextPet = () => {
    if (petsWithCoords.length > 0) {
      setSelectedPetIndex((prev) =>
        prev < petsWithCoords.length - 1 ? prev + 1 : 0
      );

      const nextPet =
        petsWithCoords[
          selectedPetIndex + 1 < petsWithCoords.length
            ? selectedPetIndex + 1
            : 0
        ];
      if (nextPet.latitude && nextPet.longitude) {
        onMapCenterChange([nextPet.latitude, nextPet.longitude]);
        onMapZoomChange(15);
      }
    }
  };

  const navigateToPrevPet = () => {
    if (petsWithCoords.length > 0) {
      setSelectedPetIndex((prev) =>
        prev > 0 ? prev - 1 : petsWithCoords.length - 1
      );

      const prevPet =
        petsWithCoords[
          selectedPetIndex > 0
            ? selectedPetIndex - 1
            : petsWithCoords.length - 1
        ];
      if (prevPet.latitude && prevPet.longitude) {
        onMapCenterChange([prevPet.latitude, prevPet.longitude]);
        onMapZoomChange(15);
      }
    }
  };

  return (
    <div className={cn('max-w-7xl mx-auto', classNames.container)}>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header with back button and navigation */}
        <div
          className={cn(
            'p-4 border-b border-gray-200 flex items-center justify-between',
            classNames.header
          )}
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={onGetCurrentLocation}
              className={cn(
                'flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors',
                classNames.locationButton
              )}
              title="ตำแหน่งปัจจุบัน"
              disabled={isGettingLocation}
            >
              <Navigation className="h-5 w-5" />
              <span>ตำแหน่งปัจจุบัน</span>
            </button>
          </div>

          {petsWithCoords.length > 0 && (
            <div
              className={cn(
                'flex items-center space-x-4',
                classNames.navigationControls
              )}
            >
              <div className="text-sm text-gray-600">
                พบ {petsWithCoords.length} รายการ
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={navigateToPrevPet}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  title="รายการก่อนหน้า"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium">
                  {selectedPetIndex + 1} / {petsWithCoords.length}
                </span>
                <button
                  onClick={navigateToNextPet}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  title="รายการถัดไป"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Map View */}
        <div
          className={cn(
            'h-[calc(100vh-200px)] min-h-[600px] relative',
            classNames.mapContainer
          )}
        >
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="© Esri"
            />
            <TileLayer
              url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              attribution="© Esri"
            />
            <MapController center={mapCenter} zoom={mapZoom} />
            {allowAddMark && (
              <MapClickHandler
                onMapClick={(lat, lng) => onCustomMarkerChange([lat, lng])}
              />
            )}

            {/* Show pet markers */}
            {petsWithCoords.map((pet, index) => (
              <Marker
                key={pet.id}
                position={[pet.latitude!, pet.longitude!]}
                eventHandlers={{
                  click: () => {
                    setSelectedPetIndex(index);
                    onMapCenterChange([pet.latitude!, pet.longitude!]);
                    onMapZoomChange(15);
                  },
                }}
              >
                <Popup>
                  <PetPopup
                    pet={pet}
                    isExpanded={expandedPopupId === pet.id}
                    onToggle={() => handlePopupClick(pet.id)}
                    classNames={{
                      popup: classNames.popup,
                      popupCompact: classNames.popupCompact,
                      popupExpanded: classNames.popupExpanded,
                      petImage: classNames.petImage,
                      petImagePlaceholder: classNames.petImagePlaceholder,
                      petInfo: classNames.petInfo,
                      petDetails: classNames.petDetails,
                      contactInfo: classNames.contactInfo,
                      closeButton: classNames.closeButton,
                    }}
                  />
                </Popup>
              </Marker>
            ))}

            {customMarker && (
              <Marker position={customMarker} icon={greenIcon}>
                <Popup>
                  <div className="p-2">
                    <div className="font-semibold">ตำแหน่งปัจจุบัน</div>
                    <div className="text-xs text-gray-600">
                      {customMarker[0].toFixed(6)}, {customMarker[1].toFixed(6)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};
