import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import Svg, { Path } from "react-native-svg";
import { api } from "../../src/api/client";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { Button } from "../../src/components/Button";
import { colors, radius, spacing } from "../../src/theme/colors";
import { Career } from "../../src/types";

const CATEGORIES = [
  "All",
  "AI & Data Science",
  "Software Engineering",
  "Cloud & Infrastructure",
  "Security",
  "Enterprise Software",
];

const DIFFICULTIES = ["All Levels", "Beginner Friendly", "Intermediate", "Advanced"];

export default function CareersScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Levels");
  const [searchQuery, setSearchQuery] = useState("");
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<Career[]>([]);
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  const {
    data: careers,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["careers"],
    queryFn: () => api.getCareers(),
  });

  const filteredCareers = (careers || []).filter((c) => {
    const matchesCat =
      selectedCategory === "All" || c.category === selectedCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesDiff = true;
    if (selectedDifficulty === "Beginner Friendly") {
      matchesDiff = c.difficulty === "BEGINNER_FRIENDLY";
    } else if (selectedDifficulty === "Intermediate") {
      matchesDiff = c.difficulty === "INTERMEDIATE";
    } else if (selectedDifficulty === "Advanced") {
      matchesDiff = c.difficulty === "ADVANCED";
    }

    return matchesCat && matchesSearch && matchesDiff;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.success;
    if (score >= 50) return colors.primary;
    if (score >= 30) return colors.accent;
    return colors.warning;
  };

  const getReadinessBadge = (lvl: string) => {
    switch (lvl) {
      case "READY":
        return <Badge label="CAREER READY" variant="success" />;
      case "HIGH_POTENTIAL":
        return <Badge label="HIGH POTENTIAL" variant="info" />;
      case "DEVELOPING":
        return <Badge label="DEVELOPING" variant="warning" />;
      default:
        return <Badge label="EARLY STAGE" variant="primary" />;
    }
  };

  const getDifficultyBadge = (diff?: string) => {
    switch (diff) {
      case "BEGINNER_FRIENDLY":
        return <Badge label="BEGINNER FRIENDLY" variant="success" />;
      case "ADVANCED":
        return <Badge label="ADVANCED" variant="error" />;
      default:
        return <Badge label="INTERMEDIATE" variant="warning" />;
    }
  };

  const toggleCompareCareer = (career: Career) => {
    if (selectedForCompare.find((c) => c.id === career.id)) {
      setSelectedForCompare((prev) => prev.filter((c) => c.id !== career.id));
    } else {
      if (selectedForCompare.length >= 2) {
        setSelectedForCompare([selectedForCompare[1], career]);
      } else {
        setSelectedForCompare((prev) => [...prev, career]);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Search & Filter Bar */}
      <View style={styles.topHeader}>
        <View style={styles.headerTitleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTag}>CAREER DISCOVERY & MATCHING</Text>
            <Text style={styles.headerTitle}>15 Verified Industry Roles</Text>
          </View>
          <TouchableOpacity
            style={styles.formulaBadge}
            onPress={() => setShowFormulaModal(true)}
          >
            <Text style={styles.formulaBadgeText}>ℹ Match Formula</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2">
            <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </Svg>
          <TextInput
            style={styles.searchInput}
            placeholder="Search AI, Data Analyst, Cloud Engineer..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Horizontal Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.chip,
                selectedCategory === cat && styles.chipActive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedCategory === cat && styles.chipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Difficulty Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.chipsScroll, { marginTop: 6 }]}>
          {DIFFICULTIES.map((diff) => (
            <TouchableOpacity
              key={diff}
              onPress={() => setSelectedDifficulty(diff)}
              style={[
                styles.diffChip,
                selectedDifficulty === diff && styles.diffChipActive,
              ]}
            >
              <Text
                style={[
                  styles.diffChipText,
                  selectedDifficulty === diff && styles.diffChipTextActive,
                ]}
              >
                {diff}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Floating Compare Action Bar if selections exist */}
        {selectedForCompare.length > 0 && (
          <View style={styles.compareBar}>
            <Text style={styles.compareBarText}>
              Selected for Comparison: {selectedForCompare.length}/2
            </Text>
            <TouchableOpacity
              style={[styles.compareOpenBtn, selectedForCompare.length < 2 && { opacity: 0.6 }]}
              disabled={selectedForCompare.length < 2}
              onPress={() => setCompareModalVisible(true)}
            >
              <Text style={styles.compareOpenBtnText}>Compare Now ({selectedForCompare.length})</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Career Cards List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Analyzing 15 Career Roles against your skill matrix...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
        >
          {filteredCareers.map((career) => {
            const isCompared = !!selectedForCompare.find((c) => c.id === career.id);
            return (
              <TouchableOpacity
                key={career.id}
                activeOpacity={0.85}
                onPress={() => router.push(`/career/${career.id}`)}
              >
                <Card style={styles.careerCard}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.careerName}>{career.name}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                        <Text style={styles.careerCategory}>{career.category}</Text>
                        <Text style={styles.dotSeparator}>•</Text>
                        <Text style={styles.prepTimeText}>
                          ~{career.estimatedPreparationWeeks || 12} wks prep
                        </Text>
                      </View>
                    </View>

                    <View style={styles.scoreWrap}>
                      <Text style={[styles.scoreText, { color: getScoreColor(career.compatibilityScore) }]}>
                        {career.compatibilityScore.toFixed(0)}%
                      </Text>
                      <Text style={styles.scoreLabel}>Match</Text>
                    </View>
                  </View>

                  <Text style={styles.description} numberOfLines={2}>
                    {career.description}
                  </Text>

                  <View style={styles.cardFooter}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      {getReadinessBadge(career.readinessLevel)}
                      {getDifficultyBadge(career.difficulty)}
                    </View>

                    <TouchableOpacity
                      style={[styles.compareToggleBtn, isCompared && styles.compareToggleBtnActive]}
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleCompareCareer(career);
                      }}
                    >
                      <Text style={[styles.compareToggleText, isCompared && styles.compareToggleTextActive]}>
                        {isCompared ? "✓ Compared" : "+ Compare"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Compare Careers Modal */}
      <Modal visible={compareModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBody}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Side-by-Side Career Comparison</Text>
              <TouchableOpacity onPress={() => setCompareModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedForCompare.length === 2 && (
              <View style={styles.compareGrid}>
                <View style={styles.compareCol}>
                  <Text style={styles.colRoleTitle}>{selectedForCompare[0].name}</Text>
                  <Text style={styles.colCategory}>{selectedForCompare[0].category}</Text>
                  <View style={styles.compareMetric}>
                    <Text style={styles.compareMetricLabel}>Compatibility</Text>
                    <Text style={[styles.compareMetricVal, { color: getScoreColor(selectedForCompare[0].compatibilityScore) }]}>
                      {selectedForCompare[0].compatibilityScore.toFixed(0)}%
                    </Text>
                  </View>
                  <View style={styles.compareMetric}>
                    <Text style={styles.compareMetricLabel}>Readiness</Text>
                    <Text style={styles.compareMetricValSmall}>
                      {selectedForCompare[0].readinessLevel.replace("_", " ")}
                    </Text>
                  </View>
                  <View style={styles.compareMetric}>
                    <Text style={styles.compareMetricLabel}>Prep Timeline</Text>
                    <Text style={styles.compareMetricValSmall}>
                      ~{selectedForCompare[0].estimatedPreparationWeeks || 12} weeks
                    </Text>
                  </View>
                  <Button
                    title="View Details"
                    size="sm"
                    onPress={() => {
                      setCompareModalVisible(false);
                      router.push(`/career/${selectedForCompare[0].id}`);
                    }}
                    style={{ marginTop: spacing.sm }}
                  />
                </View>

                <View style={styles.compareDivider} />

                <View style={styles.compareCol}>
                  <Text style={styles.colRoleTitle}>{selectedForCompare[1].name}</Text>
                  <Text style={styles.colCategory}>{selectedForCompare[1].category}</Text>
                  <View style={styles.compareMetric}>
                    <Text style={styles.compareMetricLabel}>Compatibility</Text>
                    <Text style={[styles.compareMetricVal, { color: getScoreColor(selectedForCompare[1].compatibilityScore) }]}>
                      {selectedForCompare[1].compatibilityScore.toFixed(0)}%
                    </Text>
                  </View>
                  <View style={styles.compareMetric}>
                    <Text style={styles.compareMetricLabel}>Readiness</Text>
                    <Text style={styles.compareMetricValSmall}>
                      {selectedForCompare[1].readinessLevel.replace("_", " ")}
                    </Text>
                  </View>
                  <View style={styles.compareMetric}>
                    <Text style={styles.compareMetricLabel}>Prep Timeline</Text>
                    <Text style={styles.compareMetricValSmall}>
                      ~{selectedForCompare[1].estimatedPreparationWeeks || 12} weeks
                    </Text>
                  </View>
                  <Button
                    title="View Details"
                    size="sm"
                    onPress={() => {
                      setCompareModalVisible(false);
                      router.push(`/career/${selectedForCompare[1].id}`);
                    }}
                    style={{ marginTop: spacing.sm }}
                  />
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Match Calculation Explanation Modal */}
      <Modal visible={showFormulaModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card style={styles.formulaCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Career Match Algorithm</Text>
              <TouchableOpacity onPress={() => setShowFormulaModal(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.formulaDesc}>
              SmartEvolve calculates compatibility scores using a weighted Euclidean skill deficit formula:
            </Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>
                Match % = Σ [ weight(s) × min(1.0, currentProficiency(s) / requiredProficiency(s)) ] / Σ [ weight(s) ] × 100%
              </Text>
            </View>
            <Text style={styles.formulaDesc}>
              • Critical foundational skills carry higher weight multipliers (1.5x - 2.0x).{"\n"}
              • Proficiency is verified through empirical assessments, YouTube project completions, and self-reports.{"\n"}
              • Job readiness thresholds: Ready (≥80%), High Potential (≥60%), Developing (≥40%), Early Stage (&lt;40%).
            </Text>
            <Button
              title="Close"
              size="sm"
              onPress={() => setShowFormulaModal(false)}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTag: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  formulaBadge: {
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  formulaBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    height: 42,
    marginBottom: spacing.xs,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    marginLeft: spacing.xs,
  },
  chipsScroll: {
    flexDirection: "row",
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  diffChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceLight,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    marginRight: 6,
  },
  diffChipActive: {
    backgroundColor: "rgba(139, 92, 246, 0.3)",
    borderColor: colors.accent,
  },
  diffChipText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  diffChipTextActive: {
    color: colors.accent,
    fontWeight: "700",
  },
  compareBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginTop: spacing.xs,
  },
  compareBarText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  compareOpenBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  compareOpenBtnText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: "800",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  careerCard: {
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  careerName: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "800",
  },
  careerCategory: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "600",
  },
  dotSeparator: {
    color: colors.textMuted,
    fontSize: 12,
  },
  prepTimeText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  scoreWrap: {
    alignItems: "flex-end",
  },
  scoreText: {
    fontSize: 22,
    fontWeight: "900",
  },
  scoreLabel: {
    color: colors.textMuted,
    fontSize: 10,
    textTransform: "uppercase",
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginVertical: spacing.sm,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopColor: colors.cardBorder,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  compareToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  compareToggleBtnActive: {
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    borderColor: colors.primary,
  },
  compareToggleText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  compareToggleTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    padding: spacing.md,
  },
  modalBody: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderColor: colors.cardBorder,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  modalCloseText: {
    color: colors.textMuted,
    fontSize: 18,
    fontWeight: "700",
  },
  compareGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  compareCol: {
    flex: 1,
  },
  compareDivider: {
    width: 1,
    backgroundColor: colors.cardBorder,
  },
  colRoleTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "800",
  },
  colCategory: {
    color: colors.accent,
    fontSize: 11,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  compareMetric: {
    marginVertical: 4,
  },
  compareMetricLabel: {
    color: colors.textMuted,
    fontSize: 10,
    textTransform: "uppercase",
  },
  compareMetricVal: {
    fontSize: 18,
    fontWeight: "900",
  },
  compareMetricValSmall: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  formulaCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  formulaDesc: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginVertical: spacing.xs,
  },
  codeBlock: {
    backgroundColor: colors.background,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginVertical: spacing.sm,
  },
  codeText: {
    color: colors.accent,
    fontSize: 11,
    fontFamily: "monospace",
    lineHeight: 16,
  },
});
