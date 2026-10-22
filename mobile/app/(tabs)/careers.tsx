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
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import Svg, { Path } from "react-native-svg";
import { api } from "../../src/api/client";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { colors, radius, spacing } from "../../src/theme/colors";

const CATEGORIES = [
  "All",
  "AI & Data Science",
  "Software Engineering",
  "Cloud & Infrastructure",
  "Security",
  "Enterprise Software",
];

export default function CareersScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

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
    return matchesCat && matchesSearch;
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

  return (
    <View style={styles.container}>
      {/* Top Search Bar */}
      <View style={styles.topHeader}>
        <Text style={styles.headerTag}>CAREER PATH EXPLORATION</Text>
        <Text style={styles.headerTitle}>15 Industry Career Roles</Text>

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
      </View>

      {/* Career Cards List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Analyzing 15 Career Roles...</Text>
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
          {filteredCareers.map((career) => (
            <TouchableOpacity
              key={career.id}
              activeOpacity={0.85}
              onPress={() => router.push(`/career/${career.id}`)}
            >
              <Card style={styles.careerCard}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.careerName}>{career.name}</Text>
                    <Text style={styles.careerCategory}>{career.category}</Text>
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
                  {getReadinessBadge(career.readinessLevel)}
                  <Text style={styles.skillsCount}>
                    {career.requiredSkillsCount} Core Skills Required →
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
  },
  chipsScroll: {
    marginTop: spacing.sm,
    flexDirection: "row",
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
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
    color: "#FFF",
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
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
  careerCard: {
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  careerName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  careerCategory: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  scoreWrap: {
    alignItems: "flex-end",
  },
  scoreText: {
    fontSize: 22,
    fontWeight: "800",
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
    marginVertical: spacing.xs,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 8,
  },
  skillsCount: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
});
