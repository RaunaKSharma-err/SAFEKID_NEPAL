// LocationProvider.tsx
import * as Location from "expo-location";
import React, { createContext, useContext, useEffect, useState } from "react";

type Coordinates = { latitude: number; longitude: number } | null;

interface LocationContextType {
  currentLocation: Coordinates;
  getPlaceCoordinates: (place: string) => Promise<Coordinates>;
}

const LocationContext = createContext<LocationContextType>({
  currentLocation: null,
  getPlaceCoordinates: async () => null,
});

const cache = new Map<string, Coordinates>();

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentLocation, setCurrentLocation] = useState<Coordinates>(null);

  // Get current device location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  // Get coordinates from a place name (OpenWeatherMap API)
  const getPlaceCoordinates = async (place: string): Promise<Coordinates> => {
    if (!place) return null;

    if (cache.has(place.toLowerCase())) {
      return cache.get(place.toLowerCase())!;
    }

    try {
      const response = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          place
        )}&limit=1&appid=1e02dc5e630c241114c0a27b793012d7`
      );

      const data = await response.json();

      if (!data || data.length === 0) return null;

      const coords: Coordinates = {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };

      cache.set(place.toLowerCase(), coords);
      return coords;
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

export const useLocation = () => useContext(LocationContext);
