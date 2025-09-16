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
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code === "PGRST116") {
      // no row found → create fallback profile
      const { data: authUser } = await supabase.auth.getUser();

      if (authUser?.user) {
        const fallback = {
          id,
          email: authUser.user.email ?? "",
          phone: "",
          name: "",
          role: "parent", // or default role
          tokens: 100,
          created_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase
          .from("users")
          .insert(fallback);

        if (!insertError) {
          // Map DB shape to your User type
          const profileUser: User = {
            id: fallback.id,
            email: fallback.email,
            phone: fallback.phone,
            name: fallback.name,
            role: fallback.role as UserRole,
            tokens: fallback.tokens,
            createdAt: fallback.created_at, // ✅ camelCase for TS type
          };

          setUser(profileUser);
          await AsyncStorage.setItem("user", JSON.stringify(profileUser));
          router.replace("/(tabs)");
          return;
        }
      }
    }

    if (error) {
      console.error("Fetch profile error:", error);
      return;
    }

    // normal flow
    const profileUser: User = {
      id: data.id,
      email: data.email,
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
    async (
      name: string,
      email: string,
      phone: string,
      role: UserRole,
      password: string
    ) => {
      console.log("Signing up with:", { email, password, phone, name, role });

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        const supabaseUser = data.user;
        if (!supabaseUser) throw new Error("No user returned from Supabase");

        const { error: dbError } = await supabase.from("users").insert({
          id: supabaseUser.id,
          email,
          phone,
          name,
          role,
          tokens: role === "community" ? 50 : 100,
          created_at: new Date().toISOString(),
        });

        if (dbError) {
          console.error("DB insert error:", dbError);
          throw dbError;
        }

        const newUser: User = {
          id: supabaseUser.id,
          email,
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

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const supabaseUser = data.user;
      if (!supabaseUser) throw new Error("No user returned from Supabase");

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
      return { success: false, error: "Invalid email or password" };
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
          .from("users")
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
