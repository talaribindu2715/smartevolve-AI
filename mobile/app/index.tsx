import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Image,
  ScrollView,
  Animated,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { useAuth } from "../src/store/authContext";
import { colors, radius, spacing } from "../src/theme/colors";

export default function LandingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { isAuthenticated, isLoading, user } = useAuth();
  const isDesktop = width >= 768;

  // Golden Gear smooth pulse & floating animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 2600,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: -8,
            duration: 2600,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 2600,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2600,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulseAnim, floatAnim]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading]);

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

  // Image size dynamically scaled: on mobile ~290px (up to 75% of screen width), on desktop 440px
  const gearImageSize = isDesktop ? 440 : Math.min(Math.round(width * 0.74), 310);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.contentWrapper, isDesktop && styles.contentWrapperDesktop]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
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

          {/* Top Right Navbar Actions */}
          <View style={styles.navActions}>
            {isAuthenticated ? (
              <TouchableOpacity style={styles.dashboardPill} onPress={() => router.push("/(tabs)")}>
                <Text style={styles.dashboardPillText}>
                  Dashboard ({user?.fullName?.split(" ")[0] || "Active"}) →
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.authButtonsRow}>
                {isDesktop && (
                  <TouchableOpacity style={styles.primaryCtaBtn} onPress={navigateToRegister}>
                    <Text style={styles.primaryCtaText}>Start Learning Free →</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.secondaryCtaBtn} onPress={navigateToLogin}>
                  <Text style={styles.secondaryCtaText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Hero Section */}
        <View style={[styles.heroSection, isDesktop && styles.heroSectionDesktop]}>
          {/* Left Column: Headlines & CTA */}
          <View style={[styles.heroLeftCol, isDesktop && styles.heroLeftColDesktop]}>
            <View style={styles.pillBadge}>
              <Text style={styles.pillBadgeDot}>●</Text>
              <Text style={styles.pillBadgeText}>AI-Powered Learning & Blockchain Credentials</Text>
            </View>

            <Text style={[styles.heroHeadline, isDesktop && styles.heroHeadlineDesktop]}>
              One Platform.{"\n"}Every Skill. Every{"\n"}Credential.
            </Text>

            <Text style={[styles.heroSub, isDesktop && styles.heroSubDesktop]}>
              Adaptive competency mapping with real-time AI progression, automated prerequisite roadmaps, and EVM on-chain tamper-evident certificates.
            </Text>

            {/* Hero Action Buttons */}
            <View style={[styles.heroCtaRow, isDesktop ? styles.heroCtaRowDesktop : styles.heroCtaRowMobile]}>
              <TouchableOpacity
                style={[styles.heroPrimaryBtn, !isDesktop && styles.fullWidthBtn]}
                onPress={navigateToRegister}
                activeOpacity={0.88}
              >
                <Text style={styles.heroPrimaryBtnText}>Start Learning Free →</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.heroSecondaryBtn, !isDesktop && styles.fullWidthBtn]}
                onPress={navigateToLogin}
                activeOpacity={0.85}
              >
                <Text style={styles.heroSecondaryBtnText}>Sign In to Workspace</Text>
              </TouchableOpacity>
            </View>

            {/* Feature Highlights Pills */}
            <View style={[styles.featuresRow, !isDesktop && styles.featuresRowMobile]}>
              <View style={styles.featureChip}>
                <Text style={styles.featureChipIcon}>⚡</Text>
                <Text style={styles.featureChipText}>Adaptive AI</Text>
              </View>
              <View style={styles.featureChip}>
                <Text style={styles.featureChipIcon}>📜</Text>
                <Text style={styles.featureChipText}>EVM Verified</Text>
              </View>
              <View style={styles.featureChip}>
                <Text style={styles.featureChipIcon}>🎯</Text>
                <Text style={styles.featureChipText}>Kahn DAG</Text>
              </View>
            </View>
          </View>

          {/* Right Column: Golden Blockchain & AI Gear Image */}
          <View style={[styles.heroImageContainer, isDesktop && styles.heroImageContainerDesktop]}>
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim }, { translateY: floatAnim }],
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={require("../assets/golden-blockchain-gear.png")}
                style={{
                  width: gearImageSize,
                  height: gearImageSize,
                  backgroundColor: "transparent",
                }}
                resizeMode="contain"
              />
            </Animated.View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>SmartEvolve AI • Enterprise Adaptive Learning Architecture</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    backgroundColor: "#070B14",
  },
  contentWrapper: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    width: "100%",
    maxWidth: 1400,
    alignSelf: "center",
    justifyContent: "space-between",
  },
  contentWrapperDesktop: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    flex: 1,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
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
  },
  authButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  primaryCtaBtn: {
    backgroundColor: "#6366F1",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryCtaText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryCtaBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderColor: "rgba(255, 255, 255, 0.22)",
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryCtaText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
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
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  heroSectionDesktop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    paddingVertical: spacing.md,
    gap: spacing.xl,
  },
  heroLeftCol: {
    width: "100%",
    maxWidth: 620,
    alignItems: "center",
    justifyContent: "center",
  },
  heroLeftColDesktop: {
    flex: 1,
    alignItems: "flex-start",
  },
  pillBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    borderColor: "rgba(99, 102, 241, 0.3)",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  pillBadgeDot: {
    color: colors.success,
    fontSize: 10,
  },
  pillBadgeText: {
    color: "#A5B4FC",
    fontSize: 12,
    fontWeight: "700",
  },
  heroHeadline: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "900",
    lineHeight: 46,
    letterSpacing: -1,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  heroHeadlineDesktop: {
    fontSize: 68,
    lineHeight: 76,
    letterSpacing: -2,
    textAlign: "left",
    marginBottom: spacing.md,
  },
  heroSub: {
    color: "#94A3B8",
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 580,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  heroSubDesktop: {
    fontSize: 17,
    lineHeight: 28,
    textAlign: "left",
    marginBottom: spacing.xl,
  },
  heroCtaRow: {
    gap: 12,
    width: "100%",
    marginBottom: spacing.md,
  },
  heroCtaRowMobile: {
    flexDirection: "column",
    alignItems: "center",
    maxWidth: 380,
  },
  heroCtaRowDesktop: {
    flexDirection: "row",
    alignItems: "center",
  },
  fullWidthBtn: {
    width: "100%",
  },
  heroPrimaryBtn: {
    backgroundColor: "#6366F1",
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  heroPrimaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  heroSecondaryBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  heroSecondaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  featuresRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginTop: spacing.xs,
  },
  featuresRowMobile: {
    justifyContent: "center",
  },
  featureChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  featureChipIcon: {
    fontSize: 12,
  },
  featureChipText: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "600",
  },
  heroImageContainer: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: spacing.sm,
  },
  heroImageContainerDesktop: {
    flex: 1.1,
    maxWidth: 580,
    marginTop: 0,
  },
  footer: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    marginTop: spacing.md,
  },
  footerText: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
});
