import { useAuth } from "@/providers/AuthProvider";
import { useReports } from "@/providers/ReportsProvider";
import { Image } from "expo-image";
import { router } from "expo-router";
import { AlertTriangle, Clock, Coins, Eye, MapPin } from "lucide-react-native";
import React, { useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function FeedScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const reportsContext = useReports();
  const authContext = useAuth();

  const { reports, loadReports } = reportsContext || { reports: [] };
  const { user } = authContext || { user: null };

  const onRefresh = async () => {
    setRefreshing(true);
    loadReports();
    setTimeout(() => setRefreshing(false), 1000);
  };
  console.log(reports);

  const activeReports = reports.filter((report) => report.status === "active");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>SafeKid Nepal</Text>
          <Text style={styles.headerSubtitle}>Missing Child Alerts</Text>
        </View>
        {user && (
          <View style={styles.tokenContainer}>
            <Coins size={16} color="#FFB800" />
            <Text style={styles.tokenText}>{user.tokens}</Text>
          </View>
        )}
      </View>
      {/* <Try /> */}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeReports.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No active alerts</Text>
            <Text style={styles.emptyText}>
              When missing child reports are posted, they will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.reportsList}>
            {activeReports.map((report) => (
              <TouchableOpacity
                key={report.id}
                style={styles.reportCard}
                onPress={() => console.log("Report details:", report.id)}
              >
                <Image
                  source={{ uri: report.childPhoto }}
                  style={styles.childPhoto}
                  contentFit="cover"
                />

                <View style={styles.reportInfo}>
                  <Text style={styles.childName}>{report.child_name}</Text>
                  <Text style={styles.childAge}>Age: {report.childAge}</Text>

                  <View style={styles.locationContainer}>
                    <MapPin size={14} color="#666" />
                    <Text style={styles.location}>
                      {report.lastSeenLocation}
                    </Text>
                  </View>

                  <View style={styles.metaContainer}>
                    <View style={styles.timeContainer}>
                      <Clock size={14} color="#666" />
                      <Text style={styles.timeText}>
                        {new Date(report.created_at).toLocaleDateString()}
                      </Text>
                    </View>

                    <View style={styles.sightingsContainer}>
                      <Eye size={14} color="#666" />
                      <Text style={styles.sightingsText}>
                        {report.sightings.length} sightings
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {user && (
        <View style={styles.fabContainer}>
          {user.role === "parent" && (
            <TouchableOpacity
              style={[styles.fab, styles.reportFab]}
              onPress={() => router.push("/post-report")}
            >
              <AlertTriangle size={24} color="white" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.fab, styles.sightingFab]}
            onPress={() => router.push("/sighting-form")}
          >
            <Eye size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 40,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  tokenContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    marginTop: 40,
  },
  tokenText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F57C00",
  },
  content: {
    flex: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  reportsList: {
    padding: 16,
    gap: 16,
  },
  reportCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  childPhoto: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  reportInfo: {
    flex: 1,
    gap: 4,
  },
  childName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  childAge: {
    fontSize: 14,
    color: "#666",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: "#666",
  },
  sightingsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sightingsText: {
    fontSize: 12,
    color: "#666",
  },
  fabContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    gap: 12,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  reportFab: {
    backgroundColor: "#FF6B6B",
  },
  sightingFab: {
    backgroundColor: "#4CAF50",
  },
});
