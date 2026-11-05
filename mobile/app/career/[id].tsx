import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../src/api/client";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { Button } from "../../src/components/Button";
import { ProficiencyBar } from "../../src/components/ProficiencyBar";
import { CardSkeleton, Skeleton } from "../../src/components/Skeleton";
import { ErrorBanner } from "../../src/components/ErrorBanner";
import { colors, radius, spacing } from "../../src/theme/colors";
import { MASTER_VIDEOS } from "../../src/data/masterVideos";

export default function CareerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showFormula, setShowFormula] = useState(false);

  const {
    data: career,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["careerDetail", id],
    queryFn: () => api.getCareerDetail(id!),
    enabled: !!id,
  });

  // Find top matching masterclass for this career
  const primaryCareerVideo = React.useMemo(() => {
    if (!career) return null;
    const kw = (career.name + " " + career.category + " " + (career.description || "")).toLowerCase();
    const matched = MASTER_VIDEOS.find((v) => {
      const vt = (v.title + " " + (v.skillName || "") + " " + (v.category || "")).toLowerCase();
      if (kw.includes("full-stack") || kw.includes("full stack")) {
        return vt.includes("next.js") || vt.includes("react") || vt.includes("web");
      }
      if (kw.includes("ai") || kw.includes("machine learning")) {
        return vt.includes("machine learning") || vt.includes("python") || vt.includes("ai");
      }
      if (kw.includes("cloud") || kw.includes("devops")) {
        return vt.includes("docker") || vt.includes("kubernetes") || vt.includes("aws");
      }
      if (kw.includes("java")) {
        return vt.includes("java") || vt.includes("spring");
      }
      return vt.includes(career.name.toLowerCase());
    });
    return matched || MASTER_VIDEOS[0];
  }, [career]);

  const findVideoForSkill = (skillName: string) => {
    const sn = (skillName || "").toLowerCase();
    return MASTER_VIDEOS.find((v) => {
      const vt = (v.title + " " + (v.skillName || "") + " " + (v.category || "")).toLowerCase();
      return vt.includes(sn) || sn.includes((v.skillName || "").toLowerCase());
    });
  };

  const setGoalMutation = useMutation({
    mutationFn: () => api.setCareerGoal(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["activeRoadmap"] });
      queryClient.invalidateQueries({ queryKey: ["careerDetail", id] });
      queryClient.invalidateQueries({ queryKey: ["careers"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      Alert.alert(
        "Career Goal Activated",
        `You have successfully activated ${career?.name} as your target role! Your personalized roadmap and adaptive recommendations have been updated.`,
        [
          {
            text: "View Learning Roadmap",
            onPress: () => router.push("/(tabs)/learn"),
          },
          { text: "Stay Here" },
        ]
      );
    },
    onError: (err: any) => {
      Alert.alert("Error", err.message || "Failed to set career goal");
    },
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.success;
    if (score >= 50) return colors.primary;
    if (score >= 30) return colors.accent;
    return colors.warning;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.responsiveWrapper}>
        {/* Navigation Breadcrumb / Back Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>← Back to Careers</Text>
          </TouchableOpacity>
          {career?.isCurrentGoal && (
            <Badge label="ACTIVE TARGET ROLE" variant="success" />
          )}
        </View>

        {isError && (
          <ErrorBanner
            message={error instanceof Error ? error.message : "Failed to load career analysis."}
            onRetry={refetch}
          />
        )}

        {isLoading || !career ? (
          <View style={{ gap: spacing.md, marginTop: spacing.md }}>
            <CardSkeleton height={200} />
            <CardSkeleton height={140} />
            <CardSkeleton height={220} />
          </View>
        ) : (
          <>
            {/* Hero Header Card */}
            <Card style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View style={{ flex: 1, paddingRight: spacing.sm }}>
                  <Text style={styles.careerCategory}>{career.category}</Text>
                  <Text style={styles.careerName}>{career.name}</Text>
                </View>
                <View style={styles.scoreWrap}>
                  <Text
                    style={[
                      styles.scoreVal,
                      { color: getScoreColor(career.compatibilityScore ?? 0) },
                    ]}
                  >
                    {(career.compatibilityScore ?? 0).toFixed(0)}%
                  </Text>
                  <Text style={styles.scoreSub}>Match Score</Text>
                </View>
              </View>

              <Text style={styles.description}>{career.description}</Text>

              <View style={styles.metaBadgeRow}>
                <Badge
                  label={`Readiness: ${career.readinessLevel.replace("_", " ")}`}
                  variant={career.readinessLevel === "READY" ? "success" : "info"}
                />
                <Badge
                  label={`Difficulty: ${career.difficulty ? career.difficulty.replace("_", " ") : "INTERMEDIATE"}`}
                  variant="warning"
                />
                {career.isCurrentGoal ? (
                  <Badge label="TARGET CAREER" variant="success" />
                ) : (
                  <Badge label="POTENTIAL MATCH" variant="primary" />
                )}
              </View>

              <View style={styles.prepRow}>
                <Text style={styles.prepLabel}>Estimated Preparation Timeline:</Text>
                <Text style={styles.prepVal}>
                  ~{career.estimatedPreparationWeeks || 12} weeks
                </Text>
              </View>

              <View style={styles.actionButtonRow}>
                {!career.isCurrentGoal ? (
                  <Button
                    title="Set as Target Career Goal"
                    onPress={() => setGoalMutation.mutate()}
                    loading={setGoalMutation.isPending}
                    size="md"
                    style={{ flex: 1 }}
                  />
                ) : (
                  <Button
                    title="View Learning Roadmap →"
                    onPress={() => router.push("/(tabs)/learn")}
                    size="md"
                    style={{ flex: 1 }}
                  />
                )}
                <Button
                  title="🎬 Video Lessons"
                  onPress={() => {
                    if (primaryCareerVideo) {
                      router.push(`/videos/${primaryCareerVideo.id || primaryCareerVideo.videoId}` as any);
                    } else {
                      router.push("/videos");
                    }
                  }}
                  variant="outline"
                  size="md"
                />
              </View>
            </Card>

            {/* Explainable AI Analysis */}
            <View style={styles.sectionWrap}>
              <Text style={styles.sectionTitle}>Explainable Match Insights</Text>
              <Card style={styles.insightCard}>
                <Text style={styles.insightText}>💡 {career.explanation}</Text>

                <TouchableOpacity
                  style={styles.formulaToggle}
                  onPress={() => setShowFormula(!showFormula)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.formulaToggleText}>
                    {showFormula ? "Hide Algorithm Details ▲" : "How is this Match Score calculated? ▼"}
                  </Text>
                </TouchableOpacity>

                {showFormula && (
                  <View style={styles.formulaBox}>
                    <Text style={styles.formulaTitle}>Algorithmic Score Definition:</Text>
                    <Text style={styles.formulaBody}>
                      The match percentage is calculated by projecting the student's verified skill
                      proficiency vector $S_u$ against the target career requirement vector $R_c$:
                    </Text>
                    <View style={styles.mathSnippet}>
                      <Text style={styles.mathSnippetText}>
                        Score = ∑ [ min(Proficiency_i / Required_i, 1.0) × Weight_i ] / ∑ Weight_i × 100%
                      </Text>
                    </View>
                    <Text style={styles.formulaNote}>
                      • Essential/Critical skills carry 2.5x weight in the gap calculation.{"\n"}
                      • Verified assessment milestones lock in evidence-backed proficiencies.
                    </Text>
                  </View>
                )}
              </Card>
            </View>

            {/* Matched vs Partial vs Missing Skills Summary */}
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

            {/* Detailed Skills Gap Analysis */}
            <View style={styles.sectionWrap}>
              <Text style={styles.sectionTitle}>Required Competencies & Target Proficiencies</Text>
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
                    {(() => {
                      const skV = findVideoForSkill(gap.skillName);
                      if (!skV) return null;
                      return (
                        <TouchableOpacity
                          style={styles.gapVideoPill}
                          onPress={() => router.push(`/videos/${skV.id || skV.videoId}` as any)}
                          activeOpacity={0.75}
                        >
                          <Text style={styles.gapVideoPillText}>▶ Watch {gap.skillName} Lesson</Text>
                        </TouchableOpacity>
                      );
                    })()}
                  </View>
                ))}
              </Card>
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomNavActions}>
              <Button
                title={career.isCurrentGoal ? "Open Personalized Roadmap" : "Set Target Role & Open Roadmap"}
                onPress={() => {
                  if (!career.isCurrentGoal) {
                    setGoalMutation.mutate();
                  } else {
                    router.push("/(tabs)/learn");
                  }
                }}
                loading={setGoalMutation.isPending}
                size="lg"
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
    paddingBottom: spacing.xxl,
  },
  responsiveWrapper: {
    width: "100%",
    
    alignSelf: "stretch",
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backBtnText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
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
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  prepRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
  prepLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  prepVal: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  actionButtonRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
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
  formulaToggle: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  formulaToggleText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  formulaBox: {
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceLight,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  formulaTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  formulaBody: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  mathSnippet: {
    backgroundColor: colors.surface,
    padding: 8,
    borderRadius: radius.sm,
    marginVertical: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  mathSnippetText: {
    color: colors.accent,
    fontFamily: "monospace",
    fontSize: 11,
  },
  formulaNote: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
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
  gapVideoPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    borderColor: "rgba(99, 102, 241, 0.35)",
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
  },
  gapVideoPillText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
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
  bottomNavActions: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
});
