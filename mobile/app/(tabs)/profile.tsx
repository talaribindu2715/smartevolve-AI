import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import Svg, { Path, Circle } from "react-native-svg";
import { api } from "../../src/api/client";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { Button } from "../../src/components/Button";
import { ProficiencyBar } from "../../src/components/ProficiencyBar";
import { SkillRadarChart } from "../../src/components/SkillRadarChart";
import { colors, radius, spacing } from "../../src/theme/colors";

export default function ProfileScreen() {
  const router = useRouter();

  const {
    data: profile,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
    isRefetching,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.getProfile(),
  });

  const { data: studentSkills, isLoading: isSkillsLoading } = useQuery({
    queryKey: ["studentSkills"],
    queryFn: () => api.getMySkills(),
  });

  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => api.getAnalytics(),
  });

  const isLoading = isProfileLoading || isSkillsLoading || isAnalyticsLoading;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading Student Profile...</Text>
      </View>
    );
  }

  const skills = studentSkills || [];
  const categoryProficiencies = analytics?.categoryProficiencies || {};

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetchProfile}
          tintColor={colors.primary}
        />
      }
    >
      {/* Top Header Card */}
      <Card style={styles.profileHeaderCard}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>
            {(profile?.fullName || "S").substring(0, 2).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.name}>{profile?.fullName || "Student"}</Text>
        <Text style={styles.education}>
          {profile?.branch} • {profile?.institution || "Engineering College"}
        </Text>
        <Text style={styles.gradYear}>Class of {profile?.graduationYear || 2027}</Text>

        <View style={styles.metaBadgeRow}>
          <Badge label="VERIFIED STUDENT" variant="success" />
          <Badge label="ADAPTIVE ENGINE ACTIVE" variant="primary" />
        </View>
      </Card>

      {/* Academic Goals & Preferences Card */}
      <Card style={styles.goalsCard}>
        <View style={styles.goalsHeaderRow}>
          <Text style={styles.goalsCardTitle}>🎯 Target Career & Learning Style</Text>
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Text style={styles.editProfileLink}>Edit ✎</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.goalMetaRow}>
          <Text style={styles.goalMetaLabel}>Target Role:</Text>
          <Text style={styles.goalMetaVal}>{profile?.targetCareerName || "Not Set"}</Text>
        </View>

        <View style={styles.goalMetaRow}>
          <Text style={styles.goalMetaLabel}>Learning Style:</Text>
          <Text style={styles.goalMetaVal}>{profile?.preferredLearningStyle || "Hands-on Projects"}</Text>
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
            Continuous competency mapping across 8 standard engineering disciplines.
          </Text>
        </Card>
      </View>

      {/* Verified Skills Breakdown */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Calibrated Skill Proficiencies</Text>
          <Text style={styles.skillsCount}>{skills.length} Skills</Text>
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
                No calibrated skills yet. Take an assessment to initialize your verified profile!
              </Text>
            </View>
          )}
        </Card>
      </View>

      {/* Action Links */}
      <View style={styles.actionsWrap}>
        <Button
          title="View Blockchain Credentials"
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
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
    gap: spacing.sm,
    marginTop: spacing.md,
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
    paddingVertical: 3,
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
  },
  actionsWrap: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
});
