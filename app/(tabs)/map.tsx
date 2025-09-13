import { useLocation } from "@/providers/LocationProvider";
import { useReports } from "@/providers/ReportsProvider";
import { MapPin, Navigation } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LeafletMap, { LeafletMapHandle } from "../../components/Map";

type locationType = {
  latitude: number;
  longitude: number;
};

type ReportCoords = {
  lastSeen?: locationType;
  sightings: Record<string, locationType>; // keyed by sighting.id
};

export default function MapScreen() {
  const [reportCoords, setReportCoords] = useState<
    Record<string, ReportCoords>
  >({});
  const mapRef = useRef<LeafletMapHandle>(null);
  const reportsContext = useReports();
  const { getPlaceCoordinates } = useLocation();
  const { reports } = reportsContext || { reports: [] };
  const activeReports = reports.filter((report) => report.status === "active");

  useEffect(() => {
    if (!mapRef.current) return;

    const addMarkers = async () => {
      const coordsMap: Record<string, ReportCoords> = {};

      for (const report of activeReports) {
        // Initialize storage
        coordsMap[report.id] = { sightings: {} };

        // Last seen location
        const lastSeenLocation = await getPlaceCoordinates(
          report.lastSeenLocation
        );
        if (lastSeenLocation) {
          coordsMap[report.id].lastSeen = lastSeenLocation;

          mapRef.current?.addMarker(
            report.id,
            lastSeenLocation.latitude,
            lastSeenLocation.longitude,
            `Last seen: ${report.childName}`
          );
        }

        // Sightings
        for (const sighting of report.sightings) {
          if (!sighting.coordinates) {
            const coords = await getPlaceCoordinates(sighting.location);
            if (!coords) continue;

            coordsMap[report.id].sightings[sighting.id] = coords;

            mapRef.current?.addMarker(
              sighting.id,
              coords.latitude,
              coords.longitude,
              `Sighting: ${report.childName}`
            );
          } else {
            const coords = sighting.coordinates;
            if (!coords) continue;

            coordsMap[report.id].sightings[sighting.id] = coords;

            mapRef.current?.addMarker(
              sighting.id,
              coords.latitude,
              coords.longitude,
              `Sighting: ${report.childName}`
            );
          }
        }
      }

      setReportCoords(coordsMap);
    };

    addMarkers();
  }, [activeReports, getPlaceCoordinates, reports]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Map View</Text>
        <Text style={styles.headerSubtitle}>Missing children locations</Text>
      </View>

      {Platform.OS === "web" ? (
        <View style={styles.mapPlaceholder}>
          <MapPin size={48} color="#FF6B6B" />
          <Text style={styles.mapText}>Interactive Map</Text>
          <Text style={styles.mapSubtext}>
            Shows last seen locations and reported sightings
          </Text>
          <Text style={styles.webMapNote}>
            Map view available on mobile devices
          </Text>
        </View>
      ) : (
        <LeafletMap ref={mapRef} />
      )}

      <Text style={styles.listTitle}>Recent Locations</Text>
      <ScrollView style={styles.locationsList}>
        {activeReports.map((report) => (
          <TouchableOpacity
            key={report.id}
            style={styles.locationCard}
            onPress={() => {
              let coords: locationType | undefined;

              // Prefer last sighting if available
              const sightings = reportCoords[report.id]?.sightings;
              if (sightings && report.sightings.length > 0) {
                const lastSighting =
                  report.sightings[report.sightings.length - 1];
                coords = sightings[lastSighting.id];
              }

              // Otherwise, fallback to lastSeen
              if (!coords) {
                coords = reportCoords[report.id]?.lastSeen;
              }

              if (!coords) return;

              mapRef.current?.moveMarker(
                report.id,
                coords.latitude,
                coords.longitude,
                `Tracking: ${report.childName}`
              );
            }}
          >
            <View style={styles.locationHeader}>
              <MapPin size={20} color="#FF6B6B" />
              <Text style={styles.childName}>{report.childName}</Text>
            </View>

            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Last seen:</Text>
              <Text style={styles.locationText}>
                {report.lastSeenLocation ? (
                  report.lastSeenLocation
                ) : (
                  <>
                    Lat :{report.lastSeenCoordinates?.latitude} , Lng :
                    {report.lastSeenCoordinates?.longitude}
                  </>
                )}
              </Text>
            </View>

            {report.sightings.length > 0 && (
              <View style={styles.sightingsInfo}>
                <Text style={styles.sightingsLabel}>Recent sightings:</Text>
                {report.sightings.slice(0, 2).map((sighting) => (
                  <View key={sighting.id} style={styles.sightingItem}>
                    <Navigation size={14} color="#666" />
                    <Text style={styles.sightingText}>
                      {sighting.location ? (
                        sighting.location
                      ) : (
                        <>
                          Lat :{sighting.coordinates?.latitude} , Lng :
                          {sighting.coordinates?.longitude}
                        </>
                      )}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 35,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  map: {
    height: Dimensions.get("window").height * 0.4,
    margin: 16,
    borderRadius: 12,
  },
  mapPlaceholder: {
    height: Dimensions.get("window").height * 0.4,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    margin: 16,
    borderRadius: 12,
  },
  webMapNote: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
  mapText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 8,
  },
  mapSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  locationsList: {
    flex: 1,
    padding: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginLeft: 10,
  },
  locationCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  childName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  locationInfo: {
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  locationText: {
    fontSize: 14,
    color: "#333",
    marginTop: 2,
  },
  sightingsInfo: {
    gap: 4,
  },
  sightingsLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 4,
  },
  sightingItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 8,
  },
  sightingText: {
    fontSize: 14,
    color: "#333",
  },
});
