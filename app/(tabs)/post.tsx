import { useAuth } from "@/providers/AuthProvider";
import { router } from "expo-router";
import { AlertTriangle, Plus } from "lucide-react-native";
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PostScreen() {
  const { user } = useAuth();

  const handlePostReport = () => {
    router.push("/post-report");
  };

  const handleSubmitSighting = () => {
    router.push("/sighting-form");
  };

  if (user?.role === "community") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Help Find Missing Children</Text>
          <Text style={styles.headerSubtitle}>
            Submit sightings to help families
          </Text>
        </View>

        <View style={styles.content}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleSubmitSighting}
          >
            <View style={styles.actionIcon}>
              <AlertTriangle size={32} color="#FF6B6B" />
            </View>
            <Text style={styles.actionTitle}>Submit Sighting</Text>
            <Text style={styles.actionDescription}>
              Report if you&apos;ve seen a missing child
            </Text>
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Earn Tokens</Text>
            <Text style={styles.infoText}>
              • Get 10 tokens for each verified sighting • Earn bonus rewards
              when children are found • Use tokens to support families in need
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Report Missing Child</Text>
        <Text style={styles.headerSubtitle}>
          Get community help to find your child
        </Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.actionCard} onPress={handlePostReport}>
          <View style={styles.actionIcon}>
            <Plus size={32} color="#FF6B6B" />
          </View>
          <Text style={styles.actionTitle}>Post Missing Report</Text>
          <Text style={styles.actionDescription}>
            Alert the community and get help finding your child
          </Text>
        </TouchableOpacity>

        <View style={styles.pricingCard}>
          <Text style={styles.pricingTitle}>Alert Pricing</Text>
          <View style={styles.pricingItem}>
            <Text style={styles.pricingArea}>City-wide</Text>
            <Text style={styles.pricingCost}>Rs. 100</Text>
          </View>
          <View style={styles.pricingItem}>
            <Text style={styles.pricingArea}>Province-wide</Text>
            <Text style={styles.pricingCost}>Rs. 300</Text>
          </View>
          <View style={styles.pricingItem}>
            <Text style={styles.pricingArea}>Nationwide</Text>
            <Text style={styles.pricingCost}>Rs. 500</Text>
          </View>
          <Text style={styles.pricingNote}>
            Use tokens to reduce costs. 1 token = Rs. 1 discount
          </Text>
        </View>
      </View>
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
  content: {
    flex: 1,
    padding: 16,
    gap: 20,
  },
  actionCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  actionDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  pricingCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pricingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  pricingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  pricingArea: {
    fontSize: 14,
    color: "#333",
  },
  pricingCost: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B6B",
  },
  pricingNote: {
    fontSize: 12,
    color: "#666",
    marginTop: 12,
    fontStyle: "italic",
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
