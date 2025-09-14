import { supabase } from "@/lib/supabase";
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
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await fetchProfile(session.user.id);
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

  const fetchProfile = async (id: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Fetch profile error:", error);
      return;
    }

    const profileUser: User = {
      id: data.id,
      phone: data.phone,
      name: data.name,
      role: data.role,
      tokens: data.tokens,
      createdAt: data.created_at,
    };

    await AsyncStorage.setItem("user", JSON.stringify(profileUser));
    setUser(profileUser);

    if (profileUser.role === "admin") {
      router.replace("/admin");
    } else {
      router.replace("/(tabs)");
    }
  };

  const signUp = useCallback(
    async (phone: string, name: string, role: UserRole, password: string) => {
      try {
        const generatedEmail = `${phone}@safekid.app`; // auto-email

        // Create auth user
        const { data, error } = await supabase.auth.signUp({
          email: generatedEmail,
          password,
        });

        if (error) throw error;

        const supabaseUser = data.user;
        if (!supabaseUser) throw new Error("No user returned from Supabase");

        // Store extra fields in your custom users table
        const { error: dbError } = await supabase.from("users").insert({
          id: supabaseUser.id,
          phone,
          name,
          role,
          tokens: role === "community" ? 50 : 100,
          created_at: new Date().toISOString(),
        });

        if (dbError) throw dbError;

        // Save locally
        const newUser: User = {
          id: supabaseUser.id,
          phone,
          name,
          role,
          tokens: role === "community" ? 50 : 100,
          createdAt: new Date().toISOString(),
        };

        await AsyncStorage.setItem("user", JSON.stringify(newUser));
        setUser(newUser);

        router.replace(role === "admin" ? "/admin" : "/(tabs)");

        return { success: true };
      } catch (error) {
        console.error("Sign up error:", error);
        return { success: false, error: "Failed to create account" };
      }
    },
    []
  );

  const signIn = useCallback(async (phone: string, password: string) => {
    try {
      const generatedEmail = `${phone}@safekid.app`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: generatedEmail,
        password,
      });

      if (error) throw error;

      const supabaseUser = data.user;
      if (!supabaseUser) throw new Error("No user returned from Supabase");

      // Load extra info from your users table
      const { data: userRow, error: dbError } = await supabase
        .from("users")
        .select("*")
        .eq("id", supabaseUser.id)
        .single();

      if (dbError) throw dbError;

      await AsyncStorage.setItem("user", JSON.stringify(userRow));
      setUser(userRow);

      router.replace(userRow.role === "admin" ? "/admin" : "/(tabs)");

      return { success: true };
    } catch (error) {
      console.error("Sign in error:", error);
      return { success: false, error: "Invalid phone or password" };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
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
        const { error } = await supabase
          .from("profiles")
          .update({ tokens: newTokens })
          .eq("id", user.id);

        if (!error) {
          const updatedUser = { ...user, tokens: newTokens };
          await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
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
