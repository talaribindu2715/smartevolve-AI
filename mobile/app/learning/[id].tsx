import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../src/api/client";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { Button } from "../../src/components/Button";
import { YouTubePlayer } from "../../src/components/YouTubePlayer";
import { colors, radius, spacing } from "../../src/theme/colors";

export default function LearningScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

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
        progressPercentage: status === "COMPLETED" ? 100 : 50,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learningResource", id] });
      queryClient.invalidateQueries({ queryKey: ["activeRoadmap"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      Alert.alert(
        "Progress Recorded",
        "Your module completion has been recorded. Pre-requisite states on your roadmap have been unlocked!"
      );
    },
    onError: (err: any) => {
      Alert.alert("Error", err.message || "Failed to update progress");
    },
  });

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Meta Bar */}
      <View style={styles.topMeta}>
        <Badge label={resource.difficulty} variant="primary" />
        <Badge
          label={resource.progressStatus}
          variant={isCompleted ? "success" : "info"}
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

      {/* Overview Card */}
      <Card style={styles.overviewCard}>
        <Text style={styles.overviewTitle}>Learning Objectives</Text>
        <Text style={styles.description}>{resource.description}</Text>
      </Card>

      {/* Main Lesson Content Body */}
      <View style={styles.contentWrap}>
        <Text style={styles.sectionHeading}>Module Study Material</Text>
        <Card style={styles.bodyCard}>
          <Text style={styles.bodyText}>{resource.contentBody}</Text>
        </Card>
      </View>

      {/* External Reference Link */}
      {resource.externalUrl && (
        <Card style={styles.linkCard}>
          <Text style={styles.linkTitle}>Official Documentation & Specs</Text>
          <Text style={styles.linkUrl}>{resource.externalUrl}</Text>
        </Card>
      )}

      {/* Actions */}
      <View style={styles.actionsWrap}>
        {!isCompleted ? (
          <Button
            title="Mark Module as Completed (100%)"
            onPress={() => updateProgressMutation.mutate("COMPLETED")}
            loading={updateProgressMutation.isPending}
            size="lg"
            variant="primary"
          />
        ) : (
          <View style={styles.completedNotice}>
            <Text style={styles.completedNoticeText}>✓ You have completed this module.</Text>
          </View>
        )}

        {relatedAssessment && (
          <Button
            title={`Take ${relatedAssessment.title}`}
            onPress={() => router.push(`/assessment/${relatedAssessment.id}`)}
            size="lg"
            variant="secondary"
          />
        )}
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
  linkCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
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
  actionsWrap: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  completedNotice: {
    backgroundColor: colors.successBg,
    borderColor: colors.success,
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
