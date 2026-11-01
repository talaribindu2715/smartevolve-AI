import React, { createContext, useContext, useEffect, useState } from "react";
import { secureStorage, DEMO_IDENTITIES } from "../services/secureStorage";
import { supabase, isSupabaseConfigured } from "../services/supabase";
import { Profile, UserRole } from "../types";
import { api } from "../api/client";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Profile | null;
  userRole: UserRole;
  isStudent: boolean;
  isMentor: boolean;
  isAdmin: boolean;
  isRecruiter: boolean;
  token: string | null;
  login: (token: string, userId: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<string>;
  refreshProfile: () => Promise<Profile | null>;
  getDashboardRouteForRole: (role?: UserRole) => string;
}

export function normalizeRole(roleStr?: string | null): UserRole {
  if (!roleStr) return "STUDENT";
  const upper = roleStr.toUpperCase();
  if (upper === "ADMIN") return "ADMIN";
  if (upper === "MENTOR" || upper === "FACULTY" || upper === "INSTRUCTOR") return "MENTOR";
  if (upper === "RECRUITER" || upper === "EMPLOYER" || upper === "HR") return "RECRUITER";
  return "STUDENT";
}

export function getDashboardRoute(role?: UserRole): string {
  const normalized = normalizeRole(role);
  switch (normalized) {
    case "MENTOR":
      return "/mentor/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    case "RECRUITER":
      return "/recruiter/dashboard";
    case "STUDENT":
    default:
      return "/(tabs)";
  }
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  userRole: "STUDENT",
  isStudent: true,
  isMentor: false,
  isAdmin: false,
  isRecruiter: false,
  token: null,
  login: async () => {},
  logout: async () => {},
  switchRole: async () => "/(tabs)",
  refreshProfile: async () => null,
  getDashboardRouteForRole: () => "/(tabs)",
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole>("STUDENT");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    restoreSession();

    // Listen to Supabase auth state changes if configured
    if (isSupabaseConfigured()) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === "SIGNED_IN" && session) {
            await secureStorage.setToken(session.access_token);
            await secureStorage.setUserId(session.user.id);
            setToken(session.access_token);
            setIsAuthenticated(true);
            try {
              const profile = await api.getProfile();
              setUser(profile);
              const r = normalizeRole(profile.role);
              setUserRole(r);
              await secureStorage.setActiveRole(r);
            } catch (_) {}
          } else if (event === "SIGNED_OUT") {
            await secureStorage.clear();
            setToken(null);
            setUser(null);
            setUserRole("STUDENT");
            setIsAuthenticated(false);
          }
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const restoreSession = async () => {
    try {
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
            setUser(profile);
            const r = normalizeRole(profile.role);
            setUserRole(r);
            await secureStorage.setActiveRole(r);
          } catch (_) {}
          return;
        }
      }

      // 2. Check local storage fallback
      const storedToken = await secureStorage.getToken();
      const storedRole = await secureStorage.getActiveRole();
      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);
        setUserRole(storedRole);
        try {
          const profile = await api.getProfile();
          setUser(profile);
          if (profile.role) {
            const r = normalizeRole(profile.role);
            setUserRole(r);
            await secureStorage.setActiveRole(r);
          }
        } catch (_) {
          // If offline or initial, fallback gracefully
        }
      }
    } catch (e) {
      console.warn("Failed to restore auth session:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string, userId: string, explicitRole?: UserRole) => {
    await secureStorage.setToken(newToken);
    await secureStorage.setUserId(userId);
    setToken(newToken);
    setIsAuthenticated(true);
    try {
      const profile = await api.getProfile();
      setUser(profile);
      const r = normalizeRole(explicitRole || profile.role);
      setUserRole(r);
      await secureStorage.setActiveRole(r);
    } catch (_) {
      const r = normalizeRole(explicitRole);
      setUserRole(r);
      await secureStorage.setActiveRole(r);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (_) {}
    }
    await secureStorage.clear();
    setToken(null);
    setUser(null);
    setUserRole("STUDENT");
    setIsAuthenticated(false);
  };

  const switchRole = async (targetRole: UserRole): Promise<string> => {
    const normalized = normalizeRole(targetRole);
    const demo = DEMO_IDENTITIES[normalized as keyof typeof DEMO_IDENTITIES] || DEMO_IDENTITIES.STUDENT;

    await secureStorage.setToken(demo.token);
    await secureStorage.setUserId(demo.userId);
    await secureStorage.setActiveRole(demo.role);

    setToken(demo.token);
    setUserRole(demo.role);
    setIsAuthenticated(true);

    try {
      const profile = await api.getProfile();
      setUser(profile);
    } catch (_) {
      setUser({
        id: demo.userId,
        fullName: demo.fullName,
        role: demo.role,
        educationLevel: "Academic Profile",
        institution: "MIT Engineering & Partner Network",
        branch: "Engineering & Applied Sciences",
        graduationYear: 2027,
        interests: [],
        onboardingCompleted: true,
      });
    }

    return getDashboardRoute(demo.role);
  };

  const refreshProfile = async (): Promise<Profile | null> => {
    try {
      const profile = await api.getProfile();
      setUser(profile);
      if (profile.role) {
        const r = normalizeRole(profile.role);
        setUserRole(r);
        await secureStorage.setActiveRole(r);
      }
      return profile;
    } catch (_) {
      return null;
    }
  };

  const normalized = normalizeRole(userRole || user?.role);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        userRole: normalized,
        isStudent: normalized === "STUDENT",
        isMentor: normalized === "MENTOR",
        isAdmin: normalized === "ADMIN",
        isRecruiter: normalized === "RECRUITER",
        token,
        login,
        logout,
        switchRole,
        refreshProfile,
        getDashboardRouteForRole: getDashboardRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
