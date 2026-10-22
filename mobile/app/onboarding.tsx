import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Rect, Circle } from "react-native-svg";
import { Button } from "../src/components/Button";
import { colors, radius, spacing } from "../src/theme/colors";

const { width } = Dimensions.get("window");

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  icon: (color: string) => React.ReactNode;
}

const slides: Slide[] = [
  {
    id: "1",
    title: "Adaptive Skill Profiling",
    subtitle:
      "Understand your real proficiency with diagnostic evaluations. Your profile evolves dynamically as you learn and prove mastery.",
    accent: colors.primary,
    icon: (c) => (
      <Svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5">
        <Circle cx="12" cy="12" r="9" />
        <Path d="M12 3v18M3 12h18" strokeDasharray="2 2" />
        <Circle cx="12" cy="12" r="4" fill={c} fillOpacity="0.2" />
      </Svg>
    ),
  },
  {
    id: "2",
    title: "AI-Powered Learning Roadmaps",
    subtitle:
      "No redundant tutorials. Our prerequisite-aware AI engine designs a step-by-step roadmap tailored specifically to your target role.",
    accent: colors.accent,
    icon: (c) => (
      <Svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5">
        <Path d="M4 19 L9 14 L14 17 L20 7" />
        <Circle cx="4" cy="19" r="2" fill={c} />
        <Circle cx="9" cy="14" r="2" fill={c} />
        <Circle cx="14" cy="17" r="2" fill={c} />
        <Circle cx="20" cy="7" r="2" fill={c} />
      </Svg>
    ),
  },
  {
    id: "3",
    title: "Intelligent Career Guidance",
    subtitle:
      "Explore 15+ modern software and data roles. Get real-time compatibility scores, skill-gap analysis, and clear next steps.",
    accent: colors.secondary,
    icon: (c) => (
      <Svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5">
        <Rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <Path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </Svg>
    ),
  },
  {
    id: "4",
    title: "Blockchain-Verified Credentials",
    subtitle:
      "Earn tamper-evident academic milestone credentials written directly to Ethereum EVM blockchain. Zero fake claims, verified on-chain.",
    accent: colors.blockchain,
    icon: (c) => (
      <Svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5">
        <Path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </Svg>
    ),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    router.replace("/(auth)/login");
  };

  const currentSlide = slides[currentIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header / Skip */}
        <View style={styles.topBar}>
          <Text style={styles.stepText}>
            {currentIndex + 1} of {slides.length}
          </Text>
          <TouchableOpacity onPress={finishOnboarding} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Center Illustration Card */}
        <View style={styles.contentWrap}>
          <View style={[styles.iconContainer, { borderColor: currentSlide.accent }]}>
            {currentSlide.icon(currentSlide.accent)}
          </View>

          <Text style={styles.title}>{currentSlide.title}</Text>
          <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>
        </View>

        {/* Footer Navigation */}
        <View style={styles.footer}>
          {/* Pagination Dots */}
          <View style={styles.dotsWrap}>
            {slides.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx === currentIndex && [styles.activeDot, { backgroundColor: currentSlide.accent }],
                ]}
              />
            ))}
          </View>

          <Button
            title={currentIndex === slides.length - 1 ? "Get Started" : "Continue"}
            onPress={handleNext}
            size="lg"
            style={{ width: "100%", backgroundColor: currentSlide.accent }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  contentWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: spacing.md,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
  },
  footer: {
    gap: spacing.lg,
    alignItems: "center",
  },
  dotsWrap: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceLight,
  },
  activeDot: {
    width: 24,
  },
});
