import { useReports } from "@/providers/ReportsProvider";
import { MapPin, Navigation } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

const getCoordinatesFromLocation = (location: string) => {
  const locationMap: {
    [key: string]: { latitude: number; longitude: number };
  } = {
    kathmandu: { latitude: 27.7172, longitude: 85.324 },
    pokhara: { latitude: 28.2096, longitude: 83.9856 },
    lalitpur: { latitude: 27.6588, longitude: 85.3247 },
    bhaktapur: { latitude: 27.671, longitude: 85.4298 },
    biratnagar: { latitude: 26.4525, longitude: 87.2718 },
    birgunj: { latitude: 27.0104, longitude: 84.8803 },
    dharan: { latitude: 26.8147, longitude: 87.2798 },
    butwal: { latitude: 27.7, longitude: 83.4486 },
    hetauda: { latitude: 27.4287, longitude: 85.0326 },
    nepalgunj: { latitude: 28.05, longitude: 81.6167 },
  };

  const normalizedLocation = location.toLowerCase();
  for (const [key, coords] of Object.entries(locationMap)) {
    if (normalizedLocation.includes(key)) {
      return coords;
    }
  }

  return { latitude: 27.7172, longitude: 85.324 };
};

export default function MapScreen() {
  const reportsContext = useReports();
  const { reports } = reportsContext || { reports: [] };
  const activeReports = reports.filter((report) => report.status === "active");

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
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: 27.7172,
            longitude: 85.324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation
          showsMyLocationButton
        >
          {activeReports.map((report) => {
            const coordinates = getCoordinatesFromLocation(
              report.lastSeenLocation
            );
            return (
              <Marker
                key={report.id}
                coordinate={coordinates}
                title={report.childName}
                description={`Last seen: ${report.lastSeenLocation}`}
                pinColor="#FF6B6B"
              />
            );
          })}

          {activeReports.flatMap((report) =>
            report.sightings.map((sighting) => {
              const coordinates = getCoordinatesFromLocation(sighting.location);
              return (
                <Marker
                  key={sighting.id}
                  coordinate={coordinates}
                  title={`Sighting: ${report.childName}`}
                  description={sighting.location}
                  pinColor="#4CAF50"
                />
              );
            })
          )}
        </MapView>
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
