import type { User, UserRole } from "@/types/auth";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const stored = await AsyncStorage.getItem("user");
      if (stored) {
        const userData = JSON.parse(stored);
        setUser(userData);

        if (userData.role === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/(tabs)");
        }
      } else {
        router.replace("/(auth)");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.replace("/(auth)");
    } finally {
      setLoading(false);
    }
  };

  const signIn = useCallback(async (phone: string, password: string) => {
    try {
      const mockUser: User = {
        id: `user_${Date.now()}`,
        phone,
        name: phone === "9841234567" ? "Admin User" : "Test User",
        role: phone === "9841234567" ? "admin" : "parent",
        tokens: 100,
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem("user", JSON.stringify(mockUser));
      setUser(mockUser);

      if (mockUser.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/(tabs)");
      }

      return { success: true };
    } catch (error) {
      console.error("Sign in error:", error);
      return { success: false, error: "Failed to sign in" };
    }
  }, []);

  const signUp = useCallback(
    async (phone: string, name: string, role: UserRole, password: string) => {
      try {
        const newUser: User = {
          id: `user_${Date.now()}`,
          phone,
          name,
          role,
          tokens: role === "community" ? 50 : 100,
          createdAt: new Date().toISOString(),
        };

        await AsyncStorage.setItem("user", JSON.stringify(newUser));
        setUser(newUser);
        router.replace("/(tabs)");

        return { success: true };
      } catch (error) {
        console.error("Sign up error:", error);
        return { success: false, error: "Failed to create account" };
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.removeItem("user");
      setUser(null);
      router.replace("/(auth)");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }, []);

  const updateTokens = useCallback(
    async (newTokens: number) => {
      if (user) {
        const updatedUser = { ...user, tokens: newTokens };
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    },
    [user]
  );

  return useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signOut,
      updateTokens,
    }),
    [user, loading, signIn, signUp, signOut, updateTokens]
  );
});
