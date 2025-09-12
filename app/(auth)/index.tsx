import { useAuth } from "@/providers/AuthProvider";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Index() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.replace("/(auth)/signin");
    }
  }, [user]);

  if (!user) {
    return (
      <View>
        <ActivityIndicator size={24} />
      </View>
    );
  }

  return (
    <View>
      <Text>Welcome, {user.name}</Text>
    </View>
  );
}
