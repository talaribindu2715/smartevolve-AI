import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Svg, { Path } from "react-native-svg";
import { api } from "../../src/api/client";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { Button } from "../../src/components/Button";
import { YouTubePlayer } from "../../src/components/YouTubePlayer";
import { Skeleton, CardSkeleton } from "../../src/components/Skeleton";
import { colors, radius, spacing } from "../../src/theme/colors";

export default function LearningScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [completedPracticeTasks, setCompletedPracticeTasks] = useState<Record<string, boolean>>({
    practice_1: false,
    practice_2: false,
    practice_3: false,
  });

  const { data: resource, isLoading } = useQuery({
    queryKey: ["learningResource", id],
    queryFn: () => api.getResourceDetail(id!),
    enabled: !!id,
  });

  const { data: assessments } = useQuery({
    queryKey: ["assessments"],
    queryFn: () => api.getAssessments(),
  });

  const updateProgressMutation = useMutation({
    mutationFn: (status: string) =>
      api.updateProgress({
        resourceId: id!,
        status,
        progressPercentage: status === "COMPLETED" ? 100 : status === "IN_PROGRESS" ? 50 : 0,
      }),
    onSuccess: (data, status) => {
      queryClient.invalidateQueries({ queryKey: ["learningResource", id] });
      queryClient.invalidateQueries({ queryKey: ["activeRoadmap"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["evolutionHistory"] });
      Alert.alert(
        status === "COMPLETED" ? "Milestone Mastered!" : "Progress Recorded",
        status === "COMPLETED"
          ? "Your module completion has been recorded. Pre-requisite states on your roadmap have been unlocked!"
          : "Module marked as in-progress. Keep building momentum!"
      );
    },
    onError: (err: any) => {
      Alert.alert("Error", err.message || "Failed to update progress");
    },
  });

  const togglePracticeTask = (taskId: string) => {
    setCompletedPracticeTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleOpenDocs = (url: string) => {
    if (!url) return;
    Linking.openURL(url).catch((err) => {
      console.warn("Could not open external link:", err);
    });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/(tabs)/learn");
    }
  };

  if (isLoading || !resource) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading Interactive Module...</Text>
      </View>
    );
  }

  // Find corresponding assessment for this skill
  const relatedAssessment = (assessments || []).find(
    (a) => a.skillId === resource.skillId
  );

  const isCompleted = resource.progressStatus === "COMPLETED";
  const isInProgress = resource.progressStatus === "IN_PROGRESS";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.responsiveWrapper}>
        {/* Back Link */}
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backBtnText}>← Return to Roadmap</Text>
        </TouchableOpacity>

        {/* Top Meta Bar */}
        <View style={styles.topMeta}>
          <Badge label={resource.difficulty} variant="primary" />
          <Badge
            label={resource.progressStatus}
            variant={isCompleted ? "success" : isInProgress ? "warning" : "info"}
          />
          <Text style={styles.durationText}>{resource.estimatedMinutes} mins</Text>
        </View>

        <Text style={styles.title}>{resource.title}</Text>
        <Text style={styles.skillTarget}>
          Target Competency: <Text style={{ color: colors.accent }}>{resource.skillName}</Text>
        </Text>

        {/* Embedded YouTube Player if Video module */}
        {(resource.contentType === "VIDEO" ||
          (resource.externalUrl &&
            (resource.externalUrl.includes("youtube.com") ||
              resource.externalUrl.includes("youtu.be")))) && (
          <View style={{ marginVertical: spacing.md }}>
            <YouTubePlayer
              videoIdOrUrl={resource.externalUrl || resource.title}
              title={resource.title}
              autoPlay={false}
            />
          </View>
        )}

        {/* Overview & Objectives Card */}
        <Card style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Learning Objectives</Text>
          <Text style={styles.description}>{resource.description}</Text>
        </Card>

        {/* Conceptual Prerequisites Section */}
        <Card style={styles.prereqCard}>
          <Text style={styles.prereqTitle}>📌 Conceptual Prerequisites</Text>
          <View style={styles.prereqList}>
            <Text style={styles.prereqItem}>• Foundational knowledge of {resource.skillName || "core engineering concepts"}</Text>
            <Text style={styles.prereqItem}>• Basic familiarity with modern developer tools and syntax structures</Text>
            <Text style={styles.prereqItem}>• Completion of introductory precursor modules in your active roadmap</Text>
          </View>
        </Card>

        {/* Main Lesson Content Body */}
        <View style={styles.contentWrap}>
          <Text style={styles.sectionHeading}>Module Study Material</Text>
          <Card style={styles.bodyCard}>
            <Text style={styles.bodyText}>{resource.contentBody}</Text>
          </Card>
        </View>

        {/* Hands-on Practice Tasks Checklist */}
        <Card style={styles.practiceCard}>
          <Text style={styles.practiceHeading}>🛠️ Hands-on Practice Exercises</Text>
          <Text style={styles.practiceSub}>
            Complete these applied tasks to solidify your understanding before taking the assessment:
          </Text>

          <TouchableOpacity
            style={styles.taskItem}
            activeOpacity={0.8}
            onPress={() => togglePracticeTask("practice_1")}
          >
            <View style={[styles.checkbox, completedPracticeTasks.practice_1 && styles.checkboxDone]}>
              {completedPracticeTasks.practice_1 && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.taskText, completedPracticeTasks.practice_1 && styles.taskTextDone]}>
              Replicate the code examples in your local development environment
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.taskItem}
            activeOpacity={0.8}
            onPress={() => togglePracticeTask("practice_2")}
          >
            <View style={[styles.checkbox, completedPracticeTasks.practice_2 && styles.checkboxDone]}>
              {completedPracticeTasks.practice_2 && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.taskText, completedPracticeTasks.practice_2 && styles.taskTextDone]}>
              Implement error handling and edge-case testing for core functions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.taskItem}
            activeOpacity={0.8}
            onPress={() => togglePracticeTask("practice_3")}
          >
            <View style={[styles.checkbox, completedPracticeTasks.practice_3 && styles.checkboxDone]}>
              {completedPracticeTasks.practice_3 && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.taskText, completedPracticeTasks.practice_3 && styles.taskTextDone]}>
              Document key architectural trade-offs in your personal learning log
            </Text>
          </TouchableOpacity>
        </Card>

        {/* External Reference Link */}
        {resource.externalUrl && (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => handleOpenDocs(resource.externalUrl!)}
          >
            <Card style={styles.linkCard}>
              <View style={styles.linkRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.linkTitle}>Official Documentation & Specs</Text>
                  <Text style={styles.linkUrl} numberOfLines={1}>{resource.externalUrl}</Text>
                </View>
                <Text style={styles.linkArrow}>↗</Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}

        {/* Actions Bar */}
        <View style={styles.actionsWrap}>
          {!isCompleted ? (
            <View style={{ gap: spacing.sm }}>
              {!isInProgress && (
                <Button
                  title="Mark as In Progress"
                  onPress={() => updateProgressMutation.mutate("IN_PROGRESS")}
                  loading={updateProgressMutation.isPending}
                  variant="outline"
                  size="md"
                />
              )}
              <Button
                title="Mark Module as Completed (100%)"
                onPress={() => updateProgressMutation.mutate("COMPLETED")}
                loading={updateProgressMutation.isPending}
                size="lg"
                variant="primary"
              />
            </View>
          ) : (
            <View style={styles.completedNotice}>
              <Text style={styles.completedNoticeText}>✓ You have completed this milestone module.</Text>
            </View>
          )}

          {relatedAssessment && (
            <Button
              title={`Take ${relatedAssessment.title} →`}
              onPress={() => router.push(`/assessment/${relatedAssessment.id}`)}
              size="lg"
              variant="secondary"
            />
          )}
        </View>
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
    paddingBottom: spacing.xxl,
  },
  responsiveWrapper: {
    width: "100%",
    maxWidth: 820,
    alignSelf: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  backBtn: {
    marginBottom: spacing.sm,
  },
  backBtnText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  topMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  durationText: {
    color: colors.textMuted,
    fontSize: 12,
    marginLeft: "auto",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  skillTarget: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  overviewCard: {
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  overviewTitle: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  description: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  prereqCard: {
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    borderColor: "rgba(99, 102, 241, 0.25)",
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  prereqTitle: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  prereqList: {
    gap: 4,
  },
  prereqItem: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  contentWrap: {
    marginBottom: spacing.md,
  },
  sectionHeading: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  bodyCard: {
    padding: spacing.md,
  },
  bodyText: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  practiceCard: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  practiceHeading: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  practiceSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
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
    color: colors.textPrimary,
    fontSize: 13,
    flex: 1,
  },
  taskTextDone: {
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
  linkCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  linkTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  linkUrl: {
    color: colors.accent,
    fontSize: 13,
  },
  linkArrow: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: "700",
    marginLeft: spacing.sm,
  },
  actionsWrap: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  completedNotice: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.35)",
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
  },
  completedNoticeText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: "700",
  },
});
