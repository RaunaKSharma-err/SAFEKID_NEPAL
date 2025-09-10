import { AuthProvider } from "@/providers/AuthProvider";
import { LocationProvider } from "@/providers/LocationProvider";
import { ReportsProvider } from "@/providers/ReportsProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
      <Stack.Screen
        name="post-report"
        options={{ presentation: "modal", title: "Report Missing Child" }}
      />
      <Stack.Screen
        name="payment"
        options={{ presentation: "modal", title: "Payment" }}
      />
      <Stack.Screen
        name="sighting-form"
        options={{ presentation: "modal", title: "Submit Sighting" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <LocationProvider>
          <AuthProvider>
            <ReportsProvider>
              <RootLayoutNav />
            </ReportsProvider>
          </AuthProvider>
        </LocationProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
