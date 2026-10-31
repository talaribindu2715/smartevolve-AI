import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import Svg, { Path, Circle } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../src/api/client";
import { VideoCard } from "../../src/components/VideoCard";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { Skeleton, CardSkeleton } from "../../src/components/Skeleton";
import { ErrorBanner } from "../../src/components/ErrorBanner";
import { YouTubeVideo } from "../../src/types";
import { colors, radius, spacing } from "../../src/theme/colors";

const DIFFICULTIES = ["All Difficulties", "BEGINNER", "INTERMEDIATE", "ADVANCED"];
const SAVED_VIDEOS_STORAGE_KEY = "smartevolve_saved_videos";

export default function VideoAcademyScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All Difficulties");
  const [activeViewTab, setActiveViewTab] = useState<"all" | "continue" | "saved" | "completed">("all");
  const [savedVideoIds, setSavedVideoIds] = useState<string[]>([]);

  // Load saved video IDs from storage
  useEffect(() => {
    AsyncStorage.getItem(SAVED_VIDEOS_STORAGE_KEY).then((val) => {
      if (val) {
        try {
          setSavedVideoIds(JSON.parse(val));
        } catch (_) {}
      }
    });
  }, []);

  // Fetch all videos
  const {
    data: videos,
    isLoading: isVideosLoading,
    isError: isVideosError,
    refetch: refetchVideos,
    isRefetching,
  } = useQuery({
    queryKey: ["youtubeVideos", selectedSkillId, selectedDifficulty, searchQuery],
    queryFn: () =>
      api.getYouTubeVideos({
        skillId: selectedSkillId || undefined,
        difficulty: selectedDifficulty === "All Difficulties" ? undefined : selectedDifficulty,
        query: searchQuery.trim() || undefined,
      }),
  });

  // Fetch AI recommended videos
  const { data: recommendedVideos } = useQuery({
    queryKey: ["recommendedYouTubeVideos"],
    queryFn: () => api.getRecommendedYouTubeVideos(),
  });

  // Fetch skill categories for filter pills
  const { data: skillsSummary } = useQuery({
    queryKey: ["youtubeSkills"],
    queryFn: () => api.getYouTubeSkills(),
  });

  const handleVideoPress = (video: YouTubeVideo) => {
    router.push(`/videos/${video.id || video.videoId}`);
  };

  const inProgressVideos = useMemo(() => {
    return (videos || []).filter((v) => v.watchStatus === "IN_PROGRESS");
  }, [videos]);

  const completedVideos = useMemo(() => {
    return (videos || []).filter((v) => v.watchStatus === "COMPLETED");
  }, [videos]);

  const savedVideos = useMemo(() => {
    return (videos || []).filter(
      (v) => savedVideoIds.includes(v.id) || savedVideoIds.includes(v.videoId)
    );
  }, [videos, savedVideoIds]);

  const displayedVideos = useMemo(() => {
    if (activeViewTab === "continue") return inProgressVideos;
    if (activeViewTab === "completed") return completedVideos;
    if (activeViewTab === "saved") return savedVideos;
    return videos || [];
  }, [activeViewTab, videos, inProgressVideos, completedVideos, savedVideos]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetchVideos}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.responsiveWrapper}>
        {/* Top Banner */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.youtubeBrandBadge}>
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF">
                <Path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </Svg>
              <Text style={styles.youtubeBrandText}>YOUTUBE ACADEMY</Text>
            </View>
            <Badge
              label={`${completedVideos.length} Mastered`}
              variant="success"
            />
          </View>

          <Text style={styles.title}>Interactive Video Masterclasses</Text>
          <Text style={styles.subtitle}>
            Curated industry tutorials mapped directly to your career roadmap and skill gaps. Completing videos updates your skill proficiency and drives AI evolution.
          </Text>
        </View>

        {/* Backend Connectivity Error */}
        {isVideosError && (
          <ErrorBanner
            title="Video Pipeline Sync"
            message="Connecting to the educational video index. If Render is on standby, please tap to reconnect."
            onRetry={refetchVideos}
          />
        )}

        {/* Search Input */}
        <View style={styles.searchBarWrap}>
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="2">
            <Circle cx="11" cy="11" r="8" />
            <Path d="M21 21l-4.35-4.35" />
          </Svg>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Python, React Native, Spring Boot, Solidity..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Library Navigation Tabs */}
        <View style={styles.viewTabsRow}>
          <TouchableOpacity
            style={[styles.viewTab, activeViewTab === "all" && styles.viewTabActive]}
            onPress={() => setActiveViewTab("all")}
          >
            <Text style={[styles.viewTabText, activeViewTab === "all" && styles.viewTabTextActive]}>
              All ({videos?.length || 0})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.viewTab, activeViewTab === "continue" && styles.viewTabActive]}
            onPress={() => setActiveViewTab("continue")}
          >
            <Text style={[styles.viewTabText, activeViewTab === "continue" && styles.viewTabTextActive]}>
              Watching ({inProgressVideos.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.viewTab, activeViewTab === "saved" && styles.viewTabActive]}
            onPress={() => setActiveViewTab("saved")}
          >
            <Text style={[styles.viewTabText, activeViewTab === "saved" && styles.viewTabTextActive]}>
              Watchlist ({savedVideos.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.viewTab, activeViewTab === "completed" && styles.viewTabActive]}
            onPress={() => setActiveViewTab("completed")}
          >
            <Text style={[styles.viewTabText, activeViewTab === "completed" && styles.viewTabTextActive]}>
              Completed ({completedVideos.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Skills Category Filter Pills */}
        {activeViewTab === "all" && (
          <View style={styles.filtersSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsScroll}>
              <TouchableOpacity
                style={[
                  styles.filterPill,
                  selectedSkillId === null && styles.filterPillActive,
                ]}
                onPress={() => setSelectedSkillId(null)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    selectedSkillId === null && styles.filterPillTextActive,
                  ]}
                >
                  All Topics ({videos?.length || 0})
                </Text>
              </TouchableOpacity>

              {(skillsSummary || []).map((skill) => {
                const isSelected = selectedSkillId === skill.skillId;
                return (
                  <TouchableOpacity
                    key={skill.skillId}
                    style={[
                      styles.filterPill,
                      isSelected && styles.filterPillActive,
                    ]}
                    onPress={() => setSelectedSkillId(isSelected ? null : skill.skillId)}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        isSelected && styles.filterPillTextActive,
                      ]}
                    >
                      {skill.skillName} ({skill.videoCount})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Difficulty Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.filterPillsScroll, { marginTop: 8 }]}>
              {DIFFICULTIES.map((diff) => {
                const isSelected = selectedDifficulty === diff;
                return (
                  <TouchableOpacity
                    key={diff}
                    style={[
                      styles.diffPill,
                      isSelected && styles.diffPillActive,
                    ]}
                    onPress={() => setSelectedDifficulty(diff)}
                  >
                    <Text
                      style={[
                        styles.diffPillText,
                        isSelected && styles.diffPillTextActive,
                      ]}
                    >
                      {diff.replace("BEGINNER", "Beginner").replace("INTERMEDIATE", "Intermediate").replace("ADVANCED", "Advanced")}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* AI Recommended Videos Carousel */}
        {activeViewTab === "all" && !searchQuery && recommendedVideos && recommendedVideos.length > 0 && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Targeted For Your Skill Gaps</Text>
                <Text style={styles.sectionSubtitle}>AI recommendations to accelerate your evolution</Text>
              </View>
              <Badge label="AI Personalized" variant="info" />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollList}>
              {recommendedVideos.map((video) => (
                <View key={video.id} style={{ width: 270, marginRight: spacing.md }}>
                  <VideoCard video={video} onPress={handleVideoPress} />
                  {video.recommendationReason && (
                    <View style={styles.reasonCard}>
                      <Text style={styles.reasonCardText} numberOfLines={2}>
                        💡 {video.recommendationReason}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Loading State with Skeletons */}
        {isVideosLoading && (
          <View style={{ marginTop: spacing.md }}>
            <CardSkeleton />
            <CardSkeleton />
          </View>
        )}

        {/* Video Feed */}
        {!isVideosLoading && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                {activeViewTab === "continue"
                  ? "In-Progress Video Lessons"
                  : activeViewTab === "saved"
                  ? "Saved for Later"
                  : activeViewTab === "completed"
                  ? "Mastered Video Courses"
                  : selectedSkillId
                  ? "Filtered Lessons"
                  : "All Educational Video Courses"}
              </Text>
              <Text style={styles.videoCountText}>
                {displayedVideos.length} masterclasses
              </Text>
            </View>

            {displayedVideos.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>
                  {activeViewTab === "saved"
                    ? "Your Watchlist is Empty"
                    : activeViewTab === "continue"
                    ? "No Videos In Progress"
                    : activeViewTab === "completed"
                    ? "No Completed Videos Yet"
                    : "No Videos Found"}
                </Text>
                <Text style={styles.emptySub}>
                  {activeViewTab === "saved"
                    ? "Tap 'Save for Later' on any video to bookmark it here."
                    : "Explore our library of masterclasses to build hands-on competency."}
                </Text>
              </Card>
            ) : (
              <View style={styles.videoGrid}>
                {displayedVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onPress={handleVideoPress}
                    style={{ marginBottom: spacing.md }}
                  />
                ))}
              </View>
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
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  responsiveWrapper: {
    width: "100%",
    maxWidth: 820,
    alignSelf: "center",
  },
  header: {
    marginBottom: spacing.md,
  },
  headerTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  youtubeBrandBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
    gap: 6,
  },
  youtubeBrandText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 6,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  searchBarWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 46,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    marginLeft: spacing.sm,
  },
  clearBtnText: {
    color: colors.textMuted,
    fontSize: 16,
    paddingHorizontal: 4,
  },
  viewTabsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: spacing.md,
  },
  viewTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
  },
  viewTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  viewTabText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  viewTabTextActive: {
    color: "#FFF",
  },
  filtersSection: {
    marginBottom: spacing.md,
  },
  filterPillsScroll: {
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
  },
  filterPillActive: {
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    borderColor: colors.primary,
  },
  filterPillText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  filterPillTextActive: {
    color: colors.primary,
  },
  diffPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  diffPillActive: {
    backgroundColor: colors.surfaceLight,
  },
  diffPillText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  diffPillTextActive: {
    color: colors.accent,
    fontWeight: "700",
  },
  sectionWrap: {
    marginBottom: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  videoCountText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  horizontalScrollList: {
    paddingRight: spacing.md,
  },
  reasonCard: {
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    padding: spacing.xs,
    borderRadius: radius.sm,
    marginTop: 4,
  },
  reasonCardText: {
    color: colors.accent,
    fontSize: 11,
  },
  videoGrid: {
    gap: spacing.sm,
  },
  emptyCard: {
    padding: spacing.xl,
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
