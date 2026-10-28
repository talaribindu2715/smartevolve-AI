import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import Svg, { Path, Circle } from "react-native-svg";
import { api } from "../../src/api/client";
import { VideoCard } from "../../src/components/VideoCard";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { YouTubeVideo } from "../../src/types";
import { colors, radius, spacing } from "../../src/theme/colors";

export default function VideoAcademyScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  // Fetch all videos
  const {
    data: videos,
    isLoading: isVideosLoading,
    refetch: refetchVideos,
    isRefetching,
  } = useQuery({
    queryKey: ["youtubeVideos", selectedSkillId, selectedDifficulty, searchQuery],
    queryFn: () =>
      api.getYouTubeVideos({
        skillId: selectedSkillId || undefined,
        difficulty: selectedDifficulty || undefined,
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

  const completedCount = useMemo(() => {
    return (videos || []).filter((v) => v.watchStatus === "COMPLETED").length;
  }, [videos]);

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
            label={`${completedCount} Completed`}
            variant="success"
          />
        </View>

        <Text style={styles.title}>Interactive Video Masterclasses</Text>
        <Text style={styles.subtitle}>
          Curated industry tutorials mapped directly to your career roadmap and skill proficiencies.
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchBarWrap}>
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="2">
          <Circle cx="11" cy="11" r="8" />
          <Path d="M21 21l-4.35-4.35" />
        </Svg>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Python, React Native, Spring Boot, AI..."
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

      {/* Skills Category Filter Pills */}
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
      </View>

      {/* AI Recommended Videos Carousel */}
      {!searchQuery && recommendedVideos && recommendedVideos.length > 0 && (
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
              <View key={video.id} style={{ width: 260, marginRight: spacing.md }}>
                <VideoCard video={video} onPress={handleVideoPress} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Main Video Library Feed */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            {selectedSkillId ? "Filtered Lessons" : "All Educational Video Courses"}
          </Text>
          <Text style={styles.videoCountText}>
            {videos?.length || 0} masterclasses available
          </Text>
        </View>

        {isVideosLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Fetching YouTube Masterclasses...</Text>
          </View>
        ) : !videos || videos.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No video tutorials found</Text>
            <Text style={styles.emptySub}>
              Try searching for different keywords or reset your topic filters.
            </Text>
          </Card>
        ) : (
          videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onPress={handleVideoPress}
            />
          ))
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
  header: {
    marginBottom: spacing.md,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  youtubeBrandBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  youtubeBrandText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 5,
    letterSpacing: 0.5,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
    marginTop: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  searchBarWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    marginLeft: spacing.sm,
  },
  clearBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    paddingHorizontal: spacing.xs,
  },
  filtersSection: {
    marginBottom: spacing.lg,
  },
  filterPillsScroll: {
    paddingRight: spacing.md,
  },
  filterPill: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 1,
    borderRadius: radius.full,
    marginRight: spacing.sm,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  filterPillTextActive: {
    color: "#FFFFFF",
  },
  sectionWrap: {
    marginBottom: spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  videoCountText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  horizontalScrollList: {
    paddingRight: spacing.md,
  },
  loadingBox: {
    padding: spacing.xl,
    alignItems: "center",
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.sm,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  emptySub: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
  },
});
