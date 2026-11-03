import React from "react";
import {
  View,
  Text,
  StyleSheet,
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
      <View style={styles.contentWrapper}>
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

          {/* Top Right Actions */}
          <View style={styles.navActions}>
            {isAuthenticated ? (
              <TouchableOpacity style={styles.dashboardPill} onPress={() => router.push("/(tabs)")}>
                <Text style={styles.dashboardPillText}>
                  Dashboard ({user?.fullName?.split(" ")[0] || "Active"}) →
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.authButtonsRow}>
                <TouchableOpacity style={styles.primaryCtaBtn} onPress={navigateToRegister}>
                  <Text style={styles.primaryCtaText}>Start Learning Free →</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryCtaBtn} onPress={navigateToLogin}>
                  <Text style={styles.secondaryCtaText}>Sign In to Workspace</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Hero Section: Two-Column Responsive with Large SmartEvolve AI Symbol filling the gap */}
        <View style={[styles.heroSection, isDesktop && styles.heroSectionDesktop]}>
          <View style={styles.heroLeftCol}>

            <Text style={[styles.heroHeadline, isDesktop && styles.heroHeadlineDesktop]}>
              One Platform.{"\n"}Every Skill. Every{"\n"}Credential.
            </Text>

            <View style={styles.heroCtaRow}>
              <TouchableOpacity style={styles.heroPrimaryBtn} onPress={navigateToRegister}>
                <Text style={styles.heroPrimaryBtnText}>Explore Skills & Masterclasses →</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroSecondaryBtn} onPress={navigateToLogin}>
                <Text style={styles.heroSecondaryBtnText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Right Column: Prominent Glowing SmartEvolve AI Emblem */}
          <View style={[styles.heroSymbolContainer, isDesktop && styles.heroSymbolContainerDesktop]}>
            <View style={styles.symbolGlowOrb} />
            <Svg width={isDesktop ? 340 : 220} height={isDesktop ? 340 : 220} viewBox="0 0 100 100" fill="none">
              <Defs>
                <LinearGradient id="heroBigGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#6366F1" />
                  <Stop offset="50%" stopColor="#A855F7" />
                  <Stop offset="100%" stopColor="#10B981" />
                </LinearGradient>
                <LinearGradient id="heroInnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="rgba(99, 102, 241, 0.25)" />
                  <Stop offset="100%" stopColor="rgba(16, 185, 129, 0.08)" />
                </LinearGradient>
              </Defs>
              {/* Outer Dashed Orbit */}
              <Circle
                cx="50"
                cy="50"
                r="47"
                stroke="url(#heroBigGrad)"
                strokeWidth="1.8"
                strokeDasharray="4 4"
                opacity="0.5"
              />
              {/* Solid Perimeter Ring */}
              <Circle
                cx="50"
                cy="50"
                r="42"
                stroke="url(#heroBigGrad)"
                strokeWidth="3.5"
                fill="none"
                opacity="0.85"
              />
              {/* Hexagonal Lattice with Gradient Fill */}
              <Path
                d="M50 18 L78 34 L78 66 L50 82 L22 66 L22 34 Z"
                stroke="url(#heroBigGrad)"
                strokeWidth="3.5"
                fill="url(#heroInnerGrad)"
              />
              {/* Internal Convergence Edges */}
              <Path d="M50 18 L50 50" stroke="#FFFFFF" strokeWidth="2" opacity="0.75" />
              <Path d="M22 34 L50 50" stroke="#FFFFFF" strokeWidth="2" opacity="0.75" />
              <Path d="M78 34 L50 50" stroke="#FFFFFF" strokeWidth="2" opacity="0.75" />
              <Path d="M50 50 L50 82" stroke="#FFFFFF" strokeWidth="2" opacity="0.75" />
              <Path d="M22 66 L50 50" stroke="#FFFFFF" strokeWidth="2" opacity="0.75" />
              <Path d="M78 66 L50 50" stroke="#FFFFFF" strokeWidth="2" opacity="0.75" />
              {/* Glowing Quantum Core */}
              <Circle cx="50" cy="50" r="10" fill="#FFFFFF" />
              <Circle cx="50" cy="50" r="5.5" fill="#6366F1" />
              {/* Vertex Nodes */}
              <Circle cx="50" cy="18" r="3.5" fill="#10B981" />
              <Circle cx="78" cy="34" r="3.5" fill="#A855F7" />
              <Circle cx="78" cy="66" r="3.5" fill="#6366F1" />
              <Circle cx="50" cy="82" r="3.5" fill="#10B981" />
              <Circle cx="22" cy="66" r="3.5" fill="#A855F7" />
              <Circle cx="22" cy="34" r="3.5" fill="#6366F1" />
            </Svg>

            {/* Floating Tech Chips */}
            <View style={styles.floatingBadgeTop}>
              <Text style={styles.floatingBadgeText}>🧠 AI Adaptive DAG</Text>
            </View>
            <View style={styles.floatingBadgeBottom}>
              <Text style={styles.floatingBadgeText}>🔗 Verifiable On-Chain</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    backgroundColor: "#070B14",
    overflow: "hidden", // Completely eliminates scrolling
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    width: "100%",
    maxWidth: 1400,
    alignSelf: "center",
    justifyContent: "space-between",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
    flexWrap: "wrap",
    gap: spacing.md,
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
    gap: 12,
    flexWrap: "wrap",
  },
  primaryCtaBtn: {
    backgroundColor: "#6366F1",
    paddingVertical: 10,
    paddingHorizontal: 20,
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
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderColor: "rgba(255, 255, 255, 0.22)",
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 18,
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
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    width: "100%",
    paddingBottom: spacing.xxl,
  },
  heroHeadline: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    lineHeight: 50,
    letterSpacing: -1.5,
    marginBottom: spacing.lg,
  },
  heroHeadlineDesktop: {
    fontSize: 72,
    lineHeight: 80,
    letterSpacing: -2.5,
  },
  heroSub: {
    color: "#94A3B8",
    fontSize: 18,
    lineHeight: 30,
    maxWidth: 780,
  },
  heroSubDesktop: {
    fontSize: 20,
    lineHeight: 32,
  },
  heroSectionDesktop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: spacing.xl,
  },
  heroLeftCol: {
    flex: 1,
    maxWidth: 680,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  heroCtaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    marginTop: spacing.sm,
  },
  heroPrimaryBtn: {
    backgroundColor: "#6366F1",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  heroPrimaryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  heroSecondaryBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  heroSecondaryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  heroSymbolContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginTop: spacing.lg,
  },
  heroSymbolContainerDesktop: {
    flex: 1,
    maxWidth: 480,
    marginTop: 0,
  },
  symbolGlowOrb: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
  },
  floatingBadgeTop: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(15, 23, 42, 0.88)",
    borderColor: "rgba(99, 102, 241, 0.35)",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  floatingBadgeBottom: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(15, 23, 42, 0.88)",
    borderColor: "rgba(16, 185, 129, 0.35)",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  floatingBadgeText: {
    color: "#F8FAFC",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});