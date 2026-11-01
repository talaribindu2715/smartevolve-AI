import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { UserRole } from "../types";

export const ACCESS_TOKEN_KEY = "smartevolve_access_token";
export const REFRESH_TOKEN_KEY = "smartevolve_refresh_token";
export const USER_ID_KEY = "smartevolve_user_id";
export const ACTIVE_ROLE_KEY = "smartevolve_active_role";

// Real deterministic demo identities for each of the 4 roles
export const DEMO_IDENTITIES = {
  STUDENT: {
    userId: "00000000-0000-0000-0000-000000000001",
    email: "alex.chen@student.edu",
    fullName: "Alex Chen",
    role: "STUDENT" as UserRole,
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJlbWFpbCI6ImFsZXguY2hlbkBzdHVkZW50LmVkdSIsInJvbGUiOiJhdXRoZW50aWNhdGVkIn0.demo-student",
  },
  MENTOR: {
    userId: "00000000-0000-0000-0000-000000000002",
    email: "dr.elena.rostova@faculty.edu",
    fullName: "Dr. Elena Rostova",
    role: "MENTOR" as UserRole,
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDIiLCJlbWFpbCI6ImRyLmVsZW5hLnJvc3RvdmFAZmFjdWx0eS5lZHUiLCJyb2xlIjoiYXV0aGVudGljYXRlZCJ9.demo-mentor",
  },
  ADMIN: {
    userId: "00000000-0000-0000-0000-000000000003",
    email: "admin@smartevolve.ai",
    fullName: "Sarah Connor",
    role: "ADMIN" as UserRole,
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDMiLCJlbWFpbCI6ImFkbWluQHNtYXJ0ZXZvbHZlLmFpIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQifQ.demo-admin",
  },
  RECRUITER: {
    userId: "00000000-0000-0000-0000-000000000004",
    email: "marcus.vance@techrecruiter.io",
    fullName: "Marcus Vance",
    role: "RECRUITER" as UserRole,
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDQiLCJlbWFpbCI6Im1hcmN1cy52YW5jZUB0ZWNocmVjcnVpdGVyLmlvIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQifQ.demo-recruiter",
  },
};

export const DEMO_ACCESS_TOKEN = DEMO_IDENTITIES.STUDENT.token;
export const DEMO_USER_ID = DEMO_IDENTITIES.STUDENT.userId;

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
      return;
    }
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  },

  async getToken(): Promise<string> {
    if (Platform.OS === "web") {
      return getWebStorage(ACCESS_TOKEN_KEY) || DEMO_ACCESS_TOKEN;
    }
    try {
      const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      return token || DEMO_ACCESS_TOKEN;
    } catch (_) {
      return DEMO_ACCESS_TOKEN;
    }
  },

  async setUserId(id: string): Promise<void> {
    if (Platform.OS === "web") {
      setWebStorage(USER_ID_KEY, id);
      return;
    }
    await SecureStore.setItemAsync(USER_ID_KEY, id);
  },

  async getUserId(): Promise<string> {
    if (Platform.OS === "web") {
      return getWebStorage(USER_ID_KEY) || DEMO_USER_ID;
    }
    try {
      const id = await SecureStore.getItemAsync(USER_ID_KEY);
      return id || DEMO_USER_ID;
    } catch (_) {
      return DEMO_USER_ID;
    }
  },

  async setActiveRole(role: UserRole): Promise<void> {
    if (Platform.OS === "web") {
      setWebStorage(ACTIVE_ROLE_KEY, role);
      return;
    }
    await SecureStore.setItemAsync(ACTIVE_ROLE_KEY, role);
  },

  async getActiveRole(): Promise<UserRole> {
    let r: string | null = null;
    if (Platform.OS === "web") {
      r = getWebStorage(ACTIVE_ROLE_KEY);
    } else {
      try {
        r = await SecureStore.getItemAsync(ACTIVE_ROLE_KEY);
      } catch (_) {}
    }
    return (r as UserRole) || "STUDENT";
  },

  async clear(): Promise<void> {
    if (Platform.OS === "web") {
      removeWebStorage(ACCESS_TOKEN_KEY);
      removeWebStorage(REFRESH_TOKEN_KEY);
      removeWebStorage(USER_ID_KEY);
      removeWebStorage(ACTIVE_ROLE_KEY);
      return;
    }
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_ID_KEY);
      await SecureStore.deleteItemAsync(ACTIVE_ROLE_KEY);
    } catch (_) {}
  },
};
