import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Supabase Project URL & Anon Key from Expo environment
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";

/**
 * Checks whether real Supabase credentials have been configured
 * in the mobile app environment.
 */
export const isSupabaseConfigured = (): boolean => {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  const upperUrl = supabaseUrl.toUpperCase();
  const upperKey = supabaseAnonKey.toUpperCase();
  return (
    !upperUrl.includes("YOUR_SUPABASE") &&
    !upperUrl.includes("YOUR-PROJECT") &&
    !upperKey.includes("YOUR_SUPABASE") &&
    !upperKey.includes("YOUR-ANON-KEY") &&
    supabaseUrl.startsWith("https://")
  );
};

// SSR-safe storage adapter that prevents "window is not defined" crashes during SSR / Node builds
const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === "web" && typeof window === "undefined") {
      return null;
    }
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web" && typeof window === "undefined") {
      return;
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === "web" && typeof window === "undefined") {
      return;
    }
    return AsyncStorage.removeItem(key);
  },
};

/**
 * Initialized Supabase client for mobile and web.
 * Uses AsyncStorage for cross-platform secure token persistence.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: safeStorage,
    autoRefreshToken: typeof window !== "undefined" || Platform.OS !== "web",
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web" && typeof window !== "undefined",
  },
});

export default supabase;
