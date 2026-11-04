import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PaperProvider, MD3DarkTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/store/authContext";
import { colors } from "../src/theme/colors";
import { OTAUpdateModal } from "../src/components/OTAUpdateModal";
import { API_BASE_URL } from "../src/api/client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      retry: 3, // Auto-retry up to 3 times while Render cloud spins up
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // 2s, 4s, 8s backoff
    },
  },
});

const paperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level1: colors.card,
    },
  },
};

export default function RootLayout() {
  useEffect(() => {
    // Proactively warm up live cloud backend if waking from Render cold standby
    fetch(`${API_BASE_URL}/api/public/health`, { method: "GET" }).catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PaperProvider theme={paperTheme}>
            <StatusBar style="light" backgroundColor={colors.background} />
            <OTAUpdateModal initialDelayMs={3000} />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.textPrimary,
                headerShadowVisible: false,
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/forgot-password" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/reset-password" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="career/[id]"
                options={{ title: "Career Analysis", headerShown: true }}
              />
              <Stack.Screen
                name="learning/[id]"
                options={{ title: "Learning Module", headerShown: true }}
              />
              <Stack.Screen
                name="assessment/[id]"
                options={{ title: "Skill Assessment", headerShown: true }}
              />
              <Stack.Screen
                name="credentials/index"
                options={{ title: "Blockchain Credentials", headerShown: true }}
              />
              <Stack.Screen
                name="settings/index"
                options={{ title: "Settings", headerShown: true }}
              />
              <Stack.Screen
                name="videos/index"
                options={{ title: "SmartEvolve Academy", headerShown: true }}
              />
              <Stack.Screen
                name="videos/[id]"
                options={{ title: "Video Masterclass", headerShown: true }}
              />
            </Stack>
          </PaperProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
