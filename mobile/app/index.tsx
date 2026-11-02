import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { useAuth } from "../src/store/authContext";
import { colors, radius, spacing } from "../src/theme/colors";

export default function LandingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { isAuthenticated, user } = useAuth();
  const isDesktop = width >= 768;

  const navigateToLogin = () => {
    if (isAuthenticated) {
      router.push("/(tabs)");
    } else {
      router.push("/(auth)/login");
    }
  };

  const navigateToRegister = () => {
    if (isAuthenticated) {
      router.push("/(tabs)");
    } else {
      router.push("/(auth)/register");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Navbar */}
        <View style={styles.navbar}>
          <View style={styles.brandGroup}>
            <View style={styles.logoBadge}>
              <Svg width="26" height="26" viewBox="0 0 100 100" fill="none">
                <Defs>
                  <LinearGradient id="landingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={colors.primary} />
                    <Stop offset="50%" stopColor={colors.secondary} />
                    <Stop offset="100%" stopColor={colors.accent} />
                  </LinearGradient>
                </Defs>
                <Circle cx="50" cy="50" r="46" stroke="url(#landingGrad)" strokeWidth="4" fill="none" opacity="0.6" />
                <Path
                  d="M50 20 L74 35 L74 65 L50 80 L26 65 L26 35 Z"
                  stroke="url(#landingGrad)"
                  strokeWidth="4"
                  fill="none"
                />
                <Circle cx="50" cy="50" r="8" fill="#FFF" />
              </Svg>
            </View>
            <Text style={styles.navBrandText}>
              SmartEvolve <Text style={styles.accentText}>AI</Text>
            </Text>
          </View>

          {/* Nav Right CTA */}
          <View style={styles.navActions}>
            {isAuthenticated ? (
              <TouchableOpacity style={styles.dashboardPill} onPress={() => router.push("/(tabs)")}>
                <Text style={styles.dashboardPillText}>
                  Dashboard ({user?.fullName?.split(" ")[0] || "Active"}) →
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity style={styles.signInBtn} onPress={navigateToLogin}>
                  <Text style={styles.signInBtnText}>Sign in</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.createAccountBtn} onPress={navigateToRegister}>
                  <Text style={styles.createAccountBtnText}>Create account</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          {/* Hero Big Headlines */}
          <Text style={[styles.heroHeadline, isDesktop && styles.heroHeadlineDesktop]}>
            One Platform.{"\n"}Every Skill. Every{"\n"}Credential.
          </Text>

          {/* Hero Subtitle */}
          <Text style={[styles.heroSub, isDesktop && styles.heroSubDesktop]}>
            Personalized adaptive learning engineered with attempt-damped proficiency estimation,
            automated Kahn DAG prerequisite roadmaps, and EVM blockchain-anchored tamper-evident credentials.
          </Text>

          {/* Hero Action CTA Buttons */}
          <View style={[styles.ctaRow, isDesktop && styles.ctaRowDesktop]}>
            <TouchableOpacity style={styles.primaryCtaBtn} onPress={navigateToRegister}>
              <Text style={styles.primaryCtaText}>Start Learning Free →</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryCtaBtn} onPress={navigateToLogin}>
              <Text style={styles.secondaryCtaText}>Sign In to Workspace</Text>
            </TouchableOpacity>
          </View>

          {/* Seamless Borderless 8K Fluid AI Showcase (No boxed containers or borders) */}
          <View style={styles.heroImageWrapper}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2560&q=90",
              }}
              style={[styles.hero8kImage, isDesktop && styles.hero8kImageDesktop]}
              resizeMode="cover"
            />
            {/* Ambient Lighting Glow without any borders */}
            <View style={styles.ambientGlowOverlay} />
          </View>
        </View>

        {/* Minimal Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            SmartEvolve AI Platform • K.S.R.M. College of Engineering (Autonomous)
          </Text>
          <Text style={styles.footerSub}>
            Department of Computer Science and Engineering
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070B14",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    width: "100%",
    maxWidth: 1400,
    alignSelf: "center",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: spacing.xl,
  },
  brandGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  navBrandText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  accentText: {
    color: colors.accent,
  },
  navActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  signInBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  signInBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  createAccountBtn: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: radius.full,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  createAccountBtnText: {
    color: "#070B14",
    fontSize: 14,
    fontWeight: "800",
  },
  dashboardPill: {
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    borderColor: colors.primary,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  dashboardPillText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  heroSection: {
    paddingVertical: spacing.lg,
    alignItems: "flex-start",
    width: "100%",
  },
  heroHeadline: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "900",
    lineHeight: 46,
    letterSpacing: -1,
    marginBottom: spacing.md,
  },
  heroHeadlineDesktop: {
    fontSize: 64,
    lineHeight: 72,
    letterSpacing: -2,
  },
  heroSub: {
    color: "#94A3B8",
    fontSize: 16,
    lineHeight: 26,
    maxWidth: 720,
    marginBottom: spacing.xl,
  },
  heroSubDesktop: {
    fontSize: 18,
    lineHeight: 28,
  },
  ctaRow: {
    flexDirection: "column",
    gap: 14,
    width: "100%",
    marginBottom: spacing.xl * 1.5,
  },
  ctaRowDesktop: {
    flexDirection: "row",
    alignItems: "center",
    width: "auto",
  },
  primaryCtaBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: radius.md,
    alignItems: "center",
  },
  primaryCtaText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryCtaBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: radius.md,
    alignItems: "center",
  },
  secondaryCtaText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  // Seamless Borderless 8K Visual Showcase
  heroImageWrapper: {
    width: "100%",
    position: "relative",
    borderRadius: 20,
    overflow: "hidden",
    marginTop: spacing.md,
    // Zero border, zero box styling
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  hero8kImage: {
    width: "100%",
    height: 320,
    borderRadius: 20,
  },
  hero8kImageDesktop: {
    height: 540,
  },
  ambientGlowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  footer: {
    marginTop: spacing.xxl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  footerSub: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: "center",
  },
});
