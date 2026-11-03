import React from "react";
import {
  View,
  Text,
  StyleSheet,
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
  const { isAuthenticated, isLoading, user } = useAuth();
  const isDesktop = width >= 768;

  React.useEffect(() => {
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

        {/* Hero Section: Centered & Non-Scrollable */}
        <View style={[styles.heroSection, isDesktop && styles.heroSectionDesktop]}>
          <View style={styles.heroLeftCol}>
            <Text style={[styles.heroHeadline, isDesktop && styles.heroHeadlineDesktop]}>
              One Platform.{"\n"}Every Skill. Every{"\n"}Credential.
            </Text>

          </View>

          {/* Right Column: Golden Blockchain & AI Gear Image */}
          <View style={[styles.heroImageContainer, isDesktop && styles.heroImageContainerDesktop]}>
            <Image
              source={require("../assets/golden-blockchain-gear.png")}
              style={[
                styles.goldenGearImage,
                isDesktop ? styles.goldenGearImageDesktop : styles.goldenGearImageMobile,
              ]}
              resizeMode="contain"
            />
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
  heroSectionDesktop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: spacing.xl,
  },
  heroLeftCol: {
    flex: 1,
    maxWidth: 620,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  heroImageContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginTop: spacing.md,
  },
  heroImageContainerDesktop: {
    flex: 1.1,
    maxWidth: 580,
    marginTop: 0,
  },
  goldenGearImage: {
    backgroundColor: "transparent",
  },
  goldenGearImageDesktop: {
    width: 440,
    height: 440,
  },
  goldenGearImageMobile: {
    width: 280,
    height: 280,
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
});