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
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { useAuth } from "../src/store/authContext";
import { colors, radius, spacing } from "../src/theme/colors";

export default function LandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  // Emblem image dynamically sized: ~290px on mobile, 440px on desktop
  const gearImageSize = isDesktop ? 440 : Math.min(Math.round(width * 0.74), 310);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
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

          {/* Top Right Actions */}
          <View style={styles.navActions}>
            {isAuthenticated ? (
              <TouchableOpacity style={styles.dashboardPill} onPress={() => router.push("/(tabs)")}>
                <Text style={styles.dashboardPillText}>
                  Dashboard ({user?.fullName?.split(" ")[0] || "Active"}) →
                </Text>
              </TouchableOpacity>
            ) : isDesktop ? (
              <View style={styles.authButtonsRow}>
                <TouchableOpacity style={styles.primaryCtaBtn} onPress={navigateToRegister}>
                  <Text style={styles.primaryCtaText}>Start Learning Free →</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryCtaBtn} onPress={navigateToLogin}>
                  <Text style={styles.secondaryCtaText}>Sign In to Workspace</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.mobileNavSignInBtn} onPress={navigateToLogin}>
                <Text style={styles.mobileNavSignInText}>Sign In</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Hero Section */}
        <View style={[styles.heroSection, isDesktop && styles.heroSectionDesktop]}>
          <View style={[styles.heroLeftCol, isDesktop && styles.heroLeftColDesktop]}>
            <Text style={[styles.heroHeadline, isDesktop && styles.heroHeadlineDesktop]}>
              One Platform.{"\n"}Every Skill. Every{"\n"}Credential.
            </Text>

            {/* Mobile Hero Actions - Beautifully centered and aligned */}
            {!isDesktop && !isAuthenticated && (
              <View style={styles.mobileHeroActions}>
                <TouchableOpacity style={styles.heroPrimaryBtn} onPress={navigateToRegister}>
                  <Text style={styles.heroPrimaryBtnText}>Start Learning Free →</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.heroSecondaryBtn} onPress={navigateToLogin}>
                  <Text style={styles.heroSecondaryBtnText}>Sign In to Workspace</Text>
                </TouchableOpacity>
              </View>
            )}
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
    width: "100%",
    maxWidth: 1400,
    alignSelf: "center",
    justifyContent: "flex-start",
  },
  contentWrapperDesktop: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    justifyContent: "space-between",
    flex: 1,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 12,
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
    flexWrap: "wrap",
  },
  primaryCtaBtn: {
    backgroundColor: "#6366F1",
    paddingVertical: 10,
    paddingHorizontal: 16,
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
    fontSize: 13,
    fontWeight: "800",
  },
  secondaryCtaBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderColor: "rgba(255, 255, 255, 0.22)",
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryCtaText: {
    color: "#FFFFFF",
    fontSize: 13,
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
  mobileNavSignInBtn: {
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    borderColor: "rgba(99, 102, 241, 0.4)",
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  mobileNavSignInText: {
    color: "#818CF8",
    fontSize: 13,
    fontWeight: "700",
  },
  mobileHeroActions: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    marginBottom: 8,
  },
  heroPrimaryBtn: {
    backgroundColor: "#6366F1",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  heroPrimaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  heroSecondaryBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    width: "100%",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  heroSecondaryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  heroSection: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 4,
    paddingBottom: spacing.sm,
    gap: 8,
  },
  heroSectionDesktop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    paddingVertical: 0,
    gap: 0,
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
  heroHeadline: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 42,
    letterSpacing: -1,
    textAlign: "center",
    marginTop: 2,
    marginBottom: 4,
  },
  heroHeadlineDesktop: {
    fontSize: 72,
    lineHeight: 80,
    letterSpacing: -2.5,
    textAlign: "left",
    marginBottom: spacing.lg,
  },
  heroImageContainer: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 4,
  },
  heroImageContainerDesktop: {
    flex: 1.1,
    maxWidth: 580,
    marginTop: 0,
  },
});
