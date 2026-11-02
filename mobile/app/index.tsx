import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
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
          {/* Top Pill Announcement */}
          <View style={styles.announcementPill}>
            <View style={styles.liveDot} />
            <Text style={styles.announcementText}>
              IEEE Research-Validated • Blockchain Enabled Self-Evolving AI
            </Text>
          </View>

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

          {/* Key Value Proposition Badges */}
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🛡️</Text>
              <Text style={styles.featureTitle}>Attempt-Damped AI</Text>
              <Text style={styles.featureDesc}>
                Limits score inflation by 39% using mathematical damping while preserving genuine progress.
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>⛓️</Text>
              <Text style={styles.featureTitle}>Blockchain Credentials</Text>
              <Text style={styles.featureDesc}>
                Dual-hash Keccak-256 and SHA-256 on-chain minting on EVM networks for instant tamper-evident verification.
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🗺️</Text>
              <Text style={styles.featureTitle}>Kahn DAG Roadmaps</Text>
              <Text style={styles.featureDesc}>
                Automated prerequisite graph resolution ensures you never get blocked by circular dependencies.
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🤖</Text>
              <Text style={styles.featureTitle}>99.04% ML Matcher</Text>
              <Text style={styles.featureDesc}>
                Random Forest & Centroid Cosine engine predicting your exact industry role across 32 skill dimensions.
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
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
    backgroundColor: "#070B14", // Deep rich dark navy background matching Image 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: spacing.xxl,
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
    paddingVertical: spacing.xl,
    alignItems: "flex-start",
  },
  announcementPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    borderColor: "rgba(99, 102, 241, 0.3)",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginBottom: spacing.xl,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  announcementText: {
    color: "#A5B4FC",
    fontSize: 12,
    fontWeight: "700",
  },
  heroHeadline: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "900",
    lineHeight: 48,
    letterSpacing: -1,
    marginBottom: spacing.lg,
  },
  heroHeadlineDesktop: {
    fontSize: 68,
    lineHeight: 76,
    letterSpacing: -2,
  },
  heroSub: {
    color: "#94A3B8",
    fontSize: 16,
    lineHeight: 26,
    maxWidth: 680,
    marginBottom: spacing.xxl,
  },
  heroSubDesktop: {
    fontSize: 18,
    lineHeight: 28,
  },
  ctaRow: {
    flexDirection: "column",
    gap: 14,
    width: "100%",
    marginBottom: spacing.xxl * 1.5,
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
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    width: "100%",
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  featureItem: {
    flex: 1,
    minWidth: 240,
    backgroundColor: "rgba(19, 27, 46, 0.6)",
    borderColor: "rgba(255, 255, 255, 0.07)",
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 10,
  },
  featureTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },
  featureDesc: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 19,
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
