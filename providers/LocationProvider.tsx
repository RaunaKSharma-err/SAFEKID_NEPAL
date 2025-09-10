// LocationProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import Geolocation from "react-native-geolocation-service";

type Coordinates = { latitude: number; longitude: number } | null;

interface LocationContextType {
  currentLocation: Coordinates;
  getPlaceCoordinates: (place: string) => Promise<Coordinates>;
}

const LocationContext = createContext<LocationContextType>({
  currentLocation: null,
  getPlaceCoordinates: async () => null,
});

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentLocation, setCurrentLocation] = useState<Coordinates>(null);

  // Get current device location
  useEffect(() => {
    const requestPermissionAndGetLocation = async () => {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }

      Geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => console.error("Geolocation error:", error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    requestPermissionAndGetLocation();
  }, []);

  // Get coordinates from a place name using OpenStreetMap Nominatim
  const getPlaceCoordinates = async (place: string): Promise<Coordinates> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          place
        )}`
      );
      const data = await response.json();
      if (!data || data.length === 0) return null;

      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    } catch (err) {
      console.error("Error fetching place coordinates:", err);
      return null;
    }
  };

  return (
    <LocationContext.Provider value={{ currentLocation, getPlaceCoordinates }}>
      {children}
    </LocationContext.Provider>
  );
};

// Hook for easy access
export const useLocation = () => useContext(LocationContext);
