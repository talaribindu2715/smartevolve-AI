import React, { createContext, useContext, useEffect, useState } from "react";
import { secureStorage } from "../services/secureStorage";
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
  }, []);

  const restoreSession = async () => {
    try {
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
