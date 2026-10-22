import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "smartevolve_access_token";
const REFRESH_TOKEN_KEY = "smartevolve_refresh_token";
const USER_ID_KEY = "smartevolve_user_id";

// Web fallback in memory
const memoryStorage: Record<string, string> = {};

export const secureStorage = {
  async setToken(token: string): Promise<void> {
    if (Platform.OS === "web") {
      memoryStorage[ACCESS_TOKEN_KEY] = token;
      return;
    }
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    if (Platform.OS === "web") {
      return memoryStorage[ACCESS_TOKEN_KEY] || null;
    }
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },

  async setUserId(id: string): Promise<void> {
    if (Platform.OS === "web") {
      memoryStorage[USER_ID_KEY] = id;
      return;
    }
    await SecureStore.setItemAsync(USER_ID_KEY, id);
  },

  async getUserId(): Promise<string | null> {
    if (Platform.OS === "web") {
      return memoryStorage[USER_ID_KEY] || null;
    }
    return await SecureStore.getItemAsync(USER_ID_KEY);
  },

  async clear(): Promise<void> {
    if (Platform.OS === "web") {
      delete memoryStorage[ACCESS_TOKEN_KEY];
      delete memoryStorage[REFRESH_TOKEN_KEY];
      delete memoryStorage[USER_ID_KEY];
      return;
    }
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_ID_KEY);
  },
};
