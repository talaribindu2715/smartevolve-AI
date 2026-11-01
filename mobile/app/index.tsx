import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { useAuth } from "../src/store/authContext";
import { colors, spacing } from "../src/theme/colors";

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          router.replace("/(tabs)");
        } else {
          router.replace("/onboarding");
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      {/* Brand Icon SVG */}
      <View style={styles.logoWrap}>
        <Svg width="90" height="90" viewBox="0 0 100 100" fill="none">
          <Defs>
            <LinearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.primary} />
              <Stop offset="50%" stopColor={colors.secondary} />
              <Stop offset="100%" stopColor={colors.accent} />
            </LinearGradient>
          </Defs>
          <Circle cx="50" cy="50" r="46" stroke="url(#logoGrad)" strokeWidth="3" fill="none" opacity="0.4" />
          <Path
            d="M50 18 L76 34 L76 66 L50 82 L24 66 L24 34 Z"
            stroke="url(#logoGrad)"
            strokeWidth="3.5"
            fill="none"
          />
          <Path
            d="M50 32 L66 42 L66 58 L50 68 L34 58 L34 42 Z"
            fill="url(#logoGrad)"
            opacity="0.85"
          />
          <Circle cx="50" cy="50" r="6" fill="#FFF" />
        </Svg>
      </View>

      <Text style={styles.brandTitle}>SmartEvolve <Text style={styles.brandAccent}>AI</Text></Text>
      <Text style={styles.tagline}>Evolve Your Skills. Shape Your Future.</Text>

      <View style={styles.loaderWrap}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  logoWrap: {
    marginBottom: spacing.lg,
  },
  brandTitle: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  brandAccent: {
    color: colors.accent,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: spacing.xs,
    letterSpacing: 0.2,
    textAlign: "center",
  },
  loaderWrap: {
    marginTop: spacing.xxl,
  },
});
