import { useLocation } from "@/providers/LocationProvider";
import { useReports } from "@/providers/ReportsProvider";
import { MapPin, Navigation } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import LeafletMap, { LeafletMapHandle } from "../../components/Map";

export default function MapScreen() {
  const mapRef = useRef<LeafletMapHandle>(null);
  const reportsContext = useReports();
  const { getPlaceCoordinates } = useLocation();
  const { reports } = reportsContext || { reports: [] };
  const activeReports = reports.filter((report) => report.status === "active");

  useEffect(() => {
    if (!mapRef.current) return;

    const addMarkers = async () => {
      for (const report of activeReports) {
        // Last seen location
        const lastSeenLocation = await getPlaceCoordinates(
          report.lastSeenLocation
        );
        if (!lastSeenLocation) continue;

        mapRef.current?.addMarker(
          report.id,
          lastSeenLocation.latitude,
          lastSeenLocation.longitude,
          `Last seen: ${report.childName}`
        );

        // Sightings
        for (const sighting of report.sightings) {
          const coords = await getPlaceCoordinates(sighting.location);
          if (!coords) continue;

          mapRef.current?.addMarker(
            sighting.id,
            coords.latitude,
            coords.longitude,
            `Sighting: ${report.childName}`
          );
        }
      }
    };

    addMarkers();
  }, [activeReports, mapRef,getPlaceCoordinates]);

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

      <ScrollView style={styles.locationsList}>
        <Text style={styles.listTitle}>Recent Locations</Text>

        {activeReports.map((report) => (
          <View key={report.id} style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <MapPin size={20} color="#FF6B6B" />
              <Text style={styles.childName}>{report.childName}</Text>
            </View>

            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Last seen:</Text>
              <Text style={styles.locationText}>{report.lastSeenLocation}</Text>
            </View>

            {report.sightings.length > 0 && (
              <View style={styles.sightingsInfo}>
                <Text style={styles.sightingsLabel}>Recent sightings:</Text>
                {report.sightings.slice(0, 2).map((sighting) => (
                  <View key={sighting.id} style={styles.sightingItem}>
                    <Navigation size={14} color="#666" />
                    <Text style={styles.sightingText}>{sighting.location}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
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
    marginBottom: 16,
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
