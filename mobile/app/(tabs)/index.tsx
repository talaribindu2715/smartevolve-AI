import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import Svg, { Circle, Path, Polygon } from "react-native-svg";
import { api } from "../../src/api/client";
import { Card } from "../../src/components/Card";
import { StatCard } from "../../src/components/StatCard";
import { Badge } from "../../src/components/Badge";
import { Button } from "../../src/components/Button";
import { ProficiencyBar } from "../../src/components/ProficiencyBar";
import { VideoCard } from "../../src/components/VideoCard";
import { colors, radius, spacing } from "../../src/theme/colors";

export default function DashboardScreen() {
  const router = useRouter();

  const {
    data: dashboard,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.getDashboard(),
  });

  const { data: recommendedVideos } = useQuery({
    queryKey: ["recommendedYouTubeVideos"],
    queryFn: () => api.getRecommendedYouTubeVideos(),
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Synthesizing Adaptive AI Dashboard...</Text>
      </View>
    );
  }

  const studentName = dashboard?.studentName || "Student";
  const careerGoal = dashboard?.targetCareerName || "Not Selected";
  const overallProf = dashboard?.overallProficiency || 0;
  const readiness = dashboard?.careerReadinessScore || 0;
  const readinessLevel = dashboard?.readinessLevel || "EARLY_STAGE";

  const getReadinessBadgeVariant = (lvl: string) => {
    switch (lvl) {
      case "READY":
        return "success";
      case "HIGH_POTENTIAL":
        return "info";
      case "DEVELOPING":
        return "warning";
      default:
        return "primary";
    }
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
      {/* Top Welcome Bar */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greetingSub}>SmartEvolve AI Profile</Text>
          <Text style={styles.greetingTitle}>Hello, {studentName} 👋</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/settings")}
          style={styles.settingsBtn}
        >
          <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="2">
            <Circle cx="12" cy="12" r="3" />
            <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Target Career & Readiness Hero Card */}
      <Card style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroGoalLabel}>TARGET CAREER GOAL</Text>
            <Text style={styles.heroCareerName}>{careerGoal}</Text>
          </View>
          <Badge
            label={readinessLevel.replace("_", " ")}
            variant={getReadinessBadgeVariant(readinessLevel)}
          />
        </View>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroMetricCol}>
            <Text style={styles.heroMetricVal}>{readiness.toFixed(0)}%</Text>
            <Text style={styles.heroMetricSub}>Career Readiness</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroMetricCol}>
            <Text style={[styles.heroMetricVal, { color: colors.accent }]}>
              {overallProf.toFixed(0)}%
            </Text>
            <Text style={styles.heroMetricSub}>Overall Proficiency</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroMetricCol}>
            <Text style={[styles.heroMetricVal, { color: colors.blockchain }]}>
              {dashboard?.verifiedCredentials?.length || 0}
            </Text>
            <Text style={styles.heroMetricSub}>On-Chain Badges</Text>
          </View>
        </View>

        <Button
          title={careerGoal === "Not Selected" ? "Choose Career Path" : "View Career Gap Analysis"}
          onPress={() => router.push(dashboard?.targetCareerId ? `/career/${dashboard.targetCareerId}` : "/careers")}
          size="sm"
          style={{ marginTop: spacing.md }}
        />
      </Card>

      {/* Quick Actions Bar */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("/(tabs)/learn")}
        >
          <View style={[styles.qaIconWrap, { backgroundColor: "rgba(99, 102, 241, 0.15)" }]}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2">
              <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </Svg>
          </View>
          <Text style={styles.qaTitle}>Roadmap</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("/(tabs)/careers")}
        >
          <View style={[styles.qaIconWrap, { backgroundColor: "rgba(6, 182, 212, 0.15)" }]}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="2">
              <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </Svg>
          </View>
          <Text style={styles.qaTitle}>Careers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("/(tabs)/evolution")}
        >
          <View style={[styles.qaIconWrap, { backgroundColor: "rgba(139, 92, 246, 0.15)" }]}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.secondary} strokeWidth="2">
              <Path d="M18 20V10M12 20V4M6 20v-6" />
            </Svg>
          </View>
          <Text style={styles.qaTitle}>Evolution</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("/videos")}
        >
          <View style={[styles.qaIconWrap, { backgroundColor: "rgba(239, 68, 68, 0.15)" }]}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="#EF4444">
              <Polygon points="5 3 19 12 5 21 5 3" />
            </Svg>
          </View>
          <Text style={styles.qaTitle}>Videos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("/credentials")}
        >
          <View style={[styles.qaIconWrap, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.blockchain} strokeWidth="2">
              <Path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </Svg>
          </View>
          <Text style={styles.qaTitle}>Credentials</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Active Roadmap Snippet */}
      {dashboard?.activeRoadmap && (
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Learning Roadmap</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/learn")}>
              <Text style={styles.seeAllText}>Open Full Roadmap →</Text>
            </TouchableOpacity>
          </View>

          <Card>
            <View style={styles.roadmapHeaderRow}>
              <View>
                <Text style={styles.roadmapTitle}>{dashboard.activeRoadmap.careerName}</Text>
                <Text style={styles.roadmapSub}>
                  {dashboard.activeRoadmap.completedSteps} of {dashboard.activeRoadmap.totalSteps} steps completed
                </Text>
              </View>
              <Text style={styles.roadmapPct}>
                {dashboard.activeRoadmap.progressPercentage.toFixed(0)}%
              </Text>
            </View>

            {/* Steps Preview */}
            <View style={styles.stepsPreviewWrap}>
              {dashboard.activeRoadmap.steps.slice(0, 3).map((step) => (
                <TouchableOpacity
                  key={step.id}
                  style={styles.stepPreviewItem}
                  onPress={() => router.push(`/learning/${step.resourceId}`)}
                >
                  <View style={styles.stepPreviewLeft}>
                    <Badge
                      label={step.status}
                      variant={
                        step.status === "COMPLETED"
                          ? "success"
                          : step.status === "AVAILABLE"
                          ? "info"
                          : "warning"
                      }
                    />
                    <Text style={styles.stepPreviewTitle} numberOfLines={1}>
                      {step.resourceTitle}
                    </Text>
                  </View>
                  <Text style={styles.stepMinutes}>{step.estimatedMinutes}m</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>
      )}

      {/* AI Recommendations */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI Adaptive Recommendations</Text>
          <Badge label="Auto-Updated" variant="info" />
        </View>

        {dashboard?.recommendations && dashboard.recommendations.length > 0 ? (
          dashboard.recommendations.map((rec) => (
            <Card key={rec.id} style={styles.recCard}>
              <View style={styles.recTop}>
                <Badge
                  label={rec.priority}
                  variant={rec.priority === "CRITICAL" ? "error" : "warning"}
                />
                <Text style={styles.recTime}>{rec.estimatedMinutes} mins</Text>
              </View>
              <Text style={styles.recTitle}>{rec.resourceTitle || rec.skillName}</Text>
              <Text style={styles.recReason}>💡 {rec.reason}</Text>

              {rec.resourceId && (
                <Button
                  title="Start Learning Module"
                  onPress={() => router.push(`/learning/${rec.resourceId}`)}
                  variant="outline"
                  size="sm"
                  style={{ marginTop: spacing.sm }}
                />
              )}
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No pending recommendations</Text>
            <Text style={styles.emptySub}>
              You are currently aligned with your target goals! Take a diagnostic quiz to reveal new growth areas.
            </Text>
          </Card>
        )}
      </View>

      {/* Recommended YouTube Video Masterclasses */}
      {recommendedVideos && recommendedVideos.length > 0 && (
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>YouTube Video Academy</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                Video lessons mapped to your active skill gaps
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/videos")}>
              <Text style={styles.seeAllText}>Explore Academy →</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -spacing.md }}
            contentContainerStyle={{ paddingHorizontal: spacing.md }}
          >
            {recommendedVideos.map((video) => (
              <View key={video.id} style={{ width: 260, marginRight: spacing.md }}>
                <VideoCard
                  video={video}
                  onPress={(v) => router.push(`/videos/${v.id || v.videoId}`)}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Top Skills Proficiency */}
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionTitle}>Demonstrated Skills</Text>
        <Card>
          {dashboard?.topSkills && dashboard.topSkills.length > 0 ? (
            dashboard.topSkills.slice(0, 4).map((s) => (
              <ProficiencyBar
                key={s.id}
                label={s.skillName}
                value={s.proficiency}
                category={s.category}
                evidenceType={s.evidenceType}
              />
            ))
          ) : (
            <Text style={styles.emptySub}>No skill assessments recorded yet. Take an assessment to calibrate your baseline!</Text>
          )}
        </Card>
      </View>

      {/* Blockchain Achievements Snippet */}
      {dashboard?.verifiedCredentials && dashboard.verifiedCredentials.length > 0 && (
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Blockchain Verified Badges</Text>
            <TouchableOpacity onPress={() => router.push("/credentials")}>
              <Text style={styles.seeAllText}>Verify On-Chain →</Text>
            </TouchableOpacity>
          </View>

          {dashboard.verifiedCredentials.map((c) => (
            <Card key={c.id} style={styles.credCard}>
              <View style={styles.credTop}>
                <Text style={styles.credTitle}>{c.achievementTitle}</Text>
                <Badge label="ON-CHAIN" variant="blockchain" />
              </View>
              <Text style={styles.credHash} numberOfLines={1}>
                Tx: {c.transactionHash}
              </Text>
            </Card>
          ))}
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  greetingSub: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  greetingTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderColor: colors.cardBorderActive,
    borderWidth: 1.5,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  heroGoalLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  heroCareerName: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 2,
  },
  heroStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    backgroundColor: "rgba(11, 15, 25, 0.4)",
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
  },
  heroMetricCol: {
    flex: 1,
    alignItems: "center",
  },
  heroMetricVal: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "800",
  },
  heroMetricSub: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  heroDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.cardBorder,
  },
  sectionWrap: {
    marginTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  seeAllText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  quickActionsScroll: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  quickActionCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: spacing.sm,
    alignItems: "center",
    gap: 8,
  },
  qaIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  qaTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  roadmapHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  roadmapTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  roadmapSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  roadmapPct: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: "800",
  },
  stepsPreviewWrap: {
    gap: 8,
    marginTop: 4,
  },
  stepPreviewItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
  },
  stepPreviewLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  stepPreviewTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  stepMinutes: {
    color: colors.textMuted,
    fontSize: 12,
  },
  recCard: {
    marginBottom: spacing.sm,
  },
  recTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  recTime: {
    color: colors.textMuted,
    fontSize: 12,
  },
  recTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  recReason: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  credCard: {
    marginBottom: spacing.xs,
    borderColor: colors.blockchainBorder,
  },
  credTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  credTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  credHash: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  emptyCard: {
    alignItems: "center",
    padding: spacing.lg,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
  },
});
