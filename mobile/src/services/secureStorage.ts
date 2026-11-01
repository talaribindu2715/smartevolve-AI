import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const ACCESS_TOKEN_KEY = "smartevolve_access_token";
export const REFRESH_TOKEN_KEY = "smartevolve_refresh_token";
export const USER_ID_KEY = "smartevolve_user_id";

// Built-in Demo Student JWT for seamless guest and portfolio access without 403 errors
export const DEMO_ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJlbWFpbCI6ImFsZXguY2hlbkBzdHVkZW50LmVkdSIsInJvbGUiOiJhdXRoZW50aWNhdGVkIn0.smartevolve-demo-token";
export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

// Web fallback with localStorage persistence
const memoryStorage: Record<string, string> = {};

function getWebStorage(key: string): string | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (_) {}
  return memoryStorage[key] || null;
}

function setWebStorage(key: string, value: string): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (_) {}
  memoryStorage[key] = value;
}

function removeWebStorage(key: string): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (_) {}
  delete memoryStorage[key];
}

export const secureStorage = {
  async setToken(token: string): Promise<void> {
    if (Platform.OS === "web") {
      setWebStorage(ACCESS_TOKEN_KEY, token);
      removeWebStorage("smartevolve_logged_out");
      return;
    }
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    try {
      await SecureStore.deleteItemAsync("smartevolve_logged_out");
    } catch (_) {}
  },

  async getToken(): Promise<string | null> {
    if (Platform.OS === "web") {
      const isLoggedOut = getWebStorage("smartevolve_logged_out");
      if (isLoggedOut === "true") {
        return null;
      }
      return getWebStorage(ACCESS_TOKEN_KEY);
    }
    try {
      const isLoggedOut = await SecureStore.getItemAsync("smartevolve_logged_out");
      if (isLoggedOut === "true") {
        return null;
      }
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch (_) {
      return null;
    }
  },

  async setUserId(id: string): Promise<void> {
    if (Platform.OS === "web") {
      setWebStorage(USER_ID_KEY, id);
      return;
    }
    await SecureStore.setItemAsync(USER_ID_KEY, id);
  },

  async getUserId(): Promise<string | null> {
    if (Platform.OS === "web") {
      const isLoggedOut = getWebStorage("smartevolve_logged_out");
      if (isLoggedOut === "true") {
        return null;
      }
      return getWebStorage(USER_ID_KEY);
    }
    try {
      const isLoggedOut = await SecureStore.getItemAsync("smartevolve_logged_out");
      if (isLoggedOut === "true") {
        return null;
      }
      return await SecureStore.getItemAsync(USER_ID_KEY);
    } catch (_) {
      return null;
    }
  },

  async clear(): Promise<void> {
    if (Platform.OS === "web") {
      removeWebStorage(ACCESS_TOKEN_KEY);
      removeWebStorage(REFRESH_TOKEN_KEY);
      removeWebStorage(USER_ID_KEY);
      setWebStorage("smartevolve_logged_out", "true");
      return;
    }
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_ID_KEY);
      await SecureStore.setItemAsync("smartevolve_logged_out", "true");
    } catch (_) {}
  },
};
