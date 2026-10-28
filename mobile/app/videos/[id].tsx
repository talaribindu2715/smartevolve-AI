import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Svg, { Path } from "react-native-svg";
import { api } from "../../src/api/client";
import { YouTubePlayer } from "../../src/components/YouTubePlayer";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { Button } from "../../src/components/Button";
import { VideoCard } from "../../src/components/VideoCard";
import { colors, radius, spacing } from "../../src/theme/colors";

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "quiz" | "related">("overview");

  const { data: video, isLoading } = useQuery({
    queryKey: ["youtubeVideoDetail", id],
    queryFn: () => api.getYouTubeVideoDetail(id!),
    enabled: !!id,
  });

  const { data: assessments } = useQuery({
    queryKey: ["assessments"],
    queryFn: () => api.getAssessments(),
  });

  const { data: relatedVideos } = useQuery({
    queryKey: ["relatedVideos", video?.skillId],
    queryFn: () =>
      api.getYouTubeVideos({
        skillId: video?.skillId,
        limit: 4,
      }),
    enabled: !!video?.skillId,
  });

  const updateProgressMutation = useMutation({
    mutationFn: (status: "IN_PROGRESS" | "COMPLETED") =>
      api.updateVideoProgress({
        videoId: video?.id,
        youtubeVideoId: video?.videoId,
        watchedSeconds: video ? video.estimatedMinutes * 60 : 1800,
        totalSeconds: video ? video.estimatedMinutes * 60 : 1800,
        status,
      }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["youtubeVideoDetail", id] });
      queryClient.invalidateQueries({ queryKey: ["youtubeVideos"] });
      queryClient.invalidateQueries({ queryKey: ["recommendedYouTubeVideos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["evolutionHistory"] });
      Alert.alert(
        "🎉 Masterclass Completed!",
        `Your video progress has been recorded and +3.0% proficiency has been added to your ${video?.skillName || "skill"} profile!`
      );
    },
    onError: (err: any) => {
      Alert.alert("Error", err.message || "Failed to update video watch progress");
    },
  });

  if (isLoading || !video) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading YouTube Masterclass...</Text>
      </View>
    );
  }

  const isCompleted = video.watchStatus === "COMPLETED";
  const relatedAssessment = (assessments || []).find(
    (a) => a.skillId === video.skillId
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Embedded YouTube Player */}
      <YouTubePlayer
        videoIdOrUrl={video.videoId}
        title={video.title}
        thumbnailUrl={video.thumbnailUrl}
        autoPlay={true}
      />

      {/* Meta Header */}
      <View style={styles.metaHeader}>
        <View style={styles.topPillsRow}>
          <Badge label={video.difficulty} variant="primary" />
          <Badge
            label={isCompleted ? "COMPLETED (100%)" : video.watchStatus === "IN_PROGRESS" ? "IN PROGRESS" : "NOT STARTED"}
            variant={isCompleted ? "success" : "info"}
          />
          <Text style={styles.durationPill}>⏱ {video.duration || `${video.estimatedMinutes}m`}</Text>
        </View>

        <Text style={styles.title}>{video.title}</Text>

        <View style={styles.channelRow}>
          <Text style={styles.channelText}>📺 {video.channelTitle}</Text>
          {video.viewCount && (
            <Text style={styles.viewCountText}>• {video.viewCount}</Text>
          )}
          {video.skillName && (
            <View style={styles.skillTag}>
              <Text style={styles.skillTagText}>{video.skillName}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Completion Action Card */}
      <Card style={styles.actionCard}>
        <View style={styles.actionCardTop}>
          <View>
            <Text style={styles.actionCardTitle}>Learning Verification</Text>
            <Text style={styles.actionCardSub}>
              {isCompleted
                ? "You have completed this masterclass. Skill proficiency has been calibrated."
                : "Watch the video lesson and mark as completed to advance your skill evolution."}
            </Text>
          </View>
        </View>

        {!isCompleted ? (
          <Button
            title="Mark Video as Completed (100%)"
            onPress={() => updateProgressMutation.mutate("COMPLETED")}
            loading={updateProgressMutation.isPending}
            variant="primary"
            size="md"
            style={{ marginTop: spacing.sm }}
          />
        ) : (
          <View style={styles.completedBanner}>
            <Text style={styles.completedBannerText}>✓ Verified Completed & Profile Calibrated</Text>
          </View>
        )}
      </Card>

      {/* Tabs Row */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "overview" && styles.tabBtnActive]}
          onPress={() => setActiveTab("overview")}
        >
          <Text style={[styles.tabBtnText, activeTab === "overview" && styles.tabBtnTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "quiz" && styles.tabBtnActive]}
          onPress={() => setActiveTab("quiz")}
        >
          <Text style={[styles.tabBtnText, activeTab === "quiz" && styles.tabBtnTextActive]}>
            Skill Quiz {relatedAssessment ? "(Available)" : ""}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "related" && styles.tabBtnActive]}
          onPress={() => setActiveTab("related")}
        >
          <Text style={[styles.tabBtnText, activeTab === "related" && styles.tabBtnTextActive]}>
            Related Videos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <View style={styles.tabContent}>
          <Card style={styles.bodyCard}>
            <Text style={styles.bodyCardHeading}>Masterclass Description</Text>
            <Text style={styles.bodyDescription}>
              {video.description || "In-depth video tutorial covering essential concepts and practical industry implementations."}
            </Text>

            <View style={styles.keyPointsBox}>
              <Text style={styles.keyPointsTitle}>💡 Key Learning Takeaways</Text>
              <Text style={styles.bulletItem}>• Hands-on coding paradigms and syntax mastery.</Text>
              <Text style={styles.bulletItem}>• Production engineering best practices from senior practitioners.</Text>
              <Text style={styles.bulletItem}>• Directly relevant to industry role benchmarks.</Text>
            </View>
          </Card>
        </View>
      )}

      {/* Tab 2: Quiz */}
      {activeTab === "quiz" && (
        <View style={styles.tabContent}>
          {relatedAssessment ? (
            <Card style={styles.quizCard}>
              <Badge label={relatedAssessment.difficulty} variant="warning" />
              <Text style={styles.quizTitle}>{relatedAssessment.title}</Text>
              <Text style={styles.quizSub}>
                Test your understanding after watching this video. Solving diagnostic questions calibrates your mathematical proficiency curve.
              </Text>
              <Button
                title="Take Assessment Now →"
                onPress={() => router.push(`/assessment/${relatedAssessment.id}`)}
                variant="primary"
                size="md"
                style={{ marginTop: spacing.md }}
              />
            </Card>
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Quiz Calibration Coming Soon</Text>
              <Text style={styles.emptySub}>
                Diagnostic quiz for {video.skillName} will be available in the next assessment cycle.
              </Text>
            </Card>
          )}
        </View>
      )}

      {/* Tab 3: Related Videos */}
      {activeTab === "related" && (
        <View style={styles.tabContent}>
          {relatedVideos && relatedVideos.length > 0 ? (
            relatedVideos
              .filter((v) => v.videoId !== video.videoId)
              .map((v) => (
                <VideoCard
                  key={v.id}
                  video={v}
                  layout="horizontal"
                  onPress={(item) => router.push(`/videos/${item.id || item.videoId}`)}
                />
              ))
          ) : (
            <Text style={styles.emptySub}>No additional videos for this skill yet.</Text>
          )}
        </View>
      )}
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
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: spacing.md,
    fontSize: 14,
  },
  metaHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  topPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  durationPill: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 26,
    marginVertical: spacing.xs,
  },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: 2,
  },
  channelText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  viewCountText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  skillTag: {
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  skillTagText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "600",
  },
  actionCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  actionCardTop: {
    marginBottom: spacing.xs,
  },
  actionCardTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  actionCardSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  completedBanner: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    padding: spacing.sm,
    borderRadius: radius.sm,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  completedBannerText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: "600",
  },
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    marginBottom: spacing.md,
  },
  tabBtn: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabBtnActive: {
    borderBottomColor: colors.primary,
  },
  tabBtnText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  tabBtnTextActive: {
    color: colors.primary,
  },
  tabContent: {
    marginTop: spacing.xs,
  },
  bodyCard: {
    padding: spacing.md,
  },
  bodyCardHeading: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  bodyDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  keyPointsBox: {
    marginTop: spacing.md,
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
  },
  keyPointsTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  bulletItem: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  quizCard: {
    padding: spacing.md,
  },
  quizTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  quizSub: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  emptySub: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
  },
});
