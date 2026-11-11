import React, { useState, useEffect } from "react";
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
import { Badge } from "../../src/components/Badge";
import { Button } from "../../src/components/Button";
import { ProficiencyBar } from "../../src/components/ProficiencyBar";
import { VideoCard } from "../../src/components/VideoCard";
import { Skeleton, CardSkeleton } from "../../src/components/Skeleton";
import { ErrorBanner } from "../../src/components/ErrorBanner";
import { AiMentorModal } from "../../src/components/AiMentorModal";
import { colors, radius, spacing } from "../../src/theme/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth, STORAGE_KEY_STUDENT_NAME } from "../../src/store/authContext";
import { getStoredEarnedCertificates } from "../../src/services/certificateService";
import { MASTER_VIDEOS } from "../../src/data/masterVideos";

export default function DashboardScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const [storedStudentName, setStoredStudentName] = useState<string | null>(null);
  const [storedTargetCareerName, setStoredTargetCareerName] = useState<string | null>(null);
  const [storedTargetCareerId, setStoredTargetCareerId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY_STUDENT_NAME).then((saved) => {
      if (saved && saved.trim().length > 0 && saved !== "Student" && saved !== "Alex Chen") {
        setStoredStudentName(saved.trim());
      }
    });
    AsyncStorage.getItem("smartevolve_active_target_career_name").then((saved) => {
      if (saved && saved.trim().length > 0) {
        setStoredTargetCareerName(saved.trim());
      }
    });
    AsyncStorage.getItem("smartevolve_active_target_career_id").then((saved) => {
      if (saved && saved.trim().length > 0) {
        setStoredTargetCareerId(saved.trim());
      }
    });
  }, []);
  const [aiMentorVisible, setAiMentorVisible] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isAuthLoading]);

  const {
    data: dashboard,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    refetch: refetchDashboard,
    isRefetching,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.getDashboard(),
  });

  const { data: recommendedVideos, refetch: refetchVideos } = useQuery({
    queryKey: ["recommendedYouTubeVideos"],
    queryFn: () => api.getRecommendedYouTubeVideos(),
  });

  const { data: allVideos } = useQuery({
    queryKey: ["youtubeVideos"],
    queryFn: () => api.getYouTubeVideos(),
  });

  const { data: evolutionHistory } = useQuery({
    queryKey: ["evolutionHistory"],
    queryFn: () => api.getEvolutionHistory(),
  });

  const { data: evolutionTrends } = useQuery({
    queryKey: ["evolutionTrends"],
    queryFn: () => api.getTrends(),
  });

  const { data: storedEarnedCerts } = useQuery({
    queryKey: ["storedEarnedCerts"],
    queryFn: () => getStoredEarnedCertificates(),
  });

  const { data: aiHealth } = useQuery({
    queryKey: ["aiHealth"],
    queryFn: () => api.checkAiHealth(),
    retry: 1,
  });



  const handleRefreshAll = () => {
    refetchDashboard();
    refetchVideos();
  };

  const studentName =
    user?.fullName && user.fullName !== "Student" && user.fullName !== "Alex Chen"
      ? user.fullName
      : storedStudentName && storedStudentName !== "Student" && storedStudentName !== "Alex Chen"
      ? storedStudentName
      : dashboard?.studentName && dashboard.studentName !== "Student" && dashboard.studentName !== "Alex Chen"
      ? dashboard.studentName
      : "Student";
  const careerGoal =
    dashboard?.targetCareerName && dashboard.targetCareerName !== "Not Selected"
      ? dashboard.targetCareerName
      : storedTargetCareerName || "Not Selected";
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

  // Find next recommended learning milestone
  const nextRoadmapStep = dashboard?.activeRoadmap?.steps?.find(
    (s) => s.status === "AVAILABLE" || s.status === "IN_PROGRESS"
  );

  // Dynamic Personalized Next Learning Step based on real quiz & course progress
  const personalizedNextStep = React.useMemo(() => {
    if (nextRoadmapStep) {
      return {
        title: nextRoadmapStep.resourceTitle,
        skill: nextRoadmapStep.skillName,
        duration: `${nextRoadmapStep.estimatedMinutes}m`,
        actionUrl: `/learning/${nextRoadmapStep.resourceId}`,
        actionLabel: "Continue Task →",
        badge: "Roadmap Milestone",
      };
    }

    const earnedTitles = (storedEarnedCerts || []).map((c) => (c.courseTitle || "").toLowerCase());
    const nextMaster = MASTER_VIDEOS.find(
      (v) => !earnedTitles.some((t) => t.includes(v.title.toLowerCase()) || v.title.toLowerCase().includes(t))
    );

    if (nextMaster) {
      return {
        title: nextMaster.title,
        skill: nextMaster.skillName || nextMaster.category || "Core Specialization",
        duration: nextMaster.duration || "Masterclass",
        actionUrl: `/videos/${nextMaster.id || nextMaster.videoId}`,
        actionLabel: "Start Masterclass →",
        badge: "AI Skill Recommendation",
      };
    }

    return null;
  }, [nextRoadmapStep, storedEarnedCerts]);
  const latestEvolution = evolutionHistory && evolutionHistory.length > 0 ? evolutionHistory[0] : null;

  // Filter in-progress videos for Recently Watched / Continue Learning section
  const inProgressVideos = (allVideos || []).filter((v) => v.watchStatus === "IN_PROGRESS");

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={handleRefreshAll}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.responsiveWrapper}>
        {/* Top Welcome Bar */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greetingSub}>SmartEvolve AI Profile</Text>
            <Text style={styles.greetingTitle}>Hello, {studentName} 👋</Text>
          </View>
        </View>

        {/* Backend Connectivity Notice if error */}
        {isDashboardError && (
          <ErrorBanner
            title="Connecting to AI Service"
            message="SmartEvolve is attempting to connect to the cloud AI service. If the backend is on cold standby, tap to reconnect."
            onRetry={handleRefreshAll}
          />
        )}

        {/* Loading Skeletons */}
        {isDashboardLoading && (
          <View style={{ marginBottom: spacing.md }}>
            <CardSkeleton />
            <CardSkeleton />
          </View>
        )}

        {/* Target Career & Readiness Hero Card */}
        {!isDashboardLoading && (
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
                <Text style={styles.heroMetricVal}>{(readiness ?? 0).toFixed(0)}%</Text>
                <Text style={styles.heroMetricSub}>Career Readiness</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroMetricCol}>
                <Text style={[styles.heroMetricVal, { color: colors.accent }]}>
                  {(overallProf ?? 0).toFixed(0)}%
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
              onPress={() =>
                router.push(
                  dashboard?.targetCareerId || storedTargetCareerId
                    ? `/career/${dashboard?.targetCareerId || storedTargetCareerId}`
                    : "/(tabs)/careers"
                )
              }
              size="sm"
              style={{ marginTop: spacing.md }}
            />
          </Card>
        )}

        {/* Autonomous AI Diagnostics & Gemini 1.5 Mentor Card */}
        <Card style={styles.aiBannerCard}>
          <View style={styles.aiBannerHeader}>
            <View style={styles.aiTagRow}>
              <View style={styles.aiDot} />
              <Text style={styles.aiTagText}>
                {aiHealth?.status === "ONLINE" || aiHealth?.working
                  ? `${aiHealth?.provider === "ANTHROPIC" ? "ANTHROPIC CLAUDE 3.5" : "GOOGLE GEMINI 1.5"}: ACTIVE`
                  : "SMARTEVOLVE COGNITIVE AI: READY"}
              </Text>
            </View>
            <Badge label="AI Powered" variant="primary" />
          </View>

          <Text style={styles.aiBannerTitle}>Autonomous Skill Diagnostics & Mentorship</Text>
          <Text style={styles.aiBannerDesc}>
            Evaluate your technical proficiency against industry benchmarks, receive adaptive learning roadmaps, and get 24/7 technical interview guidance.
          </Text>

          <View style={styles.aiActionRow}>
            <TouchableOpacity
              style={styles.aiPrimaryBtn}
              onPress={() => setAiMentorVisible(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.aiPrimaryBtnText}>✨ Ask AI Career Mentor</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.aiSecondaryBtn}
              onPress={() => router.push("/(tabs)/evolution")}
              activeOpacity={0.85}
            >
              <Text style={styles.aiSecondaryBtnText}>📊 View Skill Analysis</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Quick Actions Bar */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push("/(tabs)/learn")}
          >
            <View style={[styles.qaIconWrap, { backgroundColor: "rgba(99, 102, 241, 0.18)" }]}>
              <Svg width="22" height="22" viewBox="0 0 16 16" fill="#6366F1">
                <Path fillRule="evenodd" d="M6 3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5v1A1.5 1.5 0 0 1 8.5 6v1H14a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V8h-5v1a.5.5 0 0 1-1 0V7H2.5A.5.5 0 0 1 2 6.5v-1a.5.5 0 0 1 1 0V6h5.5V5.5A1.5 1.5 0 0 1 7 4V3.5zM1.5 9a.5.5 0 0 0-.5.5v3A1.5 1.5 0 0 0 2.5 14h3A1.5 1.5 0 0 0 7 12.5v-3a.5.5 0 0 0-.5-.5h-5zm10 0a.5.5 0 0 0-.5.5v3a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5v-3a.5.5 0 0 0-.5-.5h-5z" />
              </Svg>
            </View>
            <Text style={styles.qaTitle}>Roadmap</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push("/(tabs)/evolution")}
          >
            <View style={[styles.qaIconWrap, { backgroundColor: "rgba(168, 85, 247, 0.18)" }]}>
              <Svg width="22" height="22" viewBox="0 0 16 16" fill="#A855F7">
                <Path fillRule="evenodd" d="M0 0h1v15h15v1H0V0Zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.707l-4.146 4.147a.5.5 0 0 1-.708 0L7 6.707l-4.646 4.647a.5.5 0 0 1-.708-.708l5-5a.5.5 0 0 1 .708 0L9.5 7.793 13.293 4H10.5a.5.5 0 0 1-.5-.5Z" />
              </Svg>
            </View>
            <Text style={styles.qaTitle}>Evolution</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push("/videos")}
          >
            <View style={[styles.qaIconWrap, { backgroundColor: "rgba(239, 68, 68, 0.18)" }]}>
              <Svg width="22" height="22" viewBox="0 0 16 16" fill="#EF4444">
                <Path d="M0 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm6.79-6.907A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z" />
              </Svg>
            </View>
            <Text style={styles.qaTitle}>Videos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push("/credentials")}
          >
            <View style={[styles.qaIconWrap, { backgroundColor: "rgba(245, 158, 11, 0.18)" }]}>
              <Svg width="22" height="22" viewBox="0 0 16 16" fill="#F59E0B">
                <Path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z" />
                <Path fillRule="evenodd" d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.637-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01-.622-.636z" />
              </Svg>
            </View>
            <Text style={styles.qaTitle}>Credentials</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => setAiMentorVisible(true)}
          >
            <View style={[styles.qaIconWrap, { backgroundColor: "rgba(16, 185, 129, 0.18)" }]}>
              <Text style={{ fontSize: 18 }}>✨</Text>
            </View>
            <Text style={styles.qaTitle}>AI Mentor</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Skill Improvement Summary Section */}
        {evolutionTrends && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📈 Skill Velocity & Improvement</Text>
              <Badge label={evolutionTrends.growthTrajectory || "ACTIVE"} variant="info" />
            </View>
            <Card style={styles.trendSummaryCard}>
              <View style={styles.trendSummaryRow}>
                <View style={styles.trendSummaryCol}>
                  <Text style={styles.trendSummaryVal}>
                    {evolutionTrends.totalEvolutionEventsCount || evolutionHistory?.length || 0}
                  </Text>
                  <Text style={styles.trendSummarySub}>Total AI Adaptations</Text>
                </View>
                <View style={styles.trendSummaryDivider} />
                <View style={styles.trendSummaryCol}>
                  <Text style={[styles.trendSummaryVal, { color: colors.success }]}>
                    {evolutionTrends.strongestSkills && evolutionTrends.strongestSkills.length > 0
                      ? evolutionTrends.strongestSkills[0]
                      : "Calibrating"}
                  </Text>
                  <Text style={styles.trendSummarySub}>Leading Skill Area</Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Next Recommended Learning Task / Personalized Milestone */}
        {personalizedNextStep && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🎯 Personalized Next Milestone</Text>
            </View>
            <Card style={styles.nextTaskCard}>
              <View style={styles.nextTaskTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nextTaskTitle}>{personalizedNextStep.title}</Text>
                  <Text style={styles.nextTaskSkill}>
                    Skill Focus: <Text style={{ color: colors.accent, fontWeight: "700" }}>{personalizedNextStep.skill}</Text>
                  </Text>
                </View>
                <Badge label={personalizedNextStep.duration} variant="success" />
              </View>

              <Button
                title={personalizedNextStep.actionLabel}
                size="sm"
                onPress={() => router.push(personalizedNextStep.actionUrl as any)}
                style={{ marginTop: spacing.sm }}
              />
            </Card>
          </View>
        )}

        {/* Recently Watched / Continue Learning Section */}
        {inProgressVideos.length > 0 && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>▶ Continue Watching Videos</Text>
              <TouchableOpacity onPress={() => router.push("/videos")}>
                <Text style={styles.seeAllText}>All Videos →</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -spacing.md }} contentContainerStyle={{ paddingHorizontal: spacing.md }}>
              {inProgressVideos.map((video) => (
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

        {/* Latest AI Evolution Event Callout */}
        {latestEvolution && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🧬 Latest AI Evolution Event</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/evolution")}>
                <Text style={styles.seeAllText}>Evolution Log →</Text>
              </TouchableOpacity>
            </View>

            <Card style={styles.evolutionCard}>
              <View style={styles.evolutionTop}>
                <Text style={styles.evolutionSkill}>{latestEvolution.skillName}</Text>
                <Text style={[styles.evolutionDelta, { color: latestEvolution.delta >= 0 ? colors.success : colors.warning }]}>
                  {(latestEvolution.delta ?? 0) >= 0 ? "+" : ""}{(latestEvolution.delta ?? 0).toFixed(1)}%
                </Text>
              </View>
              <Text style={styles.evolutionMeta}>
                Evidence: {latestEvolution.evidenceType.replace("_", " ")} • {new Date(latestEvolution.createdAt).toLocaleDateString()}
              </Text>
            </Card>
          </View>
        )}

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
                  {(dashboard.activeRoadmap.progressPercentage ?? 0).toFixed(0)}%
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
                  Tx: {c.transactionHash || "Cryptographically Verified"}
                </Text>
              </Card>
            ))}
          </View>
        )}
        {/* Gemini AI Mentor Modal */}
        <AiMentorModal
          visible={aiMentorVisible}
          onClose={() => setAiMentorVisible(false)}
        />
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
    alignSelf: "stretch",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  greetingSub: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  greetingTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: "900",
  },
  settingsBtn: {
    padding: spacing.xs,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  aiBannerCard: {
    padding: spacing.md,
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    borderColor: "rgba(99, 102, 241, 0.35)",
    borderWidth: 1.5,
    marginBottom: spacing.lg,
  },
  aiBannerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  aiTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  aiDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  aiTagText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  aiBannerTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 2,
  },
  aiBannerDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  aiActionRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  aiPrimaryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  aiPrimaryBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  aiSecondaryBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderColor: colors.cardBorder,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  aiSecondaryBtnText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  heroCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderColor: "rgba(99, 102, 241, 0.3)",
    borderWidth: 1.5,
    marginBottom: spacing.lg,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroGoalLabel: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  heroCareerName: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 2,
  },
  heroStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  heroMetricCol: {
    alignItems: "center",
    flex: 1,
  },
  heroMetricVal: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  heroMetricSub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
    textAlign: "center",
  },
  heroDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.cardBorder,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  sectionWrap: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  seeAllText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  quickActionsScroll: {
    flexDirection: "row",
    marginBottom: spacing.lg,
  },
  quickActionCard: {
    alignItems: "center",
    marginRight: spacing.md,
  },
  qaIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  qaTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  trendSummaryCard: {
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  trendSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  trendSummaryCol: {
    flex: 1,
    alignItems: "center",
  },
  trendSummaryVal: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary,
  },
  trendSummarySub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  trendSummaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.cardBorder,
  },
  nextTaskCard: {
    padding: spacing.md,
    backgroundColor: "rgba(6, 182, 212, 0.08)",
    borderColor: "rgba(6, 182, 212, 0.35)",
    borderWidth: 1,
  },
  nextTaskTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  nextTaskTag: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  nextTaskTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  nextTaskSkill: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  evolutionCard: {
    padding: spacing.md,
    backgroundColor: "rgba(139, 92, 246, 0.08)",
    borderColor: "rgba(139, 92, 246, 0.35)",
    borderWidth: 1,
  },
  evolutionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  evolutionSkill: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  evolutionDelta: {
    fontSize: 15,
    fontWeight: "800",
  },
  evolutionReason: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  evolutionMeta: {
    color: colors.textMuted,
    fontSize: 11,
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
    color: colors.textSecondary,
    fontSize: 12,
  },
  roadmapPct: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: "800",
  },
  stepsPreviewWrap: {
    gap: 8,
    borderTopColor: colors.cardBorder,
    borderTopWidth: 1,
    paddingTop: spacing.sm,
  },
  stepPreviewItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepPreviewLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
    marginRight: spacing.sm,
  },
  stepPreviewTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  stepMinutes: {
    color: colors.textMuted,
    fontSize: 11,
  },
  recCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  recTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  recTime: {
    color: colors.textMuted,
    fontSize: 11,
  },
  recTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  recReason: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  emptyCard: {
    padding: spacing.lg,
    alignItems: "center",
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
  credCard: {
    padding: spacing.md,
    borderColor: colors.blockchainBorder,
    borderWidth: 1,
    marginBottom: spacing.sm,
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
    fontFamily: "monospace",
  },
});
