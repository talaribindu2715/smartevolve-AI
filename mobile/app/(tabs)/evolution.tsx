import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Svg, { Path, Circle } from "react-native-svg";
import { api } from "../../src/api/client";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { Button } from "../../src/components/Button";
import { Skeleton, CardSkeleton } from "../../src/components/Skeleton";
import { ErrorBanner } from "../../src/components/ErrorBanner";
import { colors, radius, spacing } from "../../src/theme/colors";

export default function EvolutionScreen() {
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  const {
    data: history,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    refetch: refetchHistory,
    isRefetching,
  } = useQuery({
    queryKey: ["evolutionHistory"],
    queryFn: () => api.getEvolutionHistory(),
  });

  const {
    data: trends,
    isLoading: isTrendsLoading,
    refetch: refetchTrends,
  } = useQuery({
    queryKey: ["evolutionTrends"],
    queryFn: () => api.getTrends(),
  });

  const { data: dashboard } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.getDashboard(),
  });

  const recalculateMutation = useMutation({
    mutationFn: () => api.recalculateEvolution(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["evolutionHistory"] });
      queryClient.invalidateQueries({ queryKey: ["evolutionTrends"] });
      queryClient.invalidateQueries({ queryKey: ["activeRoadmap"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      Alert.alert(
        "AI Evolution Cycle Complete",
        res.message || "Your skill proficiencies and prerequisite graphs have been evaluated and adapted."
      );
    },
    onError: (err: any) => {
      Alert.alert("Adaptation Error", err.message || "Failed to trigger evolution cycle");
    },
  });

  const handleRefreshAll = () => {
    refetchHistory();
    refetchTrends();
  };

  const isLoading = isHistoryLoading || isTrendsLoading;
  const events = history || [];

  const filteredEvents = events.filter((e) => {
    if (selectedFilter === "ALL") return true;
    if (selectedFilter === "ASSESSMENT") return e.evidenceType === "ASSESSMENT";
    if (selectedFilter === "LEARNING") return e.evidenceType === "LEARNING_RESOURCE";
    if (selectedFilter === "POSITIVE") return e.delta >= 0;
    return true;
  });

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
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTag}>SELF-EVOLVING AI SYSTEM</Text>
              <Text style={styles.headerTitle}>Skill Evolution Engine</Text>
            </View>

            <TouchableOpacity
              style={styles.recalcBtn}
              disabled={recalculateMutation.isPending}
              onPress={() => recalculateMutation.mutate()}
            >
              {recalculateMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.recalcBtnText}>⚡ Trigger Evolution</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.headerSub}>
            Deterministic, explainable skill adaptation driven by assessment verification, learning tasks, and prerequisite progression.
          </Text>
        </View>

        {/* Backend Connection Error */}
        {isHistoryError && (
          <ErrorBanner
            title="Evolution Service Notice"
            message="Connecting to the AI Evolution trajectory server. If Render is waking from standby, please tap retry."
            onRetry={handleRefreshAll}
          />
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <View>
            <CardSkeleton />
            <CardSkeleton />
          </View>
        )}

        {/* Trajectory & Velocity Stats Card */}
        {trends && (
          <Card style={styles.trendCard}>
            <View style={styles.trendRow}>
              <View style={styles.trendCol}>
                <Text style={styles.trendVal}>{trends.growthTrajectory || "BALANCED"}</Text>
                <Text style={styles.trendSub}>Trajectory</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.trendCol}>
                <Text style={[styles.trendVal, { color: colors.accent }]}>
                  {trends.totalEvolutionEventsCount || events.length}
                </Text>
                <Text style={styles.trendSub}>Evolution Cycles</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.trendCol}>
                <Text style={[styles.trendVal, { color: colors.success }]}>
                  +{events.length > 0 ? (events.reduce((acc, e) => acc + (e.delta > 0 ? e.delta : 0), 0) / Math.max(1, events.length)).toFixed(1) : 0}%
                </Text>
                <Text style={styles.trendSub}>Avg Velocity</Text>
              </View>
            </View>
          </Card>
        )}

        {/* AI Adaptation Architecture Workflow Card */}
        <Card style={styles.workflowCard}>
          <Text style={styles.workflowTag}>TRANSPARENT AI ARCHITECTURE</Text>
          <Text style={styles.workflowTitle}>How SmartEvolve AI Adapts to You</Text>
          <Text style={styles.workflowDesc}>
            SmartEvolve uses mathematical Bayesian belief updates and prerequisite DAG graph traversal to adapt recommendations in real-time without unverified assumptions:
          </Text>

          <View style={styles.workflowStepsWrap}>
            <View style={styles.wfStep}>
              <View style={styles.wfNumCircle}><Text style={styles.wfNum}>1</Text></View>
              <Text style={styles.wfText}>
                <Text style={{ fontWeight: "700", color: colors.textPrimary }}>Empirical Evidence: </Text>
                Quizzes, practice tasks & video masterclasses generate verified evidence items.
              </Text>
            </View>
            <View style={styles.wfStep}>
              <View style={styles.wfNumCircle}><Text style={styles.wfNum}>2</Text></View>
              <Text style={styles.wfText}>
                <Text style={{ fontWeight: "700", color: colors.textPrimary }}>Proficiency Re-calibration: </Text>
                Belief scores update using Bayesian priors and penalty factors.
              </Text>
            </View>
            <View style={styles.wfStep}>
              <View style={styles.wfNumCircle}><Text style={styles.wfNum}>3</Text></View>
              <Text style={styles.wfText}>
                <Text style={{ fontWeight: "700", color: colors.textPrimary }}>Prerequisite Graph Traversal: </Text>
                Downstream milestone modules unlock automatically once prerequisite skills reach 70%+.
              </Text>
            </View>
            <View style={styles.wfStep}>
              <View style={styles.wfNumCircle}><Text style={styles.wfNum}>4</Text></View>
              <Text style={styles.wfText}>
                <Text style={{ fontWeight: "700", color: colors.textPrimary }}>Explainable Versioned History: </Text>
                Every change in recommendations and readiness is logged with explicit causality.
              </Text>
            </View>
          </View>
        </Card>

        {/* Strengths & Weaknesses Analysis Card */}
        <Card style={styles.analysisCard}>
          <Text style={styles.analysisSectionTitle}>Skill Mastery Diagnostic</Text>

          <View style={styles.analysisGrid}>
            {/* Strongest Skills */}
            <View style={styles.analysisCol}>
              <Text style={styles.analysisColTitle}>💪 Top Strengths</Text>
              {trends?.strongestSkills && trends.strongestSkills.length > 0 ? (
                <View style={styles.tagWrap}>
                  {trends.strongestSkills.map((sk: string) => (
                    <Badge key={sk} label={sk} variant="success" style={{ marginVertical: 3 }} />
                  ))}
                </View>
              ) : (
                <Text style={styles.analysisEmpty}>Complete assessments to identify strengths</Text>
              )}
            </View>

            <View style={styles.analysisDivider} />

            {/* Weakest Skills */}
            <View style={styles.analysisCol}>
              <Text style={styles.analysisColTitle}>🎯 Growth Opportunities</Text>
              {trends?.weakestSkills && trends.weakestSkills.length > 0 ? (
                <View style={styles.tagWrap}>
                  {trends.weakestSkills.map((sk: string) => (
                    <Badge key={sk} label={sk} variant="warning" style={{ marginVertical: 3 }} />
                  ))}
                </View>
              ) : (
                <Text style={styles.analysisEmpty}>No critical gaps currently flagged</Text>
              )}
            </View>
          </View>

          {/* Recommended Next Actions */}
          {trends?.recommendedNextActions && trends.recommendedNextActions.length > 0 && (
            <View style={styles.nextActionsWrap}>
              <Text style={styles.nextActionsTitle}>🧠 AI Adaptive Next Actions:</Text>
              {trends.recommendedNextActions.map((action: string, i: number) => (
                <Text key={i} style={styles.actionItemText}>
                  • {action}
                </Text>
              ))}
            </View>
          )}
        </Card>

        {/* Active AI Recommendations & Causality Card */}
        {dashboard?.recommendations && dashboard.recommendations.length > 0 && (
          <View style={styles.recsSectionWrap}>
            <View style={styles.recsHeaderRow}>
              <Text style={styles.sectionHeading}>Current Adaptive Recommendations</Text>
              <Badge label="Active Pipeline" variant="primary" />
            </View>
            <Text style={styles.sectionSub}>
              Targeted learning actions calibrated to your recent performance delta:
            </Text>

            {dashboard.recommendations.map((rec) => (
              <Card key={rec.id} style={styles.recItemCard}>
                <View style={styles.recTopRow}>
                  <Text style={styles.recTitle}>{rec.resourceTitle || rec.skillName}</Text>
                  <Badge
                    label={rec.priority}
                    variant={rec.priority === "CRITICAL" ? "error" : "warning"}
                  />
                </View>
                <Text style={styles.recReasonText}>💡 Reason: {rec.reason}</Text>
                <Text style={styles.recMetaText}>
                  Focus: {rec.skillName} • Est. Time: {rec.estimatedMinutes} mins
                </Text>
              </Card>
            ))}
          </View>
        )}

        {/* Filter Pills for Timeline Events */}
        <View style={styles.filterPillsRow}>
          <TouchableOpacity
            style={[styles.filterPill, selectedFilter === "ALL" && styles.filterPillActive]}
            onPress={() => setSelectedFilter("ALL")}
          >
            <Text style={[styles.filterPillText, selectedFilter === "ALL" && styles.filterPillTextActive]}>
              All Events ({events.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, selectedFilter === "ASSESSMENT" && styles.filterPillActive]}
            onPress={() => setSelectedFilter("ASSESSMENT")}
          >
            <Text style={[styles.filterPillText, selectedFilter === "ASSESSMENT" && styles.filterPillTextActive]}>
              Assessments
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, selectedFilter === "LEARNING" && styles.filterPillActive]}
            onPress={() => setSelectedFilter("LEARNING")}
          >
            <Text style={[styles.filterPillText, selectedFilter === "LEARNING" && styles.filterPillTextActive]}>
              Modules & Videos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Timeline Events List */}
        <View style={styles.timelineList}>
          <Text style={styles.timelineHeading}>Historical Evolution Log ({filteredEvents.length} Events)</Text>

          {filteredEvents.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="1.5">
                <Path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </Svg>
              <Text style={styles.emptyTitle}>No Evolution Events Yet</Text>
              <Text style={styles.emptySub}>
                Take a skill diagnostic assessment or complete video modules. Every verified evidence item triggers the Bayesian proficiency recalculation engine and logs an audited event here!
              </Text>
            </Card>
          ) : (
            filteredEvents.map((event, idx) => {
              const isPositive = event.delta >= 0;
              const deltaSign = isPositive ? "+" : "";

              return (
                <View key={event.id} style={styles.timelineItemWrap}>
                  {/* Timeline vertical bar */}
                  {idx < filteredEvents.length - 1 && <View style={styles.timelineBar} />}

                  {/* Timeline node icon */}
                  <View style={[styles.timelineNode, { borderColor: isPositive ? colors.success : colors.warning }]}>
                    <View style={[styles.timelineNodeInner, { backgroundColor: isPositive ? colors.success : colors.warning }]} />
                  </View>

                  {/* Event Card */}
                  <Card style={styles.eventCard}>
                    <View style={styles.eventTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.skillName}>{event.skillName}</Text>
                        <Text style={styles.category}>{event.category}</Text>
                      </View>

                      <View style={styles.deltaWrap}>
                        <Text style={[styles.deltaText, { color: isPositive ? colors.success : colors.warning }]}>
                          {deltaSign}{event.delta.toFixed(1)}%
                        </Text>
                        <Text style={styles.profTransition}>
                          {event.previousProficiency.toFixed(0)}% → {event.newProficiency.toFixed(0)}%
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.reasonText}>💬 {event.changeReason}</Text>

                    <View style={styles.eventFooter}>
                      <Badge
                        label={event.evidenceType.replace("_", " ")}
                        variant={event.evidenceType === "ASSESSMENT" ? "primary" : "info"}
                      />
                      <Text style={styles.eventDate}>
                        {new Date(event.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  </Card>
                </View>
              );
            })
          )}
        </View>
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
    marginBottom: spacing.lg,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTag: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: "800",
    marginTop: 2,
  },
  headerSub: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  recalcBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.sm,
  },
  recalcBtnText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  trendCard: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  trendCol: {
    flex: 1,
    alignItems: "center",
  },
  trendVal: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "800",
  },
  trendSub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: colors.cardBorder,
  },
  workflowCard: {
    padding: spacing.md,
    backgroundColor: "rgba(139, 92, 246, 0.08)",
    borderColor: "rgba(139, 92, 246, 0.3)",
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  workflowTag: {
    color: colors.secondary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  workflowTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 2,
  },
  workflowDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  workflowStepsWrap: {
    marginTop: spacing.sm,
    gap: 8,
  },
  wfStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  wfNumCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  wfNum: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
  },
  wfText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  analysisCard: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  analysisSectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  analysisGrid: {
    flexDirection: "row",
  },
  analysisCol: {
    flex: 1,
  },
  analysisColTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  analysisDivider: {
    width: 1,
    backgroundColor: colors.cardBorder,
    marginHorizontal: spacing.sm,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  analysisEmpty: {
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: "italic",
  },
  nextActionsWrap: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopColor: colors.cardBorder,
    borderTopWidth: 1,
    gap: 4,
  },
  nextActionsTitle: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  actionItemText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  recsSectionWrap: {
    marginBottom: spacing.md,
  },
  recsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  sectionHeading: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  sectionSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  recItemCard: {
    padding: spacing.sm,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  recTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  recTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  recReasonText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  recMetaText: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  filterPillsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: spacing.md,
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
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  filterPillTextActive: {
    color: "#FFF",
  },
  timelineList: {
    position: "relative",
  },
  timelineHeading: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: spacing.md,
  },
  emptyCard: {
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  timelineItemWrap: {
    position: "relative",
    paddingLeft: 30,
    marginBottom: spacing.md,
  },
  timelineBar: {
    position: "absolute",
    left: 8,
    top: 24,
    bottom: -16,
    width: 2,
    backgroundColor: colors.cardBorder,
  },
  timelineNode: {
    position: "absolute",
    left: 0,
    top: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  timelineNodeInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  eventCard: {
    padding: spacing.md,
  },
  eventTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  skillName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  category: {
    color: colors.textMuted,
    fontSize: 11,
  },
  deltaWrap: {
    alignItems: "flex-end",
  },
  deltaText: {
    fontSize: 15,
    fontWeight: "800",
  },
  profTransition: {
    color: colors.textMuted,
    fontSize: 11,
  },
  reasonText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginVertical: 4,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    paddingTop: 6,
    borderTopColor: colors.cardBorder,
    borderTopWidth: 1,
  },
  eventDate: {
    color: colors.textMuted,
    fontSize: 11,
  },
});
