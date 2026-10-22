import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import Svg, { Path } from "react-native-svg";
import { api } from "../../src/api/client";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { colors, radius, spacing } from "../../src/theme/colors";

export default function EvolutionScreen() {
  const {
    data: history,
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
    isRefetching,
  } = useQuery({
    queryKey: ["evolutionHistory"],
    queryFn: () => api.getEvolutionHistory(),
  });

  const { data: trends, isLoading: isTrendsLoading } = useQuery({
    queryKey: ["evolutionTrends"],
    queryFn: () => api.getTrends(),
  });

  const isLoading = isHistoryLoading || isTrendsLoading;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Analyzing Skill Evolution Trajectory...</Text>
      </View>
    );
  }

  const events = history || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetchHistory}
          tintColor={colors.primary}
        />
      }
    >
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTag}>ADAPTIVE PROFILE EVOLUTION</Text>
        <Text style={styles.headerTitle}>Skill Growth Timeline</Text>
        <Text style={styles.headerSub}>
          Audited log of skill proficiency adaptations driven by assessment evidence and project work.
        </Text>
      </View>

      {/* Trajectory & Velocity Stats Card */}
      {trends && (
        <Card style={styles.trendCard}>
          <View style={styles.trendRow}>
            <View style={styles.trendCol}>
              <Text style={styles.trendVal}>{trends.trajectory}</Text>
              <Text style={styles.trendSub}>Trajectory</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.trendCol}>
              <Text style={[styles.trendVal, { color: colors.accent }]}>
                +{trends.totalProficiencyGained || 0}%
              </Text>
              <Text style={styles.trendSub}>Total Skill Gain</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.trendCol}>
              <Text style={[styles.trendVal, { color: colors.success }]}>
                +{trends.averageGrowthPerAttempt || 0}%
              </Text>
              <Text style={styles.trendSub}>Velocity/Quiz</Text>
            </View>
          </View>

          {trends.topImprovingSkills && trends.topImprovingSkills.length > 0 && (
            <View style={styles.topSkillsRow}>
              <Text style={styles.topSkillsLabel}>Fastest Improving:</Text>
              {trends.topImprovingSkills.map((sk: string) => (
                <Badge key={sk} label={sk} variant="info" style={{ marginRight: 6 }} />
              ))}
            </View>
          )}
        </Card>
      )}

      {/* Timeline Events List */}
      <View style={styles.timelineList}>
        {events.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="1.5">
              <Path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </Svg>
            <Text style={styles.emptyTitle}>No Evolution Events Yet</Text>
            <Text style={styles.emptySub}>
              Take skill diagnostic quizzes or complete learning modules. Every demonstrated proof of mastery updates your proficiency and records evidence here!
            </Text>
          </Card>
        ) : (
          events.map((event, idx) => {
            const isPositive = event.delta >= 0;
            const deltaSign = isPositive ? "+" : "";

            return (
              <View key={event.id} style={styles.timelineItemWrap}>
                {/* Timeline vertical bar */}
                {idx < events.length - 1 && <View style={styles.timelineBar} />}

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
  header: {
    marginBottom: spacing.md,
  },
  headerTag: {
    color: colors.primary,
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
  trendCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  trendCol: {
    flex: 1,
    alignItems: "center",
  },
  trendVal: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  trendSub: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    textTransform: "uppercase",
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: colors.cardBorder,
  },
  topSkillsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    gap: 4,
  },
  topSkillsLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginRight: 4,
  },
  timelineList: {
    gap: spacing.md,
  },
  timelineItemWrap: {
    flexDirection: "row",
    position: "relative",
  },
  timelineBar: {
    position: "absolute",
    left: 11,
    top: 24,
    bottom: -spacing.md,
    width: 2,
    backgroundColor: colors.cardBorder,
    zIndex: 1,
  },
  timelineNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
    marginTop: 12,
    zIndex: 2,
  },
  timelineNodeInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  eventCard: {
    flex: 1,
    padding: spacing.md,
  },
  eventTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  skillName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  category: {
    color: colors.textMuted,
    fontSize: 12,
  },
  deltaWrap: {
    alignItems: "flex-end",
  },
  deltaText: {
    fontSize: 16,
    fontWeight: "800",
  },
  profTransition: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  reasonText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginVertical: spacing.xs,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 8,
  },
  eventDate: {
    color: colors.textMuted,
    fontSize: 11,
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
    marginTop: spacing.xs,
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});
