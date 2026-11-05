import React, { useEffect, Component, ErrorInfo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../src/api/queryClient";
import { PaperProvider, MD3DarkTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import { AuthProvider } from "../src/store/authContext";
import { colors } from "../src/theme/colors";
import { OTAUpdateModal } from "../src/components/OTAUpdateModal";
import { API_BASE_URL } from "../src/api/client";

export { ErrorBoundary } from "expo-router";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("SmartEvolve Root Crash caught by boundary:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: "#070B14",
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: "#131B2E",
              borderRadius: 16,
              padding: 24,
              width: "100%",
              maxWidth: 420,
              borderWidth: 1,
              borderColor: "rgba(99, 102, 241, 0.3)",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 36, marginBottom: 12 }}>⚡</Text>
            <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "800", marginBottom: 8, textAlign: "center" }}>
              App Session Recovered
            </Text>
            <Text style={{ color: "#94A3B8", fontSize: 14, textAlign: "center", marginBottom: 20 }}>
              {this.state.error?.message || "An unexpected error occurred. Tap below to reload."}
            </Text>
            <TouchableOpacity
              onPress={this.handleReload}
              style={{
                backgroundColor: "#6366F1",
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 10,
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }}>Reload SmartEvolve</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}



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

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#070B14",
    card: "#0B0F19",
    text: "#FFFFFF",
    border: "rgba(255, 255, 255, 0.08)",
    primary: colors.primary,
  },
};

export default function RootLayout() {
  useEffect(() => {
    // Proactively warm up live cloud backend if waking from Render cold standby
    fetch(`${API_BASE_URL}/api/public/health`, { method: "GET" }).catch(() => {});
  }, []);

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <AppErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <PaperProvider theme={paperTheme}>
                <ThemeProvider value={navTheme}>
                  <StatusBar style="light" backgroundColor={colors.background} />
                  <OTAUpdateModal initialDelayMs={3000} />
                  <Stack
                    screenOptions={{
                      headerStyle: { backgroundColor: colors.background },
                      headerTintColor: colors.textPrimary,
                      headerShadowVisible: false,
                      contentStyle: { backgroundColor: colors.background },
                      animation: "fade",
                    }}
                  >
                    <Stack.Screen name="index" options={{ headerShown: false, animation: "none" }} />
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
                </ThemeProvider>
              </PaperProvider>
            </AuthProvider>
          </QueryClientProvider>
        </AppErrorBoundary>
      </View>
    </SafeAreaProvider>
  );
}
