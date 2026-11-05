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
            {isDesktop && !isAuthenticated ? (
              <View style={styles.authButtonsRow}>
                <TouchableOpacity style={styles.primaryCtaBtn} onPress={navigateToRegister}>
                  <Text style={styles.primaryCtaText}>Start Learning Free →</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryCtaBtn} onPress={navigateToLogin}>
                  <Text style={styles.secondaryCtaText}>Sign In to Workspace</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>

        {/* Hero Section */}
        <View style={[styles.heroSection, isDesktop && styles.heroSectionDesktop]}>
          <View style={[styles.heroLeftCol, isDesktop && styles.heroLeftColDesktop]}>
            <Text style={[styles.heroHeadline, isDesktop && styles.heroHeadlineDesktop]}>
              One Platform.{"\n"}Every Skill. Every{"\n"}Credential.
            </Text>
          </View>

          {/* Golden Blockchain & AI Gear Image */}
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

          {/* Hyperlink Actions Just Below the Image (Exchanged Positions) */}
          {(!isAuthenticated || !isDesktop) && (
            <View style={styles.hyperlinkLinksWrap}>
              <TouchableOpacity
                onPress={navigateToLogin}
                activeOpacity={0.7}
                style={styles.hyperlinkItem}
              >
                <Text style={styles.secondaryHyperlinkText}>Sign In to Workspace</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={navigateToRegister}
                activeOpacity={0.7}
                style={styles.hyperlinkItem}
              >
                <Text style={styles.primaryHyperlinkText}>Start Learning Free →</Text>
              </TouchableOpacity>
            </View>
          )}
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
  hyperlinkLinksWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
    gap: 8,
  },
  hyperlinkItem: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryHyperlinkText: {
    color: "#E2E8F0",
    fontSize: 15.5,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  primaryHyperlinkText: {
    color: "#818CF8",
    fontSize: 16.5,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  heroSection: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 44,
    paddingBottom: 36,
    gap: 10,
  },
  heroSectionDesktop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    paddingVertical: 0,
    paddingTop: 0,
    paddingBottom: 0,
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
