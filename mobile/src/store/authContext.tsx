import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import queryString from "query-string";
import { secureStorage } from "../services/secureStorage";
import { supabase, isSupabaseConfigured } from "../services/supabase";
import { Profile } from "../types";
import { api } from "../api/client";
import { queryClient } from "../api/queryClient";

export const STORAGE_KEY_STUDENT_NAME = "smartevolve_student_name";
export const STORAGE_KEY_USER_META = "smartevolve_user_metadata";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Profile | null;
  token: string | null;
  login: (token: string, userId: string, initialProfile?: Partial<Profile>) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUserLocally: (updated: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
  login: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
  updateUserLocally: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const extractAndSyncUser = async (
    sessionUser?: any,
    fetchedProfile?: Profile | null,
    providedDetails?: Partial<Profile>
  ): Promise<Profile> => {
    let storedName = await AsyncStorage.getItem(STORAGE_KEY_STUDENT_NAME);
    let storedMetaRaw = await AsyncStorage.getItem(STORAGE_KEY_USER_META);
    let storedMeta = storedMetaRaw ? JSON.parse(storedMetaRaw) : {};

    const meta = sessionUser?.user_metadata || {};
    const metaName =
      providedDetails?.fullName ||
      meta.full_name ||
      meta.fullName ||
      meta.name ||
      storedName;
    const metaInstitution =
      providedDetails?.institution ||
      meta.institution ||
      storedMeta.institution ||
      "Engineering College";
    const metaBranch =
      providedDetails?.branch ||
      meta.branch ||
      meta.department ||
      storedMeta.branch ||
      "Computer Science";
    const metaGradYear =
      providedDetails?.graduationYear ||
      meta.graduation_year ||
      meta.graduationYear ||
      storedMeta.graduationYear ||
      2027;
    const metaEducationLevel =
      providedDetails?.educationLevel ||
      meta.education_level ||
      meta.educationLevel ||
      storedMeta.educationLevel ||
      "Undergraduate B.Tech";

    const effectiveName =
      metaName && metaName.trim().length > 0 && metaName !== "Student" && metaName !== "Alex Chen"
        ? metaName.trim()
        : fetchedProfile?.fullName &&
          fetchedProfile.fullName !== "Student" &&
          fetchedProfile.fullName !== "Alex Chen"
        ? fetchedProfile.fullName
        : storedName && storedName !== "Student" && storedName !== "Alex Chen"
        ? storedName
        : sessionUser?.email
        ? sessionUser.email.split("@")[0]
        : "Student";

    // Persist real registered name and metadata to local storage
    await AsyncStorage.setItem(STORAGE_KEY_STUDENT_NAME, effectiveName);
    await AsyncStorage.setItem(
      STORAGE_KEY_USER_META,
      JSON.stringify({
        institution: metaInstitution,
        branch: metaBranch,
        graduationYear: metaGradYear,
        educationLevel: metaEducationLevel,
      })
    );

    const mergedProfile: Profile = {
      id: fetchedProfile?.id || sessionUser?.id || "student-id",
      fullName: effectiveName,
      educationLevel: fetchedProfile?.educationLevel || metaEducationLevel,
      institution: fetchedProfile?.institution || metaInstitution,
      branch: fetchedProfile?.branch || metaBranch,
      graduationYear: fetchedProfile?.graduationYear || Number(metaGradYear),
      interests: fetchedProfile?.interests || ["AI & Machine Learning", "Full-Stack Development"],
      preferredLearningStyle:
        fetchedProfile?.preferredLearningStyle || "Hands-on Projects & Video Masterclasses",
      academicGoals:
        fetchedProfile?.academicGoals || "Master AI engineering and on-chain systems",
      targetCareerId: fetchedProfile?.targetCareerId,
      targetCareerName: fetchedProfile?.targetCareerName,
      onboardingCompleted: fetchedProfile?.onboardingCompleted ?? true,
    };

    // If backend profile still has placeholder or was missing, synchronize backend
    const needsBackendSync =
      !fetchedProfile ||
      !fetchedProfile.fullName ||
      fetchedProfile.fullName === "Student" ||
      fetchedProfile.fullName === "Alex Chen" ||
      fetchedProfile.fullName !== effectiveName;

    if (needsBackendSync) {
      api
        .updateProfile({
          fullName: effectiveName,
          institution: metaInstitution,
          branch: metaBranch,
          graduationYear: Number(metaGradYear),
          educationLevel: metaEducationLevel,
          onboardingCompleted: true,
        })
        .catch(() => {});
    }

    setUser(mergedProfile);
    return mergedProfile;
  };

  useEffect(() => {
    restoreSession();

    // Listen to Supabase auth state changes if configured
    let authListener: any = null;
    let linkSub: any = null;

    if (isSupabaseConfigured()) {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === "SIGNED_IN" && session) {
            await secureStorage.setToken(session.access_token);
            await secureStorage.setUserId(session.user.id);
            setToken(session.access_token);
            setIsAuthenticated(true);
            try {
              const profile = await api.getProfile();
              await extractAndSyncUser(session.user, profile);
            } catch (_) {
              await extractAndSyncUser(session.user, null);
            }
          } else if (event === "SIGNED_OUT") {
            await secureStorage.clear();
            try {
              queryClient.cancelQueries();
              queryClient.clear();
            } catch (_) {}
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      );
      authListener = data;

      // Listen for Native OAuth deep linking callback (smartevolve://)
      if (Platform.OS !== "web") {
        const handleAuthDeepLink = async (event: { url: string }) => {
          if (!event?.url) return;
          try {
            const url = event.url;
            if (url.includes("#")) {
              const hash = url.split("#")[1];
              const parsed = queryString.parse(hash);
              if (parsed.access_token && parsed.refresh_token) {
                await supabase.auth.setSession({
                  access_token: parsed.access_token as string,
                  refresh_token: parsed.refresh_token as string,
                });
              }
            } else if (url.includes("code=")) {
              const query = url.includes("?") ? url.split("?")[1] : url;
              const parsed = queryString.parse(query);
              if (parsed.code) {
                await supabase.auth.exchangeCodeForSession(parsed.code as string);
              }
            }
          } catch (e) {
            console.warn("Failed to process auth deep link:", e);
          }
        };

        linkSub = Linking.addEventListener("url", handleAuthDeepLink);
        Linking.getInitialURL().then((initialUrl) => {
          if (initialUrl) handleAuthDeepLink({ url: initialUrl });
        });
      }
    }

    return () => {
      authListener?.subscription?.unsubscribe?.();
      linkSub?.remove?.();
    };
  }, []);

  const restoreSession = async () => {
    try {
      // 0. If user explicitly logged out, do not auto-restore session
      const isLoggedOut = await secureStorage.isExplicitlyLoggedOut();
      if (isLoggedOut) {
        setIsAuthenticated(false);
        setToken(null);
        setUser(null);
        return;
      }

      // 1. Check Supabase session first if configured
      if (isSupabaseConfigured()) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          const accessToken = data.session.access_token;
          await secureStorage.setToken(accessToken);
          await secureStorage.setUserId(data.session.user.id);
          setToken(accessToken);
          setIsAuthenticated(true);
          try {
            const profile = await api.getProfile();
            await extractAndSyncUser(data.session.user, profile);
          } catch (_) {
            await extractAndSyncUser(data.session.user, null);
          }
          return;
        }
      }

      // 2. Check local storage fallback
      const storedToken = await secureStorage.getToken();
      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);
        try {
          const profile = await api.getProfile();
          await extractAndSyncUser(null, profile);
        } catch (_) {
          await extractAndSyncUser(null, null);
        }
      }
    } catch (e) {
      console.warn("Failed to restore auth session:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string, userId: string, initialProfile?: Partial<Profile>) => {
    await secureStorage.setToken(newToken);
    await secureStorage.setUserId(userId);
    setToken(newToken);
    setIsAuthenticated(true);
    let sessionUser: any = null;
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.auth.getUser();
        sessionUser = data?.user;
      } catch (_) {}
    }
    try {
      const profile = await api.getProfile();
      await extractAndSyncUser(sessionUser, profile, initialProfile);
    } catch (_) {
      await extractAndSyncUser(sessionUser, null, initialProfile);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch (_) {}
    }
    await secureStorage.clear();
    try {
      await AsyncStorage.multiRemove([
        "smartevolve_user_session",
        "smartevolve_cached_profile",
      ]);
    } catch (_) {}
    try {
      queryClient.cancelQueries();
      queryClient.clear();
    } catch (_) {}
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshProfile = async () => {
    let sessionUser: any = null;
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.auth.getUser();
        sessionUser = data?.user;
      } catch (_) {}
    }
    try {
      const profile = await api.getProfile();
      await extractAndSyncUser(sessionUser, profile);
    } catch (_) {
      await extractAndSyncUser(sessionUser, null);
    }
  };

  const updateUserLocally = (updated: Partial<Profile>) => {
    setUser((prev) => {
      const next = prev ? { ...prev, ...updated } : (updated as Profile);
      if (updated.fullName) {
        AsyncStorage.setItem(STORAGE_KEY_STUDENT_NAME, updated.fullName).catch(() => {});
      }
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        token,
        login,
        logout,
        refreshProfile,
        updateUserLocally,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
