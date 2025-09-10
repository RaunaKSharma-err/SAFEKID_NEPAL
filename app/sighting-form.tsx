import { useAuth } from "@/providers/AuthProvider";
import { useLocation } from "@/providers/LocationProvider";
import { useReports } from "@/providers/ReportsProvider";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { ArrowLeft, Camera, MapPin, MapPinned } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type lastSeenType = {
  latitude: number;
  longitude: number;
};

export default function SightingFormScreen() {
  const [lastSeenCoordinates, setlastSeenCoordinates] =
    useState<lastSeenType | null>(null);
  const [selectedReportId, setSelectedReportId] = useState("");
  const [photo, setPhoto] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const { currentLocation } = useLocation();
  const authContext = useAuth();
  const reportsContext = useReports();

  const { user, updateTokens } = authContext || { user: null };
  const { reports, addSighting } = reportsContext || {
    reports: [],
    addSighting: async () => ({}),
  };

  const activeReports = reports.filter((report) => report.status === "active");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!selectedReportId || !description || !location) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!user) return;

    setLoading(true);

    try {
      await addSighting(selectedReportId, {
        reportId: selectedReportId,
        submitterId: user.id,
        submitterName: user.name,
        submitterPhone: user.phone,
        photo,
        description,
        location,
        coordinates: {
          latitude: lastSeenCoordinates?.latitude,
          longitude: lastSeenCoordinates?.longitude,
        },
      });
      updateTokens(user.tokens + 10);
      Alert.alert(
        "Success",
        "Thank you for your sighting report! You earned 10 tokens.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Failed to submit sighting:", error);
      Alert.alert("Error", "Failed to submit sighting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Submit Sighting</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Missing Child *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.reportsScroll}
            >
              {activeReports.map((report) => (
                <TouchableOpacity
                  key={report.id}
                  style={[
                    styles.reportCard,
                    selectedReportId === report.id && styles.selectedReportCard,
                  ]}
                  onPress={() => setSelectedReportId(report.id)}
                >
                  <Image
                    source={{ uri: report.childPhoto }}
                    style={styles.reportPhoto}
                    contentFit="cover"
                  />
                  <Text style={styles.reportName}>{report.childName}</Text>
                  <Text style={styles.reportAge}>Age {report.childAge}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Photo (Optional)</Text>
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              {photo ? (
                <Image
                  source={{ uri: photo }}
                  style={styles.photo}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Camera size={32} color="#666" />
                  <Text style={styles.photoText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe what you saw, when, and any other details..."
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Seen Location *</Text>
            <View style={styles.locationInput}>
              <MapPin size={20} color="#666" />
              <TextInput
                style={styles.locationText}
                value={location}
                onChangeText={setLocation}
                placeholder="Where did you see them?"
              />
            </View>
            <TouchableOpacity
              onPress={() => setlastSeenCoordinates(currentLocation)}
              style={[styles.submitButton, loading && styles.disabledButton]}
            >
              <View style={styles.icon}>
                <MapPinned color={"white"} size={22} />
                <Text style={styles.submitButtonText}>
                  Your Current Location
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.rewardInfo}>
            <Text style={styles.rewardTitle}>Earn 10 Tokens</Text>
            <Text style={styles.rewardText}>
              You&apos;ll receive 10 tokens for submitting this sighting. Bonus
              rewards if the child is found!
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Sighting</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  icon: { flexDirection: "row", alignItems: "center", gap: 12 },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  reportsScroll: {
    flexGrow: 0,
  },
  reportCard: {
    width: 100,
    marginRight: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    alignItems: "center",
  },
  selectedReportCard: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  reportPhoto: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
  },
  reportName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  reportAge: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
  },
  photoButton: {
    width: 120,
    height: 90,
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "center",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  photoText: {
    fontSize: 14,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  locationInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  rewardInfo: {
    backgroundColor: "#E8F5E8",
    padding: 16,
    borderRadius: 12,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#28a745",
    marginBottom: 4,
  },
  rewardText: {
    fontSize: 14,
    color: "#155724",
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
