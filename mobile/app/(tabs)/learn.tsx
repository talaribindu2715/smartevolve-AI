import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import Svg, { Path, Circle } from "react-native-svg";
import { api } from "../../src/api/client";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { Button } from "../../src/components/Button";
import { colors, radius, spacing } from "../../src/theme/colors";

export default function LearnScreen() {
  const router = useRouter();

  const {
    data: roadmap,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["activeRoadmap"],
    queryFn: () => api.getActiveRoadmap(),
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading Prerequisite Roadmap...</Text>
      </View>
    );
  }

  if (!roadmap || roadmap.steps.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="1.5">
          <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </Svg>
        <Text style={styles.emptyTitle}>No Active Roadmap</Text>
        <Text style={styles.emptySub}>
          Select a target career role to generate your adaptive, prerequisite-aware learning roadmap.
        </Text>
        <Button
          title="Explore Career Paths"
          onPress={() => router.push("/(tabs)/careers")}
          size="md"
          style={{ marginTop: spacing.md }}
        />
      </View>
    );
  }

  const getStepStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge label="COMPLETED" variant="success" />;
      case "AVAILABLE":
        return <Badge label="AVAILABLE" variant="info" />;
      case "IN_PROGRESS":
        return <Badge label="IN PROGRESS" variant="warning" />;
      default:
        return <Badge label="LOCKED" variant="error" />;
    }
  };

  const handleStepPress = (step: any) => {
    if (step.status === "LOCKED") {
      Alert.alert(
        "Module Locked",
        "This learning step has prerequisite dependencies. Complete preceding available modules to unlock this topic."
      );
      return;
    }
    router.push(`/learning/${step.resourceId}`);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header Info */}
      <View style={styles.header}>
        <Text style={styles.tagline}>PERSONALIZED ADAPTIVE ROADMAP</Text>
        <Text style={styles.title}>{roadmap.careerName}</Text>
        <Text style={styles.subtitle}>
          {roadmap.completedSteps} of {roadmap.totalSteps} steps mastered ({roadmap.progressPercentage.toFixed(0)}%)
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${roadmap.progressPercentage}%` },
            ]}
          />
        </View>

        {/* YouTube Academy Gateway */}
        <TouchableOpacity
          style={styles.youtubeAcademyBanner}
          activeOpacity={0.88}
          onPress={() => router.push("/videos")}
        >
          <View style={styles.ytBannerLeft}>
            <View style={styles.ytIconCircle}>
              <Svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF">
                <Path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ytBannerTitle}>YouTube Video Academy</Text>
              <Text style={styles.ytBannerSub}>Interactive video masterclasses for your skills</Text>
            </View>
          </View>
          <Text style={styles.ytBannerArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Sequence of Steps */}
      <View style={styles.timelineList}>
        {roadmap.steps.map((step, idx) => {
          const isCompleted = step.status === "COMPLETED";
          const isAvailable = step.status === "AVAILABLE" || step.status === "IN_PROGRESS";

          return (
            <TouchableOpacity
              key={step.id}
              activeOpacity={0.85}
              onPress={() => handleStepPress(step)}
              style={styles.stepCardWrap}
            >
              {/* Connector line between steps */}
              {idx < roadmap.steps.length - 1 && (
                <View
                  style={[
                    styles.connectorLine,
                    isCompleted && styles.connectorLineDone,
                  ]}
                />
              )}

              {/* Number circle badge */}
              <View
                style={[
                  styles.seqBadge,
                  isCompleted
                    ? styles.seqBadgeDone
                    : isAvailable
                    ? styles.seqBadgeActive
                    : styles.seqBadgeLocked,
                ]}
              >
                {isCompleted ? (
                  <Text style={styles.seqTextDone}>✓</Text>
                ) : (
                  <Text style={styles.seqText}>{step.sequenceNumber}</Text>
                )}
              </View>

              {/* Step Card */}
              <Card
                style={[
                  styles.cardBody,
                  isAvailable ? styles.cardActiveBorder : undefined,
                  (!isAvailable && !isCompleted) ? styles.cardLockedOpacity : undefined,
                ]}
              >
                <View style={styles.cardTop}>
                  {getStepStatusBadge(step.status)}
                  <Text style={styles.stepDuration}>{step.estimatedMinutes} mins</Text>
                </View>

                <Text style={styles.stepTitle}>{step.resourceTitle}</Text>
                <Text style={styles.stepSkill}>Skill Target: <Text style={{ color: colors.accent }}>{step.skillName}</Text></Text>
                <Text style={styles.stepReason}>{step.reason}</Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.difficultyTag}>Difficulty: {step.difficulty}</Text>
                  {isAvailable && (
                    <Text style={styles.startActionText}>
                      {step.status === "IN_PROGRESS" ? "Resume Lesson →" : "Start Lesson →"}
                    </Text>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    marginTop: spacing.md,
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  header: {
    marginBottom: spacing.lg,
  },
  tagline: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: "800",
    marginTop: 2,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: radius.full,
  },
  timelineList: {
    gap: spacing.md,
  },
  stepCardWrap: {
    flexDirection: "row",
    position: "relative",
  },
  connectorLine: {
    position: "absolute",
    left: 17,
    top: 36,
    bottom: -spacing.md,
    width: 2,
    backgroundColor: colors.cardBorder,
    zIndex: 1,
  },
  connectorLineDone: {
    backgroundColor: colors.success,
  },
  seqBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
    zIndex: 2,
  },
  seqBadgeActive: {
    backgroundColor: colors.primary,
  },
  seqBadgeDone: {
    backgroundColor: colors.success,
  },
  seqBadgeLocked: {
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1.5,
  },
  seqText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  seqTextDone: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
  },
  cardBody: {
    flex: 1,
    padding: spacing.md,
  },
  cardActiveBorder: {
    borderColor: colors.primary,
  },
  cardLockedOpacity: {
    opacity: 0.65,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  stepDuration: {
    color: colors.textMuted,
    fontSize: 12,
  },
  stepTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  stepSkill: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  stepReason: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopColor: colors.cardBorder,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  difficultyTag: {
    color: colors.textMuted,
    fontSize: 11,
    textTransform: "uppercase",
  },
  startActionText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  youtubeAcademyBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  ytBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  ytIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm + 2,
  },
  ytBannerTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  ytBannerSub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  ytBannerArrow: {
    color: "#EF4444",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: spacing.sm,
  },
});
