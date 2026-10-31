import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../src/api/client";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { Button } from "../../src/components/Button";
import { ProficiencyBar } from "../../src/components/ProficiencyBar";
import { SkillRadarChart } from "../../src/components/SkillRadarChart";
import { CardSkeleton, Skeleton } from "../../src/components/Skeleton";
import { ErrorBanner } from "../../src/components/ErrorBanner";
import { colors, radius, spacing } from "../../src/theme/colors";

export default function ProfileScreen() {
  const router = useRouter();

  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
    refetch: refetchProfile,
    isRefetching,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.getProfile(),
  });

  const {
    data: studentSkills,
    isLoading: isSkillsLoading,
    refetch: refetchSkills,
  } = useQuery({
    queryKey: ["studentSkills"],
    queryFn: () => api.getMySkills(),
  });

  const {
    data: analytics,
    isLoading: isAnalyticsLoading,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => api.getAnalytics(),
  });

  const { data: credentials } = useQuery({
    queryKey: ["credentials"],
    queryFn: () => api.getCredentials(),
  });

  const { data: dashboard } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.getDashboard(),
  });

  const isLoading = isProfileLoading || isSkillsLoading || isAnalyticsLoading;

  const handleRefresh = async () => {
    await Promise.all([refetchProfile(), refetchSkills(), refetchAnalytics()]);
  };

  const skills = studentSkills || [];
  const categoryProficiencies = analytics?.categoryProficiencies || {};
  const verifiedBadgeCount = (credentials || []).filter(
    (c) => c.status === "CONFIRMED"
  ).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.responsiveWrapper}>
        {isProfileError && (
          <ErrorBanner
            message={
              profileError instanceof Error
                ? profileError.message
                : "Unable to load student profile."
            }
            onRetry={handleRefresh}
          />
        )}

        {isLoading ? (
          <View style={{ gap: spacing.md }}>
            <CardSkeleton height={200} />
            <CardSkeleton height={140} />
            <CardSkeleton height={240} />
          </View>
        ) : (
          <>
            {/* Top Header Card */}
            <Card style={styles.profileHeaderCard}>
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarText}>
                  {(profile?.fullName || "S").substring(0, 2).toUpperCase()}
                </Text>
              </View>

              <Text style={styles.name}>{profile?.fullName || "Student"}</Text>
              <Text style={styles.education}>
                {profile?.branch || "Engineering Discipline"} •{" "}
                {profile?.institution || "Engineering College"}
              </Text>
              <Text style={styles.gradYear}>
                Class of {profile?.graduationYear || 2027} • Academic Goal Active
              </Text>

              <View style={styles.metaBadgeRow}>
                <Badge label="VERIFIED STUDENT" variant="success" />
                <Badge label="AI ADAPTIVE PROFILE" variant="primary" />
                {verifiedBadgeCount > 0 && (
                  <Badge label={`${verifiedBadgeCount} ON-CHAIN CREDENTIALS`} variant="blockchain" />
                )}
              </View>

              {/* Fast Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statCol}>
                  <Text style={styles.statVal}>
                    {analytics?.overallProficiency
                      ? `${analytics.overallProficiency.toFixed(0)}%`
                      : "0%"}
                  </Text>
                  <Text style={styles.statLabel}>Proficiency</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCol}>
                  <Text style={styles.statVal}>
                    {dashboard?.careerReadinessScore != null
                      ? `${dashboard.careerReadinessScore.toFixed(0)}%`
                      : "0%"}
                  </Text>
                  <Text style={styles.statLabel}>Career Readiness</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCol}>
                  <Text style={styles.statVal}>{skills.length}</Text>
                  <Text style={styles.statLabel}>Skills Tracked</Text>
                </View>
              </View>
            </Card>

            {/* Academic Goals & Preferences Card */}
            <Card style={styles.goalsCard}>
              <View style={styles.goalsHeaderRow}>
                <Text style={styles.goalsCardTitle}>🎯 Target Career & Learning Preferences</Text>
                <TouchableOpacity onPress={() => router.push("/settings")}>
                  <Text style={styles.editProfileLink}>Edit Settings ✎</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.goalMetaRow}>
                <Text style={styles.goalMetaLabel}>Target Career:</Text>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/careers")}
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <Text style={styles.goalMetaVal}>
                    {profile?.targetCareerName || "Not Selected (Tap to choose)"}
                  </Text>
                  <Text style={{ color: colors.accent, fontSize: 11 }}>→</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.goalMetaRow}>
                <Text style={styles.goalMetaLabel}>Learning Style:</Text>
                <Text style={styles.goalMetaVal}>
                  {profile?.preferredLearningStyle || "Hands-on / Practical Projects"}
                </Text>
              </View>

              {profile?.academicGoals ? (
                <View style={styles.academicGoalsQuote}>
                  <Text style={styles.academicGoalsText}>“{profile.academicGoals}”</Text>
                </View>
              ) : null}
            </Card>

            {/* Category Radar Chart */}
            <View style={styles.sectionWrap}>
              <Text style={styles.sectionTitle}>Category Competency Radar</Text>
              <Card style={styles.radarCard}>
                <SkillRadarChart data={categoryProficiencies} size={280} />
                <Text style={styles.radarSubtitle}>
                  Continuous multi-dimensional competency analysis across engineering disciplines.
                </Text>
              </Card>
            </View>

            {/* Calibrated Skills Breakdown */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Calibrated Skill Proficiencies</Text>
                <Text style={styles.skillsCount}>{skills.length} Calibrated</Text>
              </View>

              <Card>
                {skills.length > 0 ? (
                  skills.map((s) => (
                    <ProficiencyBar
                      key={s.id}
                      label={s.skillName}
                      value={s.proficiency}
                      category={s.category}
                      evidenceType={s.evidenceType}
                    />
                  ))
                ) : (
                  <View style={styles.emptySkillsWrap}>
                    <Text style={styles.emptySkillsText}>
                      No calibrated skills yet. Complete an assessment or mark roadmap lessons complete to populate your verified skill profile!
                    </Text>
                    <Button
                      title="Explore Careers & Start Roadmap"
                      onPress={() => router.push("/(tabs)/careers")}
                      size="sm"
                      style={{ marginTop: spacing.md }}
                    />
                  </View>
                )}
              </Card>
            </View>

            {/* Action Links */}
            <View style={styles.actionsWrap}>
              <Button
                title="View Blockchain Verified Credentials"
                onPress={() => router.push("/credentials")}
                variant="outline"
                size="md"
              />
              <Button
                title="Account Settings & Preferences"
                onPress={() => router.push("/settings")}
                variant="secondary"
                size="md"
              />
            </View>
          </>
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
  profileHeaderCard: {
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  avatarWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: colors.cardBorderActive,
  },
  avatarText: {
    color: "#FFF",
    fontSize: 26,
    fontWeight: "900",
  },
  name: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
  },
  education: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  gradYear: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  metaBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  statCol: {
    alignItems: "center",
    flex: 1,
  },
  statVal: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    textTransform: "uppercase",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.cardBorder,
  },
  goalsCard: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderColor: "rgba(99, 102, 241, 0.25)",
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  goalsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  goalsCardTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  editProfileLink: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  goalMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  goalMetaLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  goalMetaVal: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  academicGoalsQuote: {
    marginTop: 6,
    paddingTop: 6,
    borderTopColor: colors.cardBorder,
    borderTopWidth: 1,
  },
  academicGoalsText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontStyle: "italic",
    lineHeight: 18,
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
  skillsCount: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  radarCard: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  radarSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  emptySkillsWrap: {
    padding: spacing.md,
    alignItems: "center",
  },
  emptySkillsText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  actionsWrap: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
});
