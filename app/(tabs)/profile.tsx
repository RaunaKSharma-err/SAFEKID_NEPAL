import { useAuth } from "@/providers/AuthProvider";
import { useReports } from "@/providers/ReportsProvider";
import { router } from "expo-router";
import {
  Coins,
  FileText,
  LogOut,
  Settings,
  Shield,
  User,
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

export default function ProfileScreen() {
  const authContext = useAuth();
  const reportsContext = useReports();

  const { user, signOut } = authContext || { user: null, signOut: () => {} };
  const { getMyReports } = reportsContext || { getMyReports: () => [] };

  if (!user) return null;

  const myReports = getMyReports();
  const activeReports = myReports.filter(
    (report) => report.status === "active"
  );
  const foundReports = myReports.filter((report) => report.status === "found");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <User size={32} color="#FF6B6B" />
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.phone}>{user.phone}</Text>
          <View style={styles.roleContainer}>
            <Text style={styles.role}>
              {user.role === "parent"
                ? "Parent/Guardian"
                : user.role === "community"
                ? "Community Member"
                : "Admin"}
            </Text>
          </View>
        </View>

        <View style={styles.tokenCard}>
          <View style={styles.tokenHeader}>
            <Coins size={24} color="#FFB800" />
            <Text style={styles.tokenTitle}>Token Balance</Text>
          </View>
          <Text style={styles.tokenAmount}>{user.tokens}</Text>
          <Text style={styles.tokenDescription}>
            Earn tokens by helping find missing children
          </Text>
        </View>

        {user.role === "parent" && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>My Reports</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{activeReports.length}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{foundReports.length}</Text>
                <Text style={styles.statLabel}>Found</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{myReports.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <FileText size={20} color="#666" />
            <Text style={styles.menuText}>My Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Settings size={20} color="#666" />
            <Text style={styles.menuText}>Settings</Text>
          </TouchableOpacity>

          {user.role === "admin" && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/admin")}
            >
              <Shield size={20} color="#666" />
              <Text style={styles.menuText}>Admin Panel</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.menuItem} onPress={signOut}>
            <LogOut size={20} color="#FF6B6B" />
            <Text style={[styles.menuText, { color: "#FF6B6B" }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: "white",
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  roleContainer: {
    backgroundColor: "#FFF5F5",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  role: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FF6B6B",
  },
  tokenCard: {
    backgroundColor: "white",
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tokenHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  tokenTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  tokenAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFB800",
    marginBottom: 4,
  },
  tokenDescription: {
    fontSize: 14,
    color: "#666",
  },
  statsCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  menuSection: {
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
});
