import React, { useState, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../src/api/client";
import { YouTubePlayer } from "../../src/components/YouTubePlayer";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { Button } from "../../src/components/Button";
import { VideoCard } from "../../src/components/VideoCard";
import { colors, radius, spacing } from "../../src/theme/colors";

const SAVED_VIDEOS_STORAGE_KEY = "smartevolve_saved_videos";

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "quiz" | "related">("overview");
  const [isSaved, setIsSaved] = useState(false);

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

  // Check if video is in saved watchlist
  useEffect(() => {
    if (!video) return;
    AsyncStorage.getItem(SAVED_VIDEOS_STORAGE_KEY).then((val) => {
      if (val) {
        try {
          const list: string[] = JSON.parse(val);
          setIsSaved(list.includes(video.id) || list.includes(video.videoId));
        } catch (_) {}
      }
    });
  }, [video]);

  const toggleSaveForLater = async () => {
    if (!video) return;
    try {
      const val = await AsyncStorage.getItem(SAVED_VIDEOS_STORAGE_KEY);
      let list: string[] = val ? JSON.parse(val) : [];
      const vId = video.id || video.videoId;

      if (isSaved) {
        list = list.filter((item) => item !== vId && item !== video.videoId && item !== video.id);
        setIsSaved(false);
        Alert.alert("Removed from Watchlist", "Video removed from your saved videos.");
      } else {
        if (!list.includes(vId)) list.push(vId);
        setIsSaved(true);
        Alert.alert("Saved for Later", "Video added to your Watchlist.");
      }
      await AsyncStorage.setItem(SAVED_VIDEOS_STORAGE_KEY, JSON.stringify(list));
    } catch (_) {}
  };

  const updateProgressMutation = useMutation({
    mutationFn: (status: "IN_PROGRESS" | "COMPLETED") =>
      api.updateVideoProgress({
        videoId: video?.id,
        youtubeVideoId: video?.videoId,
        watchedSeconds: status === "COMPLETED" ? (video ? video.estimatedMinutes * 60 : 1800) : 900,
        totalSeconds: video ? video.estimatedMinutes * 60 : 1800,
        status,
      }),
    onSuccess: (updated, status) => {
      queryClient.invalidateQueries({ queryKey: ["youtubeVideoDetail", id] });
      queryClient.invalidateQueries({ queryKey: ["youtubeVideos"] });
      queryClient.invalidateQueries({ queryKey: ["recommendedYouTubeVideos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["evolutionHistory"] });
      Alert.alert(
        status === "COMPLETED" ? "🎉 Masterclass Completed!" : "Progress Recorded",
        status === "COMPLETED"
          ? `Your video progress has been recorded and +3.0% proficiency has been added to your ${video?.skillName || "skill"} profile!`
          : "Progress marked as in-progress. Keep watching to unlock mastery."
      );
    },
    onError: (err: any) => {
      Alert.alert("Error", err.message || "Failed to update video watch progress");
    },
  });

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/videos");
    }
  };

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
      <View style={styles.responsiveWrapper}>
        {/* Back Link */}
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backBtnText}>← Return to Video Academy</Text>
        </TouchableOpacity>

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

            {/* Save for later icon button */}
            <TouchableOpacity style={styles.saveBtn} onPress={toggleSaveForLater}>
              <Text style={styles.saveBtnText}>{isSaved ? "★ In Watchlist" : "☆ Save for Later"}</Text>
            </TouchableOpacity>
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
            <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
              <Button
                title="Mark Video as Completed (100%)"
                onPress={() => updateProgressMutation.mutate("COMPLETED")}
                loading={updateProgressMutation.isPending}
                variant="primary"
                size="md"
              />
              <Button
                title="Mark as In Progress (50%)"
                onPress={() => updateProgressMutation.mutate("IN_PROGRESS")}
                loading={updateProgressMutation.isPending}
                variant="outline"
                size="sm"
              />
            </View>
          ) : (
            <View style={styles.completedBanner}>
              <Text style={styles.completedBannerText}>✓ Verified Completed & Profile Calibrated (+3.0%)</Text>
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
  metaHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  topPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
    flexWrap: "wrap",
  },
  durationPill: {
    color: colors.textMuted,
    fontSize: 12,
  },
  saveBtn: {
    marginLeft: "auto",
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  saveBtnText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 4,
  },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  channelText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  viewCountText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  skillTag: {
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  skillTagText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  actionCard: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  actionCardTop: {
    marginBottom: 4,
  },
  actionCardTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  actionCardSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  completedBanner: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.35)",
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  completedBannerText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: "700",
  },
  tabsRow: {
    flexDirection: "row",
    borderBottomColor: colors.cardBorder,
    borderBottomWidth: 1,
    marginBottom: spacing.md,
  },
  tabBtn: {
    paddingVertical: spacing.sm,
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
    fontWeight: "700",
  },
  tabContent: {
    marginBottom: spacing.lg,
  },
  bodyCard: {
    padding: spacing.md,
  },
  bodyCardHeading: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  bodyDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  keyPointsBox: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: radius.sm,
    gap: 4,
  },
  keyPointsTitle: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  bulletItem: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  quizCard: {
    padding: spacing.md,
    alignItems: "flex-start",
  },
  quizTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 4,
  },
  quizSub: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyCard: {
    padding: spacing.lg,
    alignItems: "center",
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
});
