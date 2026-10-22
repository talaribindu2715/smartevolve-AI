import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../src/api/client";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { Button } from "../../src/components/Button";
import { ProficiencyBar } from "../../src/components/ProficiencyBar";
import { colors, radius, spacing } from "../../src/theme/colors";

export default function CareerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [settingGoal, setSettingGoal] = useState(false);

  const { data: career, isLoading } = useQuery({
    queryKey: ["careerDetail", id],
    queryFn: () => api.getCareerDetail(id!),
    enabled: !!id,
  });

  const setGoalMutation = useMutation({
    mutationFn: () => api.setCareerGoal(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["activeRoadmap"] });
      queryClient.invalidateQueries({ queryKey: ["careerDetail", id] });
      Alert.alert(
        "Career Goal Activated",
        `You have successfully set ${career?.name} as your target role! Your personalized roadmap and recommendations have been recalculated.`,
        [
          {
            text: "View Roadmap",
            onPress: () => router.push("/(tabs)/learn"),
          },
          { text: "OK" },
        ]
      );
    },
    onError: (err: any) => {
      Alert.alert("Error", err.message || "Failed to set career goal");
    },
  });

  if (isLoading || !career) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Analyzing Skill Gap Breakdown...</Text>
      </View>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.success;
    if (score >= 50) return colors.primary;
    if (score >= 30) return colors.accent;
    return colors.warning;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Header */}
      <Card style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.careerCategory}>{career.category}</Text>
            <Text style={styles.careerName}>{career.name}</Text>
          </View>
          <View style={styles.scoreWrap}>
            <Text style={[styles.scoreVal, { color: getScoreColor(career.compatibilityScore) }]}>
              {career.compatibilityScore.toFixed(0)}%
            </Text>
            <Text style={styles.scoreSub}>Match Score</Text>
          </View>
        </View>

        <Text style={styles.description}>{career.description}</Text>

        <View style={styles.metaBadgeRow}>
          <Badge
            label={career.readinessLevel.replace("_", " ")}
            variant={career.readinessLevel === "READY" ? "success" : "info"}
          />
          {career.isCurrentGoal ? (
            <Badge label="ACTIVE GOAL" variant="success" />
          ) : (
            <Badge label="POTENTIAL MATCH" variant="primary" />
          )}
        </View>

        {!career.isCurrentGoal && (
          <Button
            title="Set as My Target Career Goal"
            onPress={() => setGoalMutation.mutate()}
            loading={setGoalMutation.isPending}
            size="md"
            style={{ marginTop: spacing.md }}
          />
        )}
      </Card>

      {/* Explainable AI Analysis */}
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionTitle}>Explainable Match Insights</Text>
        <Card style={styles.insightCard}>
          <Text style={styles.insightText}>💡 {career.explanation}</Text>
        </Card>
      </View>

      {/* Skills Gap Analysis */}
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionTitle}>Required Skills & Target Proficiency</Text>
        <Card>
          {career.skillGaps.map((gap) => (
            <View key={gap.skillId} style={styles.gapRow}>
              <View style={styles.gapTop}>
                <Text style={styles.gapSkillName}>{gap.skillName}</Text>
                <Badge
                  label={gap.priority}
                  variant={
                    gap.priority === "MASTERED"
                      ? "success"
                      : gap.priority === "CRITICAL"
                      ? "error"
                      : gap.priority === "HIGH"
                      ? "warning"
                      : "info"
                  }
                />
              </View>

              <ProficiencyBar
                label=""
                value={gap.currentProficiency}
                targetValue={gap.requiredProficiency}
              />
            </View>
          ))}
        </Card>
      </View>

      {/* Matched vs Missing Skills Summary */}
      <View style={styles.breakdownRow}>
        <Card style={[styles.breakdownCard, { borderColor: colors.success }]}>
          <Text style={[styles.breakdownNum, { color: colors.success }]}>
            {career.matchedSkills.length}
          </Text>
          <Text style={styles.breakdownLabel}>Matched</Text>
        </Card>

        <Card style={[styles.breakdownCard, { borderColor: colors.warning }]}>
          <Text style={[styles.breakdownNum, { color: colors.warning }]}>
            {career.partiallyMatchedSkills.length}
          </Text>
          <Text style={styles.breakdownLabel}>Partial</Text>
        </Card>

        <Card style={[styles.breakdownCard, { borderColor: colors.error }]}>
          <Text style={[styles.breakdownNum, { color: colors.error }]}>
            {career.missingSkills.length}
          </Text>
          <Text style={styles.breakdownLabel}>Missing</Text>
        </Card>
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
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  heroCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  careerCategory: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  careerName: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 2,
  },
  scoreWrap: {
    alignItems: "flex-end",
  },
  scoreVal: {
    fontSize: 28,
    fontWeight: "900",
  },
  scoreSub: {
    color: colors.textMuted,
    fontSize: 10,
    textTransform: "uppercase",
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginVertical: spacing.sm,
  },
  metaBadgeRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionWrap: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  insightCard: {
    backgroundColor: colors.surface,
  },
  insightText: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
  },
  gapRow: {
    marginVertical: spacing.xs,
  },
  gapTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  gapSkillName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  breakdownRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  breakdownCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  breakdownNum: {
    fontSize: 24,
    fontWeight: "800",
  },
  breakdownLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    textTransform: "uppercase",
  },
});
