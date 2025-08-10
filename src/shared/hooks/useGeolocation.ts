import { useState } from 'react';
import toast from 'react-hot-toast';

interface UseGeolocationReturn {
  location: [number, number] | null;
  loading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<void>;
  onUpdateLocation: (location: [number, number]) => void;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Module-scoped guard to avoid duplicate requests during React StrictMode double-mount
  // and accidental rapid re-entries.
  // This persists across component unmount/mount cycles in the same session.
  // Note: declared outside function scope would be ideal, but kept here with closure over static ref.
  // We'll attach it to the function object to keep file-local scope without exporting globals.
  (useGeolocation as any)._inFlight = (useGeolocation as any)._inFlight ?? false;

  const getCurrentLocation = async () => {
    if ((useGeolocation as any)._inFlight) {
      return;
    }
    if (!navigator.geolocation) {
      toast.error('เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง');
      return;
    }

    (useGeolocation as any)._inFlight = true;
    setLoading(true);
    setError(null);

    // First try with high accuracy
  const tryGetLocation = (highAccuracy = true) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          console.log('Getting current location:', {
            lat,
            lng,
            accuracy: pos.coords.accuracy,
            highAccuracy,
          });

          setLocation([lat, lng]);

          if (!highAccuracy) {
            toast.success('อัปเดตตำแหน่งปัจจุบันแล้ว! (ความแม่นยำต่ำ)');
          } else {
            toast.success('อัปเดตตำแหน่งปัจจุบันแล้ว!');
          }
          setLoading(false);
          (useGeolocation as any)._inFlight = false;
        },
        (error) => {
          console.log('Error getting location:', error);

          // If high accuracy failed, try with low accuracy
          if (highAccuracy) {
            console.log('High accuracy failed, trying low accuracy...');
            tryGetLocation(false);
            return;
          }

          // If both high and low accuracy failed, try IP-based geolocation
          console.log('GPS location failed, trying IP-based geolocation...');
          tryIPBasedLocation(error);
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: highAccuracy ? 15000 : 10000, // Longer timeout for high accuracy
          maximumAge: 300000, // 5 minutes
        }
      );
    };

    // IP-based geolocation fallback
    const tryIPBasedLocation = async (
      _originalError?: GeolocationPositionError
    ) => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const data = await response.json();
          const lat = parseFloat(data.latitude);
          const lng = parseFloat(data.longitude);

          console.log('IP-based location:', { lat, lng, city: data.city });

          setLocation([lat, lng]);
          toast.success(`อัปเดตตำแหน่งโดยประมาณแล้ว! (${data.city})`);
        } else {
          throw new Error('IP geolocation failed');
        }
      } catch (ipError) {
        console.log('IP-based geolocation failed:', ipError);
        toast.error('ไม่สามารถระบุตำแหน่งได้ กรุณาลองใหม่อีกครั้ง');
        setError('ไม่สามารถระบุตำแหน่งได้');
      } finally {
        setLoading(false);
  (useGeolocation as any)._inFlight = false;
      }
    };

    tryGetLocation(true);
  };

  function onUpdateLocation(location: [number, number]) {
    setLocation(location);
  }

  // Remove automatic location fetching - let component decide when to get location
  // useEffect(() => {
  //   getCurrentLocation();
  // }, []);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    onUpdateLocation,
  };
};
