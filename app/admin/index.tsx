import { useAuth } from "@/providers/AuthProvider";
import { useReports } from "@/providers/ReportsProvider";
import { router } from "expo-router";
import {
  ArrowLeft,
  CheckCircle,
  DollarSign,
  FileText,
  Users,
  XCircle,
} from "lucide-react-native";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AdminScreen() {
  const authContext = useAuth();
  const reportsContext = useReports();

  const { user, signOut } = authContext || { user: null, signOut: () => {} };
  const { reports, markAsFound } = reportsContext || {
    reports: [],
    markAsFound: async () => {},
  };

  const activeReports = reports.filter((report) => report.status === "active");
  const foundReports = reports.filter((report) => report.status === "found");
  const totalSightings = reports.reduce(
    (sum, report) => sum + report.sightings.length,
    0
  );

  return (
    <SafeAreaView style={styles.container}>
      {user?.role !== "admin" ? (
        <Text>Access denied</Text>
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Admin Panel</Text>
            <TouchableOpacity onPress={signOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <FileText size={24} color="#FF6B6B" />
                <Text style={styles.statNumber}>{activeReports.length}</Text>
                <Text style={styles.statLabel}>Active Reports</Text>
              </View>

              <View style={styles.statCard}>
                <CheckCircle size={24} color="#28a745" />
                <Text style={styles.statNumber}>{foundReports.length}</Text>
                <Text style={styles.statLabel}>Found Children</Text>
              </View>

              <View style={styles.statCard}>
                <Users size={24} color="#007bff" />
                <Text style={styles.statNumber}>{totalSightings}</Text>
                <Text style={styles.statLabel}>Total Sightings</Text>
              </View>

              <View style={styles.statCard}>
                <DollarSign size={24} color="#ffc107" />
                <Text style={styles.statNumber}>
                  Rs. {reports.length * 200}
                </Text>
                <Text style={styles.statLabel}>Revenue</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active Reports</Text>
              {activeReports.map((report) => (
                <View key={report.id} style={styles.reportCard}>
                  <View style={styles.reportHeader}>
                    <Text style={styles.reportChild}>{report.childName}</Text>
                    <Text style={styles.reportDate}>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </Text>
                  </View>

                  <Text style={styles.reportLocation}>
                    {report.lastSeenLocation}
                  </Text>
                  <Text style={styles.reportSightings}>
                    {report.sightings.length} sightings reported
                  </Text>

                  <View style={styles.reportActions}>
                    <TouchableOpacity
                      style={styles.foundButton}
                      onPress={() => markAsFound(report.id)}
                    >
                      <CheckCircle size={16} color="white" />
                      <Text style={styles.foundButtonText}>Mark as Found</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.closeButton}>
                      <XCircle size={16} color="white" />
                      <Text style={styles.closeButtonText}>Close Case</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <View style={styles.activityCard}>
                <Text style={styles.activityText}>
                  System running smoothly. {reports.length} total reports
                  processed.
                </Text>
              </View>
            </View>
          </ScrollView>
        </>
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
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  signOutText: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  reportCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reportChild: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  reportDate: {
    fontSize: 12,
    color: "#666",
  },
  reportLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  reportSightings: {
    fontSize: 14,
    color: "#007bff",
    marginBottom: 12,
  },
  reportActions: {
    flexDirection: "row",
    gap: 8,
  },
  foundButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#28a745",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  foundButtonText: {
    fontSize: 12,
    color: "white",
    fontWeight: "500",
  },
  closeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc3545",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  closeButtonText: {
    fontSize: 12,
    color: "white",
    fontWeight: "500",
  },
  activityCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityText: {
    fontSize: 14,
    color: "#666",
  },
});
