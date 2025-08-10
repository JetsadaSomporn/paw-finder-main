import { useEffect } from 'react';

interface UseSyncLocationProps {
  location: [number, number] | null;
  setMapCenter: (location: [number, number]) => void;
  onUpdateLocation: (location: [number, number]) => void;
}

export function useSyncLocation({
  location,
  setMapCenter,
  onUpdateLocation,
}: UseSyncLocationProps) {
  useEffect(() => {
    if (location) {
      setMapCenter(location);
      onUpdateLocation(location);
    }
  }, [location]);
}
