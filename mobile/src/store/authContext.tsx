import React, { createContext, useContext, useEffect, useState } from "react";
import { secureStorage } from "../services/secureStorage";
import { supabase, isSupabaseConfigured } from "../services/supabase";
import { Profile } from "../types";
import { api } from "../api/client";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Profile | null;
  token: string | null;
  login: (token: string, userId: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
  login: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<Profile | null>(null);
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
            } catch (_) {}
          } else if (event === "SIGNED_OUT") {
            await secureStorage.clear();
            setToken(null);
            setUser(null);
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
          } catch (_) {}
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
          setUser(profile);
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

  const login = async (newToken: string, userId: string) => {
    await secureStorage.setToken(newToken);
    await secureStorage.setUserId(userId);
    setToken(newToken);
    setIsAuthenticated(true);
    try {
      const profile = await api.getProfile();
      setUser(profile);
    } catch (_) {}
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
    setIsAuthenticated(false);
  };

  const refreshProfile = async () => {
    try {
      const profile = await api.getProfile();
      setUser(profile);
    } catch (_) {}
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
