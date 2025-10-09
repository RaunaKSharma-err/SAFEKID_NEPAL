import { calculateFinalCost, getAreaCost } from "@/lib/payment";
import { useAuth } from "@/providers/AuthProvider";
import { useLocation } from "@/providers/LocationProvider";
import { useReports } from "@/providers/ReportsProvider";
import type { BroadcastArea } from "@/types/report";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { ArrowLeft, Camera, MapPin, MapPinned } from "lucide-react-native";
import React, { useEffect, useState } from "react";
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

export default function PostReportScreen() {
  const [lastSeenCoordinates, setlastSeenCoordinates] =
    useState<lastSeenType | null>(null);
  const [child_name, setchild_name] = useState("");
  const [childAge, setChildAge] = useState("");
  const [islocated, setIsLocated] = useState(false);
  const [description, setDescription] = useState("");
  const [lastSeenLocation, setLastSeenLocation] = useState("");
  const [childPhoto, setChildPhoto] = useState("");
  const [broadcastArea, setBroadcastArea] = useState<BroadcastArea>("city");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const { currentLocation, searchPlaces, getPlaceCoordinates } = useLocation();
  const authContext = useAuth();
  const reportsContext = useReports();

  const { user, updateTokens } = authContext || {
    user: null,
    updateTokens: () => {},
  };
  const { createReport } = reportsContext || { createReport: async () => ({}) };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setChildPhoto(result.assets[0].uri);
    }
  };

  const baseCost = getAreaCost(broadcastArea);
  const tokensToUse = Math.min(user?.tokens || 0, baseCost);
  const finalCost = calculateFinalCost(baseCost, tokensToUse);

  const handleSubmit = async () => {
    if (!child_name || !childAge || !description || !childPhoto) {
      Alert.alert("Error", "Please fill in all fields and add a photo");
      return;
    }
    if (!lastSeenLocation && !lastSeenCoordinates) {
      Alert.alert("Error", "Please fill in all fields and add a photo");
      return;
    }

    if (!user) return;

    setLoading(true);

    try {
      const reportData = {
        parentId: user.id,
        parentName: user.name,
        parentPhone: user.phone,
        child_name,
        childAge: parseInt(childAge),
        childPhoto,
        description,
        lastSeenLocation,
        lastSeenCoordinates: {
          latitude: lastSeenCoordinates?.latitude,
          longitude: lastSeenCoordinates?.longitude,
        },
        broadcastArea,
        cost: baseCost,
        status: "active" as const,
      };

      if (finalCost > 0) {
        router.push({
          pathname: "/payment",
          params: {
            reportData: JSON.stringify(reportData),
            amount: finalCost.toString(),
            tokensUsed: tokensToUse.toString(),
          },
        });
      } else {
        await createReport(reportData);
        await updateTokens(user.tokens - tokensToUse);

        Alert.alert(
          "Success",
          "Missing child report posted successfully! Community members will be alerted.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.error("Failed to create report:", error);
      Alert.alert("Error", "Failed to post report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentLocation = async () => {
    setLoading(true);
    try {
      let coords = currentLocation; // default: device location

      // If the user typed a location in the search bar
      if (lastSeenLocation && lastSeenLocation.trim() !== "") {
        const places = await searchPlaces(lastSeenLocation); // fetch matching places
        if (places.length > 0) {
          coords = await getPlaceCoordinates(places[0].name);
        }
      }

      if (!coords) throw new Error("Location not found");

      setlastSeenCoordinates(coords); // update your state
      setIsLocated(true);
    } catch (error) {
      console.error("Error while getting location:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleChangeText = async () => {
      if (lastSeenLocation.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const places = await searchPlaces(lastSeenLocation, 5);
        setResults(places);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    handleChangeText();
  }, [lastSeenLocation, searchPlaces]);
  // Called when a suggestion is selected
  const handleSelectPlace = async (place: any) => {
    const coords = await getPlaceCoordinates(place.name);
    if (!coords) return;

    setlastSeenCoordinates(coords);
    setLastSeenLocation(
      `${place.name}, ${place.state || ""}, ${place.country}`
    );
    setResults([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Report Missing Child</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.photoSection}>
            <Text style={styles.label}>Child&apos;s Photo *</Text>
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              {childPhoto ? (
                <Image
                  source={{ uri: childPhoto }}
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
            <Text style={styles.label}>Child&apos;s Name *</Text>
            <TextInput
              style={styles.input}
              value={child_name}
              onChangeText={setchild_name}
              placeholder="Enter child's full name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age *</Text>
            <TextInput
              style={styles.input}
              value={childAge}
              onChangeText={setChildAge}
              placeholder="Enter age"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Physical description, clothing, etc."
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
                value={lastSeenLocation}
                onChangeText={setLastSeenLocation}
                placeholder={
                  islocated ? "Got your location" : "eg: kathmandu , birgunj"
                }
              />
            </View>
            {loading && <ActivityIndicator style={{ marginTop: 5 }} />}
            {results.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {results.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.suggestionItem}
                    onPress={() => handleSelectPlace(item)}
                  >
                    <Text style={styles.suggestionText}>
                      {item.name}, {item.state || ""}, {item.country}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TouchableOpacity
              onPress={handleCurrentLocation}
              style={[styles.submitButton, loading && styles.disabledButton]}
            >
              <View style={styles.icon}>
                <Text style={styles.submitButtonText}>
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <View style={styles.icon}>
                      <MapPinned color={"white"} size={22} />
                      <Text style={styles.submitButtonText}>
                        {islocated
                          ? "Got your location"
                          : "Your Current Location"}
                      </Text>
                    </View>
                  )}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Broadcast Area</Text>
            <View style={styles.areaButtons}>
              {(["city", "province", "nationwide"] as BroadcastArea[]).map(
                (area) => (
                  <TouchableOpacity
                    key={area}
                    style={[
                      styles.areaButton,
                      broadcastArea === area && styles.activeAreaButton,
                    ]}
                    onPress={() => setBroadcastArea(area)}
                  >
                    <Text
                      style={[
                        styles.areaButtonText,
                        broadcastArea === area && styles.activeAreaButtonText,
                      ]}
                    >
                      {area.charAt(0).toUpperCase() + area.slice(1)}
                    </Text>
                    <Text
                      style={[
                        styles.areaCost,
                        broadcastArea === area && styles.activeAreaCost,
                      ]}
                    >
                      Rs. {getAreaCost(area)}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>

          <View style={styles.costSummary}>
            <Text style={styles.costTitle}>Cost Summary</Text>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Base cost:</Text>
              <Text style={styles.costValue}>Rs. {baseCost}</Text>
            </View>
            {tokensToUse > 0 && (
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Token discount:</Text>
                <Text style={styles.discountValue}>-Rs. {tokensToUse}</Text>
              </View>
            )}
            <View style={[styles.costRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Final cost:</Text>
              <Text style={styles.totalValue}>Rs. {finalCost}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>
                {finalCost > 0 ? "Proceed to Payment" : "Post Report"}
              </Text>
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
  suggestionsContainer: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  suggestionText: {
    fontSize: 14,
    color: "#333",
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
  photoSection: {
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  photoButton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
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
  inputGroup: {
    gap: 8,
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
  areaButtons: {
    gap: 12,
  },
  areaButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  activeAreaButton: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  areaButtonText: {
    fontSize: 16,
    color: "#333",
  },
  activeAreaButtonText: {
    color: "white",
  },
  areaCost: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B6B",
  },
  activeAreaCost: {
    color: "white",
  },
  costSummary: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  costTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  costLabel: {
    fontSize: 14,
    color: "#666",
  },
  costValue: {
    fontSize: 14,
    color: "#333",
  },
  discountValue: {
    fontSize: 14,
    color: "#28a745",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B6B",
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
