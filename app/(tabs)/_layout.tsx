import { ReportsProvider } from "@/providers/ReportsProvider";
import { Tabs } from "expo-router";
import { Home, Map, Plus, User } from "lucide-react-native";
import React from "react";

export default function TabLayout() {
  return (
    <ReportsProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#FF6B6B",
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "white",
            borderTopWidth: 1,
            borderTopColor: "#f0f0f0",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Feed",
            tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: "Map",
            tabBarIcon: ({ color }) => <Map size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="post"
          options={{
            title: "Report",
            tabBarIcon: ({ color }) => <Plus size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => <User size={24} color={color} />,
          }}
        />
      </Tabs>
    </ReportsProvider>
  );
}
