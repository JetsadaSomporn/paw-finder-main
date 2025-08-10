import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { Icon } from "leaflet";
import { Search, MapPin, Navigation } from "lucide-react";
import { toast } from "react-hot-toast";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapSelectorProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

interface PlaceResult {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

// Component to handle map clicks
function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  const map = useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to control map view
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    // Center the map on the new coordinates with a smooth animation
    map.setView(center, 15, {
      animate: true,
      duration: 1.0,
    });
  }, [center, map]);

  return null;
}

const MapSelector: React.FC<MapSelectorProps> = ({
  onLocationSelect,
  initialLat = 13.7563, // Bangkok coordinates as default
  initialLng = 100.5018,
}) => {
  const [position, setPosition] = useState<[number, number]>([
    initialLat,
    initialLng,
  ]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation([lat, lng]);
          setPosition([lat, lng]);
          onLocationSelect(lat, lng);
        },
        (error) => {
          console.log("Error getting location:", error);
          // Use default position if geolocation fails
          onLocationSelect(initialLat, initialLng);
        }
      );
    } else {
      // Fallback to default position
      onLocationSelect(initialLat, initialLng);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLat, initialLng]);

  const handleMapClick = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationSelect(lat, lng);
  };

  const handleMarkerDragEnd = (event: any) => {
    const marker = event.target;
    const newPosition = marker.getLatLng();
    setPosition([newPosition.lat, newPosition.lng]);
    onLocationSelect(newPosition.lat, newPosition.lng);
  };

  // Get current location function
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง");
      return;
    }

    setIsGettingLocation(true);

    // First try with high accuracy
    const tryGetLocation = (highAccuracy = true) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          console.log("Getting current location:", {
            lat,
            lng,
            accuracy: pos.coords.accuracy,
            highAccuracy,
          });

          setUserLocation([lat, lng]);
          setPosition([lat, lng]);
          onLocationSelect(lat, lng);
          setSearchQuery("ตำแหน่งปัจจุบัน");
          setIsGettingLocation(false);

          if (!highAccuracy) {
            toast.success("อัปเดตตำแหน่งปัจจุบันแล้ว! (ความแม่นยำต่ำ)");
          } else {
            toast.success("อัปเดตตำแหน่งปัจจุบันแล้ว!");
          }
        },
        (error) => {
          console.log("Error getting location:", error);

          // If high accuracy failed, try with low accuracy
          if (highAccuracy) {
            console.log("High accuracy failed, trying low accuracy...");
            tryGetLocation(false);
            return;
          }

          // If both high and low accuracy failed, try IP-based geolocation
          console.log("GPS location failed, trying IP-based geolocation...");
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
      originalError?: GeolocationPositionError
    ) => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (response.ok) {
          const data = await response.json();
          const lat = parseFloat(data.latitude);
          const lng = parseFloat(data.longitude);

          console.log("IP-based location:", { lat, lng, city: data.city });

          setUserLocation([lat, lng]);
          setPosition([lat, lng]);
          onLocationSelect(lat, lng);
          setSearchQuery(
            `ตำแหน่งโดยประมาณ: ${data.city}, ${data.country_name}`
          );
          setIsGettingLocation(false);
          toast.success(`อัปเดตตำแหน่งโดยประมาณแล้ว! (${data.city})`);
        } else {
          throw new Error("IP geolocation failed");
        }
      } catch (ipError) {
        console.log("IP-based geolocation failed:", ipError);
        setIsGettingLocation(false);

        // Final fallback - show error with detailed guidance
        let errorMessage = "ไม่สามารถระบุตำแหน่งได้";
        let suggestion = "";

        if (
          originalError &&
          originalError.message &&
          originalError.message.includes("kCLErrorLocationUnknown")
        ) {
          errorMessage = "ไม่สามารถระบุตำแหน่งได้ (CoreLocation Error)";
          suggestion =
            "สำหรับ macOS: ไปที่ System Preferences > Security & Privacy > Privacy > Location Services และอนุญาตให้เบราว์เซอร์เข้าถึงตำแหน่ง หรือใช้การค้นหาสถานที่แทน";
        } else {
          suggestion =
            "กรุณาใช้การค้นหาสถานที่หรือคลิกที่แผนที่เพื่อเลือกตำแหน่ง";
        }

        toast.error(
          <div>
            <div>{errorMessage}</div>
            {suggestion && <div className="text-xs mt-1">{suggestion}</div>}
          </div>,
          { duration: 8000 }
        );
      }
    };

    tryGetLocation(true);
  };

  // Search places using Google Geocoding API (no CORS issues)
  const searchPlaces = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || "YOUR_GOOGLE_API_KEY";

    if (apiKey === "YOUR_GOOGLE_API_KEY") {
      console.warn(
        "Please configure your Google API key in the environment variables"
      );
      return;
    }

    try {
      // Use Geocoding API which doesn't have CORS issues
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          query
        )}&components=country:TH&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "OK" && data.results && data.results.length > 0) {
        // Convert geocoding results to our format with better formatting
        const places = data.results
          .slice(0, 5)
          .map((result: any, index: number) => {
            // Extract meaningful place name from address components
            const addressComponents = result.address_components || [];

            // Try to find the most descriptive name
            let mainText = "";
            let secondaryText = "";

            // Look for establishment, point_of_interest, or route names first
            const establishment = addressComponents.find(
              (comp: any) =>
                comp.types.includes("establishment") ||
                comp.types.includes("point_of_interest")
            );

            const route = addressComponents.find((comp: any) =>
              comp.types.includes("route")
            );

            const streetNumber = addressComponents.find((comp: any) =>
              comp.types.includes("street_number")
            );

            const sublocality = addressComponents.find(
              (comp: any) =>
                comp.types.includes("sublocality_level_1") ||
                comp.types.includes("sublocality")
            );

            const locality = addressComponents.find((comp: any) =>
              comp.types.includes("locality")
            );

            const administrativeArea = addressComponents.find((comp: any) =>
              comp.types.includes("administrative_area_level_1")
            );

            // Build main text (primary destination name)
            if (establishment) {
              mainText = establishment.long_name;
            } else if (route) {
              // For routes, include street number if available for better identification
              if (streetNumber) {
                mainText = `${streetNumber.long_name} ${route.long_name}`;
              } else {
                mainText = route.long_name;
              }
            } else if (sublocality) {
              mainText = sublocality.long_name;
            } else if (locality) {
              mainText = locality.long_name;
            } else {
              // Fallback to first part of formatted address
              const addressParts = result.formatted_address.split(",");
              mainText = addressParts[0].trim();
            }

            // Build secondary text (location context)
            const secondaryParts = [];

            // Add route info if we have an establishment
            if (establishment && route) {
              secondaryParts.push(route.long_name);
            }

            // Add sublocality (district) if not already the main text
            if (sublocality && mainText !== sublocality.long_name) {
              secondaryParts.push(sublocality.long_name);
            }

            // Add locality (city) if not already the main text
            if (locality && mainText !== locality.long_name) {
              secondaryParts.push(locality.long_name);
            }

            // Add administrative area (province) if not already included
            if (
              administrativeArea &&
              !secondaryParts.includes(administrativeArea.long_name)
            ) {
              secondaryParts.push(administrativeArea.long_name);
            }

            secondaryText = secondaryParts.join(", ");

            // If we couldn't build a good secondary text, use formatted address parts
            if (!secondaryText) {
              const addressParts = result.formatted_address.split(",");
              secondaryText = addressParts.slice(1, 3).join(",").trim();
            }

            return {
              place_id: `geocode_${index}`,
              description: result.formatted_address,
              structured_formatting: {
                main_text: mainText,
                secondary_text: secondaryText,
              },
              geometry: result.geometry,
            };
          });

        setSearchResults(places);
        setShowResults(true);
        setSelectedIndex(-1);
      } else if (data.status === "ZERO_RESULTS") {
        setSearchResults([]);
        setShowResults(false);
      } else {
        console.error("Geocoding API error:", data.status, data.error_message);
        setSearchResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error("Error searching places:", error);
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // Get place details (simplified for geocoding results)
  const getPlaceDetails = async (placeId: string) => {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || "YOUR_GOOGLE_API_KEY";

    if (apiKey === "YOUR_GOOGLE_API_KEY") {
      toast.error("กรุณาตั้งค่า Google API Key เพื่อใช้ฟีเจอร์ค้นหาสถานที่");
      return;
    }

    setIsSearching(true);
    try {
      // For geocoding results, we already have the geometry
      const selectedResult = searchResults.find(
        (result) => result.place_id === placeId
      );

      if (selectedResult && selectedResult.geometry) {
        const lat = selectedResult.geometry.location.lat;
        const lng = selectedResult.geometry.location.lng;

        console.log("Updating map coordinates:", {
          lat,
          lng,
          place: selectedResult.description,
        });

        setPosition([lat, lng]);
        onLocationSelect(lat, lng);
        setSearchQuery(selectedResult.description);
        setShowResults(false);
        toast.success("พบสถานที่แล้ว!");
      } else {
        console.error("No geometry found for selected result:", selectedResult);
        toast.error("ไม่สามารถดึงข้อมูลสถานที่ได้");
      }
    } catch (error) {
      console.error("Error getting place details:", error);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลสถานที่");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedIndex(-1);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(query);
    }, 300);
  };

  const handleSearchInputFocus = () => {
    if (searchResults.length > 0) {
      setShowResults(true);
    }
  };

  const handleSearchInputBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          getPlaceDetails(searchResults[selectedIndex].place_id);
        }
        break;
      case "Escape":
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleResultClick = (result: PlaceResult) => {
    getPlaceDetails(result.place_id);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Use geocoding as fallback if no autocomplete results
      if (searchResults.length > 0 && selectedIndex >= 0) {
        getPlaceDetails(searchResults[selectedIndex].place_id);
      } else {
        // Fallback to geocoding
        searchLocationFallback(searchQuery);
      }
    }
  };

  // Fallback search function using Google Geocoding API
  const searchLocationFallback = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const apiKey =
        import.meta.env.VITE_GOOGLE_API_KEY || "YOUR_GOOGLE_API_KEY";

      if (apiKey === "YOUR_GOOGLE_API_KEY") {
        console.warn(
          "Please configure your Google API key in the environment variables"
        );
        toast.error("กรุณาตั้งค่า Google API Key เพื่อใช้ฟีเจอร์ค้นหาสถานที่");
        setIsSearching(false);
        return;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          query
        )}&components=country:TH&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const result = data.results[0];
        const lat = result.geometry.location.lat;
        const lng = result.geometry.location.lng;

        console.log("Fallback search - updating map coordinates:", {
          lat,
          lng,
          place: result.formatted_address,
        });

        setPosition([lat, lng]);
        onLocationSelect(lat, lng);
        setSearchQuery(result.formatted_address);
        toast.success("พบสถานที่แล้ว!");
      } else if (data.status === "ZERO_RESULTS") {
        toast.error("ไม่พบสถานที่ที่ค้นหา กรุณาลองใหม่อีกครั้ง");
      } else {
        console.error("Geocoding API error:", data.status, data.error_message);
        toast.error("เกิดข้อผิดพลาดในการค้นหาสถานที่");
      }
    } catch (error) {
      console.error("Error searching location:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อกับ Google Maps API");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Search Input */}
      <div className="relative">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={handleSearchInputFocus}
              onBlur={handleSearchInputBlur}
              onKeyDown={handleKeyDown}
              placeholder="ค้นหาสถานที่ เช่น ถนนสุขุมวิท, ห้างสรรพสินค้าเซ็นทรัล"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
        </form>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={result.place_id}
                onClick={() => handleResultClick(result)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors duration-200 ${
                  index === selectedIndex ? "bg-blue-50 border-blue-200" : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {result.structured_formatting.main_text}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                      {result.structured_formatting.secondary_text}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Search Instructions */}
        <div className="text-xs text-gray-500 mt-1">
          พิมพ์เพื่อค้นหาสถานที่ในประเทศไทย 
        </div>
      </div>

      {/* Map - Using react-leaflet */}
      <div className="h-96 rounded-lg overflow-hidden border border-gray-300 relative">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="© Esri"
          />
          <TileLayer
            url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            attribution="© Esri"
          />
          <MapClickHandler onLocationSelect={handleMapClick} />
          <MapController center={position} />
          <Marker
            position={position}
            draggable={true}
            eventHandlers={{
              dragend: handleMarkerDragEnd,
            }}
          />
        </MapContainer>

        {/* Current Location Button - Overlay on Map */}
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className="absolute top-4 right-4 z-10 p-3 bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg shadow-lg transition-colors duration-200 flex items-center justify-center"
          title="ตำแหน่งปัจจุบัน"
        >
          {isGettingLocation ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          ) : (
            <Navigation className="h-5 w-5 text-blue-500" />
          )}
        </button>

        {/* Map Instructions */}
        <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-3 border-t border-gray-300">
          <p className="text-sm text-gray-600">
            คลิกที่แผนที่หรือลากมาร์คเกอร์เพื่อเลือกตำแหน่งที่พบสัตว์เลี้ยง
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ละติจูด: {position[0].toFixed(6)}, ลองจิจูด:{" "}
            {position[1].toFixed(6)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapSelector;
