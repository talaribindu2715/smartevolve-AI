import React, { useState } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Svg, { Path, Circle } from "react-native-svg";
import { api } from "../../src/api/client";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { Button } from "../../src/components/Button";
import { colors, radius, spacing } from "../../src/theme/colors";
import { RoadmapStep } from "../../src/types";

export default function LearnScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>("ALL");
  const [dailyTasksCompleted, setDailyTasksCompleted] = useState<Record<string, boolean>>({
    task1: true,
    task2: false,
    task3: false,
  });

  const {
    data: roadmap,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["activeRoadmap"],
    queryFn: () => api.getActiveRoadmap(),
  });

  const refreshRoadmapMutation = useMutation({
    mutationFn: (careerId: string) => api.refreshRoadmap(careerId),
    onSuccess: (updatedRoadmap) => {
      queryClient.setQueryData(["activeRoadmap"], updatedRoadmap);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["evolution"] });
      Alert.alert(
        "Roadmap Recalculated",
        "Your adaptive learning roadmap has been re-indexed against your latest skill proficiencies and prerequisite graph."
      );
    },
    onError: (err: any) => {
      Alert.alert("Refresh Failed", err.message || "Failed to recalculate roadmap.");
    },
  });

  const markCompleteMutation = useMutation({
    mutationFn: (resourceId: string) =>
      api.updateProgress({
        resourceId,
        status: "COMPLETED",
        progressPercentage: 100,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeRoadmap"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["evolution"] });
      Alert.alert("Milestone Completed", "Progress recorded and dependent skills unlocked!");
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading Prerequisite Roadmap...</Text>
      </View>
    );
  }

  if (!roadmap || !roadmap.steps || roadmap.steps.length === 0) {
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

  const handleStepPress = (step: RoadmapStep) => {
    if (step.status === "LOCKED") {
      Alert.alert(
        "Module Locked",
        "This learning step has prerequisite dependencies. Complete preceding available modules to unlock this topic."
      );
      return;
    }
    router.push(`/learning/${step.resourceId}`);
  };

  const toggleDailyTask = (taskId: string) => {
    setDailyTasksCompleted((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  // Group steps by Phase
  const phases = [
    { key: "BEGINNER", label: "Phase 1: Foundations", desc: "Core conceptual prerequisites & syntax fundamentals" },
    { key: "INTERMEDIATE", label: "Phase 2: Core Engineering", desc: "Applied architectures, APIs & production patterns" },
    { key: "ADVANCED", label: "Phase 3: Advanced Mastery", desc: "Performance optimization, security & scaling" },
  ];

  const filteredSteps = roadmap.steps.filter((step) => {
    if (selectedPhaseFilter === "ALL") return true;
    const stepPhase = step.phase || (step.difficulty === "ADVANCED" ? "ADVANCED" : step.difficulty === "INTERMEDIATE" ? "INTERMEDIATE" : "BEGINNER");
    return stepPhase === selectedPhaseFilter;
  });

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
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.tagline}>ADAPTIVE LEARNING ROADMAP</Text>
            <Text style={styles.title}>{roadmap.careerName}</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshBtn}
            disabled={refreshRoadmapMutation.isPending}
            onPress={() => refreshRoadmapMutation.mutate(roadmap.careerId)}
          >
            {refreshRoadmapMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.refreshBtnText}>↻ Recalculate</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          {roadmap.completedSteps} of {roadmap.totalSteps} milestones achieved ({roadmap.progressPercentage.toFixed(0)}% complete)
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(100, Math.max(0, roadmap.progressPercentage))}%` },
            ]}
          />
        </View>

        {/* Daily Learning Tasks Checklist */}
        <Card style={styles.dailyTaskCard}>
          <View style={styles.dailyTaskHeader}>
            <Text style={styles.dailyTaskTitle}>🎯 Today's Learning Sprint</Text>
            <Text style={styles.dailyTaskDate}>Daily Habit Tracker</Text>
          </View>

          <TouchableOpacity
            style={styles.taskItem}
            activeOpacity={0.8}
            onPress={() => toggleDailyTask("task1")}
          >
            <View style={[styles.checkbox, dailyTasksCompleted.task1 && styles.checkboxDone]}>
              {dailyTasksCompleted.task1 && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.taskText, dailyTasksCompleted.task1 && styles.taskTextDone]}>
              Review active milestone lesson & run code examples (25 min)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.taskItem}
            activeOpacity={0.8}
            onPress={() => toggleDailyTask("task2")}
          >
            <View style={[styles.checkbox, dailyTasksCompleted.task2 && styles.checkboxDone]}>
              {dailyTasksCompleted.task2 && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.taskText, dailyTasksCompleted.task2 && styles.taskTextDone]}>
              Watch 1 recommended YouTube deep-dive masterclass
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.taskItem}
            activeOpacity={0.8}
            onPress={() => toggleDailyTask("task3")}
          >
            <View style={[styles.checkbox, dailyTasksCompleted.task3 && styles.checkboxDone]}>
              {dailyTasksCompleted.task3 && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.taskText, dailyTasksCompleted.task3 && styles.taskTextDone]}>
              Take skill verification assessment to trigger AI evolution
            </Text>
          </TouchableOpacity>
        </Card>

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
              <Text style={styles.ytBannerSub}>Targeted video masterclasses aligned with your skill gaps</Text>
            </View>
          </View>
          <Text style={styles.ytBannerArrow}>→</Text>
        </TouchableOpacity>

        {/* Learning Phase Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.phaseFilterBar}>
          <TouchableOpacity
            style={[styles.filterChip, selectedPhaseFilter === "ALL" && styles.filterChipActive]}
            onPress={() => setSelectedPhaseFilter("ALL")}
          >
            <Text style={[styles.filterChipText, selectedPhaseFilter === "ALL" && styles.filterChipTextActive]}>
              All Phases ({roadmap.steps.length})
            </Text>
          </TouchableOpacity>
          {phases.map((ph) => {
            const count = roadmap.steps.filter((s) => (s.phase || (s.difficulty === "ADVANCED" ? "ADVANCED" : s.difficulty === "INTERMEDIATE" ? "INTERMEDIATE" : "BEGINNER")) === ph.key).length;
            return (
              <TouchableOpacity
                key={ph.key}
                style={[styles.filterChip, selectedPhaseFilter === ph.key && styles.filterChipActive]}
                onPress={() => setSelectedPhaseFilter(ph.key)}
              >
                <Text style={[styles.filterChipText, selectedPhaseFilter === ph.key && styles.filterChipTextActive]}>
                  {ph.label.split(":")[0]} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Sequence of Steps */}
      <View style={styles.timelineList}>
        {filteredSteps.map((step, idx) => {
          const isCompleted = step.status === "COMPLETED";
          const isAvailable = step.status === "AVAILABLE" || step.status === "IN_PROGRESS";
          const phase = step.phase || (step.difficulty === "ADVANCED" ? "ADVANCED" : step.difficulty === "INTERMEDIATE" ? "INTERMEDIATE" : "BEGINNER");

          return (
            <View key={step.id} style={styles.stepCardWrap}>
              {/* Connector line between steps */}
              {idx < filteredSteps.length - 1 && (
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
                <TouchableOpacity activeOpacity={0.85} onPress={() => handleStepPress(step)}>
                  <View style={styles.cardTop}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      {getStepStatusBadge(step.status)}
                      <Badge label={phase} variant="info" />
                    </View>
                    <Text style={styles.stepDuration}>{step.estimatedMinutes} mins</Text>
                  </View>

                  <Text style={styles.stepTitle}>{step.resourceTitle}</Text>
                  <Text style={styles.stepSkill}>
                    Target Skill: <Text style={{ color: colors.accent, fontWeight: "700" }}>{step.skillName}</Text>
                  </Text>
                  <Text style={styles.stepReason}>{step.reason}</Text>

                  {/* Progress Indicator */}
                  <View style={styles.stepProgressRow}>
                    <Text style={styles.stepProgressLabel}>Milestone Progress</Text>
                    <Text style={styles.stepProgressVal}>{step.progressPercentage ?? (isCompleted ? 100 : 0)}%</Text>
                  </View>
                  <View style={styles.stepProgressBar}>
                    <View
                      style={[
                        styles.stepProgressFill,
                        { width: `${step.progressPercentage ?? (isCompleted ? 100 : 0)}%` },
                      ]}
                    />
                  </View>
                </TouchableOpacity>

                {/* Direct Action Buttons */}
                <View style={styles.cardActionRow}>
                  {isAvailable && (
                    <TouchableOpacity
                      style={styles.actionBtnPrimary}
                      onPress={() => router.push(`/learning/${step.resourceId}`)}
                    >
                      <Text style={styles.actionBtnPrimaryText}>
                        {step.status === "IN_PROGRESS" ? "Continue Lesson" : "Start Learning"}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {isAvailable && !isCompleted && (
                    <TouchableOpacity
                      style={styles.actionBtnSecondary}
                      onPress={() => markCompleteMutation.mutate(step.resourceId)}
                      disabled={markCompleteMutation.isPending}
                    >
                      <Text style={styles.actionBtnSecondaryText}>Mark Completed</Text>
                    </TouchableOpacity>
                  )}

                  {isCompleted && (
                    <View style={styles.completedTagRow}>
                      <Text style={styles.completedTagText}>✓ Mastery Recorded</Text>
                    </View>
                  )}
                </View>
              </Card>
            </View>
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
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  refreshBtn: {
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  refreshBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: radius.full,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: radius.full,
  },
  dailyTaskCard: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderColor: "rgba(99, 102, 241, 0.25)",
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  dailyTaskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  dailyTaskTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  dailyTaskDate: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "600",
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceLight,
  },
  checkboxDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "900",
  },
  taskText: {
    color: colors.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  taskTextDone: {
    textDecorationLine: "line-through",
    color: colors.textMuted,
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
    marginBottom: spacing.md,
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
  phaseFilterBar: {
    flexDirection: "row",
    marginBottom: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
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
    marginBottom: spacing.xs,
  },
  stepProgressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 4,
  },
  stepProgressLabel: {
    color: colors.textMuted,
    fontSize: 11,
  },
  stepProgressVal: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
  },
  stepProgressBar: {
    height: 4,
    backgroundColor: colors.surfaceLight,
    borderRadius: radius.full,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  stepProgressFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: radius.full,
  },
  cardActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopColor: colors.cardBorder,
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.sm,
  },
  actionBtnPrimaryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  actionBtnSecondary: {
    backgroundColor: "transparent",
    borderColor: colors.cardBorder,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.sm,
  },
  actionBtnSecondaryText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  completedTagRow: {
    paddingVertical: 4,
  },
  completedTagText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "700",
  },
});
