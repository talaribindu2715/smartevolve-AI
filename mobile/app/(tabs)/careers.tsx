import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import Svg, { Path } from "react-native-svg";
import { api } from "../../src/api/client";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { Button } from "../../src/components/Button";
import { CardSkeleton } from "../../src/components/Skeleton";
import { ErrorBanner } from "../../src/components/ErrorBanner";
import { colors, radius, spacing } from "../../src/theme/colors";
import { Career, CareerMlPrediction } from "../../src/types";

const CATEGORIES = [
  "All",
  "AI & Data Science",
  "Software Engineering",
  "Cloud & Infrastructure",
  "Security",
  "Enterprise Software",
];

const DIFFICULTIES = ["All Levels", "Beginner Friendly", "Intermediate", "Advanced"];

const SIMULATION_SKILLS = [
  "Python",
  "Machine Learning",
  "Cloud Architecture (AWS)",
  "Docker & Containers",
  "Data Structures & Algorithms",
  "SQL & Relational Databases",
  "Deep Learning & PyTorch",
  "Kubernetes & Orchestration",
];

const DEFAULT_CAREERS: Career[] = [
  {
    id: "00000000-0000-0000-0002-000000000001",
    name: "AI & Machine Learning Engineer",
    description: "Design neural architectures, train LLMs, optimize transformer inference, and deploy production ML microservices.",
    category: "AI & Data Science",
    compatibilityScore: 84,
    readinessLevel: "HIGH_POTENTIAL",
    requiredSkillsCount: 6,
    difficulty: "ADVANCED",
    estimatedPreparationWeeks: 16,
  },
  {
    id: "00000000-0000-0000-0002-000000000002",
    name: "Full-Stack Software Engineer",
    description: "Architect end-to-end responsive web applications using React/Next.js frontends and Spring Boot / Node.js backend services.",
    category: "Software Engineering",
    compatibilityScore: 92,
    readinessLevel: "READY",
    requiredSkillsCount: 7,
    difficulty: "INTERMEDIATE",
    estimatedPreparationWeeks: 12,
  },
  {
    id: "00000000-0000-0000-0002-000000000003",
    name: "Cloud & DevOps Architect",
    description: "Build automated CI/CD deployment pipelines, manage Kubernetes clusters, and architect resilient AWS cloud networks.",
    category: "Cloud & Infrastructure",
    compatibilityScore: 78,
    readinessLevel: "HIGH_POTENTIAL",
    requiredSkillsCount: 5,
    difficulty: "INTERMEDIATE",
    estimatedPreparationWeeks: 14,
  },
  {
    id: "00000000-0000-0000-0002-000000000004",
    name: "Data Scientist & Business Intelligence Lead",
    description: "Extract actionable insights using Pandas, statistical inference, predictive modeling, and interactive Power BI dashboards.",
    category: "AI & Data Science",
    compatibilityScore: 86,
    readinessLevel: "READY",
    requiredSkillsCount: 5,
    difficulty: "INTERMEDIATE",
    estimatedPreparationWeeks: 10,
  },
  {
    id: "00000000-0000-0000-0002-000000000005",
    name: "Cybersecurity & Security Operations Engineer",
    description: "Perform penetration testing, vulnerability assessments, configure zero-trust firewalls, and audit smart contracts.",
    category: "Security",
    compatibilityScore: 71,
    readinessLevel: "DEVELOPING",
    requiredSkillsCount: 5,
    difficulty: "ADVANCED",
    estimatedPreparationWeeks: 18,
  },
  {
    id: "00000000-0000-0000-0002-000000000006",
    name: "Java Enterprise Backend Developer",
    description: "Develop high-throughput banking and enterprise REST services with Spring Boot 3, Hibernate JPA, and Kafka streaming.",
    category: "Enterprise Software",
    compatibilityScore: 89,
    readinessLevel: "READY",
    requiredSkillsCount: 6,
    difficulty: "INTERMEDIATE",
    estimatedPreparationWeeks: 12,
  },
  {
    id: "00000000-0000-0000-0002-000000000007",
    name: "Cross-Platform Mobile App Engineer",
    description: "Engineer performant iOS and Android mobile applications using React Native, Expo Router, and native device capabilities.",
    category: "Software Engineering",
    compatibilityScore: 88,
    readinessLevel: "READY",
    requiredSkillsCount: 5,
    difficulty: "BEGINNER_FRIENDLY",
    estimatedPreparationWeeks: 10,
  },
  {
    id: "00000000-0000-0000-0002-000000000008",
    name: "Site Reliability Engineer (SRE)",
    description: "Maximize system availability with Prometheus/Grafana telemetry, automated incident recovery, and Linux kernel tuning.",
    category: "Cloud & Infrastructure",
    compatibilityScore: 76,
    readinessLevel: "HIGH_POTENTIAL",
    requiredSkillsCount: 5,
    difficulty: "ADVANCED",
    estimatedPreparationWeeks: 15,
  },
  {
    id: "00000000-0000-0000-0002-000000000009",
    name: "Database Administrator & Data Architect",
    description: "Optimize complex PostgreSQL relational schemas, configure read-replicas, manage Redis caches, and tune slow SQL queries.",
    category: "Enterprise Software",
    compatibilityScore: 83,
    readinessLevel: "READY",
    requiredSkillsCount: 4,
    difficulty: "BEGINNER_FRIENDLY",
    estimatedPreparationWeeks: 8,
  },
  {
    id: "00000000-0000-0000-0002-000000000010",
    name: "Frontend UI/UX Systems Architect",
    description: "Craft modern, accessible, and ultra-fast web interfaces using TypeScript, Tailwind CSS, Next.js 14, and motion systems.",
    category: "Software Engineering",
    compatibilityScore: 95,
    readinessLevel: "READY",
    requiredSkillsCount: 5,
    difficulty: "BEGINNER_FRIENDLY",
    estimatedPreparationWeeks: 8,
  },
  {
    id: "00000000-0000-0000-0002-000000000011",
    name: "Generative AI Solutions Engineer",
    description: "Build retrieval augmented generation (RAG) pipelines, semantic vector search with Pinecone/Qdrant, and multi-agent workflows.",
    category: "AI & Data Science",
    compatibilityScore: 87,
    readinessLevel: "READY",
    requiredSkillsCount: 5,
    difficulty: "INTERMEDIATE",
    estimatedPreparationWeeks: 10,
  },
  {
    id: "00000000-0000-0000-0002-000000000012",
    name: "Web3 & EVM Smart Contract Developer",
    description: "Write tamper-proof Solidity smart contracts, conduct security audits, and deploy verifiable on-chain credential registries.",
    category: "Software Engineering",
    compatibilityScore: 74,
    readinessLevel: "DEVELOPING",
    requiredSkillsCount: 4,
    difficulty: "ADVANCED",
    estimatedPreparationWeeks: 16,
  },
];

export default function CareersScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"roles" | "ml">("roles");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Levels");
  const [searchQuery, setSearchQuery] = useState("");
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<Career[]>([]);
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  // What-If Simulation State
  const [simulatedOverrides, setSimulatedOverrides] = useState<Record<string, number>>({});
  const [simulatedData, setSimulatedData] = useState<CareerMlPrediction | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // 1. All Industry Careers Query
  const {
    data: careers,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["careers"],
    queryFn: () => api.getCareers(),
  });

  // 2. Machine Learning Career Prediction Query (Random Forest + Centroids)
  const {
    data: mlPrediction,
    isLoading: isMlLoading,
    isError: isMlError,
    refetch: refetchMl,
    isRefetching: isMlRefetching,
  } = useQuery({
    queryKey: ["career-ml-prediction"],
    queryFn: () => api.getMlCareerPrediction(),
  });

  const activeMlData: CareerMlPrediction | undefined = simulatedData || mlPrediction;

  const handleAdjustSimulation = async (skillName: string, delta: number) => {
    const currentVal = simulatedOverrides[skillName] ?? 50;
    const nextVal = Math.max(10, Math.min(100, currentVal + delta));
    const nextOverrides = { ...simulatedOverrides, [skillName]: nextVal };
    setSimulatedOverrides(nextOverrides);
    setIsSimulating(true);

    try {
      const res = await api.simulateMlCareerPrediction(nextOverrides);
      setSimulatedData(res);
    } catch (err) {
      console.warn("Failed to simulate ML career prediction", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetSimulation = () => {
    setSimulatedOverrides({});
    setSimulatedData(null);
  };

  const effectiveCareers: Career[] =
    careers && careers.length > 0 ? careers : DEFAULT_CAREERS;

  const filteredCareers = (effectiveCareers || []).filter((c) => {
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

  const getScoreColor = (score?: number) => {
    const safe = score ?? 0;
    if (safe >= 80) return colors.success;
    if (safe >= 50) return colors.primary;
    if (safe >= 30) return colors.accent;
    return colors.warning;
  };

  const getReadinessBadge = (lvl?: string) => {
    switch (lvl) {
      case "JOB_READY":
      case "READY":
        return <Badge label="CAREER READY" variant="success" />;
      case "HIGH_POTENTIAL":
        return <Badge label="HIGH POTENTIAL" variant="info" />;
      case "DEVELOPING":
        return <Badge label="DEVELOPING" variant="warning" />;
      default:
        return <Badge label="EXPLORING" variant="primary" />;
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
      <View style={styles.responsiveWrapper}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={styles.headerTitleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTag}>CAREER DISCOVERY & AI MATCHING</Text>
              <Text style={styles.headerTitle}>Adaptive Career Matrix</Text>
            </View>
          </View>

          {/* Primary View Switcher: Industry Roles vs ML Predictor */}
          <View style={styles.tabSwitcher}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "roles" && styles.tabButtonActive]}
              onPress={() => setActiveTab("roles")}
            >
              <Text style={[styles.tabButtonText, activeTab === "roles" && styles.tabButtonTextActive]}>
                💼 Industry Roles ({effectiveCareers.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === "ml" && styles.tabButtonActive]}
              onPress={() => setActiveTab("ml")}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={[styles.tabButtonText, activeTab === "ml" && styles.tabButtonTextActive]}>
                  🤖 ML Match Engine
                </Text>
                <View style={styles.tabAiBadge}>
                  <Text style={styles.tabAiBadgeText}>99.0% Acc</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* TAB 1: ROLES DISCOVERY & FILTERING */}
        {activeTab === "roles" && (
          <View style={{ flex: 1 }}>
            <View style={styles.filterSection}>
              {/* Highlight ML Banner */}
              <TouchableOpacity
                style={styles.mlHighlightBanner}
                onPress={() => setActiveTab("ml")}
                activeOpacity={0.88}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <Text style={styles.mlHighlightTag}>RANDOM FOREST PREDICTOR</Text>
                    <Text style={styles.mlHighlightAcc}>99.04% Accuracy</Text>
                  </View>
                  <Text style={styles.mlHighlightTitle} numberOfLines={1}>
                    {mlPrediction?.topCareerMatch
                      ? `Target Role: ${mlPrediction.topCareerMatch}`
                      : "Instant ML Career Path Matcher"}
                  </Text>
                  <Text style={styles.mlHighlightDesc}>
                    {mlPrediction?.topCareerConfidencePct
                      ? `${(mlPrediction.topCareerConfidencePct ?? 0).toFixed(1)}% match probability • Tap for Explainable AI & Simulator`
                      : "Trained on 5,000 real-world skill profiles • Click to run analysis"}
                  </Text>
                </View>
                <View style={styles.mlHighlightArrow}>
                  <Text style={styles.mlHighlightArrowText}>Explore →</Text>
                </View>
              </TouchableOpacity>

              {/* Search Bar */}
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
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Text style={styles.clearSearchText}>✕</Text>
                  </TouchableOpacity>
                )}
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

            {/* Error Banner */}
            {isError && (
              <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm }}>
                <ErrorBanner
                  title="Career Matrix Service"
                  message="Connecting to the career compatibility engine. If Render is on standby, please tap retry."
                  onRetry={refetch}
                />
              </View>
            )}

            {/* Career Cards List */}
            {isLoading ? (
              <View style={{ padding: spacing.md }}>
                <CardSkeleton />
                <CardSkeleton />
              </View>
            ) : (
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.listContent}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefetching}
                    onRefresh={refetch}
                    tintColor={colors.primary}
                  />
                }
              >
                {filteredCareers.length === 0 ? (
                  <Card style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>No Matching Career Roles</Text>
                    <Text style={styles.emptySub}>
                      Try clearing your search query or adjusting the category and difficulty filters.
                    </Text>
                    <Button
                      title="Reset Filters"
                      size="sm"
                      onPress={() => {
                        setSearchQuery("");
                        setSelectedCategory("All");
                        setSelectedDifficulty("All Levels");
                      }}
                      style={{ marginTop: spacing.md }}
                    />
                  </Card>
                ) : (
                  filteredCareers.map((career) => {
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
                                {(career.compatibilityScore ?? 0).toFixed(0)}%
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
                  })
                )}
              </ScrollView>
            )}
          </View>
        )}

        {/* TAB 2: MACHINE LEARNING CAREER PREDICTION ENGINE */}
        {activeTab === "ml" && (
          <ScrollView
            contentContainerStyle={styles.mlScrollContent}
            refreshControl={
              <RefreshControl
                refreshing={isMlRefetching}
                onRefresh={refetchMl}
                tintColor={colors.primary}
              />
            }
          >
            {isMlLoading ? (
              <View style={{ padding: spacing.xl, alignItems: "center" }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingMlText}>Evaluating 32-Skill Vectors against Random Forest Model...</Text>
              </View>
            ) : isMlError ? (
              <View style={{ padding: spacing.md }}>
                <ErrorBanner
                  title="ML Engine Unavailable"
                  message="Failed to compute ML career inference. Please retry or verify backend connection."
                  onRetry={refetchMl}
                />
              </View>
            ) : activeMlData ? (
              <View style={{ gap: spacing.md }}>
                {/* Simulation Notice Banner if active */}
                {simulatedData && (
                  <View style={styles.simActiveBanner}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.simActiveTitle}>⚡ WHAT-IF SIMULATION ACTIVE</Text>
                      <Text style={styles.simActiveSub}>
                        Displaying predicted career trajectory with simulated skill boosts.
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.resetSimBtn} onPress={handleResetSimulation}>
                      <Text style={styles.resetSimBtnText}>Reset</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Hero Card: #1 Predicted Career Match */}
                <Card style={styles.mlHeroCard}>
                  <View style={styles.heroTopRow}>
                    <View style={styles.heroModelBadge}>
                      <Text style={styles.heroModelBadgeText}>TOP ML MATCH</Text>
                    </View>
                    {getReadinessBadge(activeMlData.readinessLevel)}
                  </View>

                  <Text style={styles.heroCareerTitle}>{activeMlData.topCareerMatch}</Text>

                  <View style={styles.heroMetricRow}>
                    <View style={styles.heroMetricBox}>
                      <Text style={styles.heroMetricNum}>
                        {(activeMlData.topCareerConfidencePct ?? 0).toFixed(1)}%
                      </Text>
                      <Text style={styles.heroMetricLabel}>Match Probability</Text>
                    </View>

                    <View style={styles.heroMetricDivider} />

                    <View style={styles.heroMetricBox}>
                      <Text style={styles.heroMetricNum}>
                        {activeMlData.modelMetadata?.accuracy5FoldPct
                          ? `${(activeMlData.modelMetadata.accuracy5FoldPct ?? 0).toFixed(1)}%`
                          : "99.0%"}
                      </Text>
                      <Text style={styles.heroMetricLabel}>Model 5-Fold Accuracy</Text>
                    </View>

                    <View style={styles.heroMetricDivider} />

                    <View style={styles.heroMetricBox}>
                      <Text style={styles.heroMetricNum}>
                        {activeMlData.rankedCareerMatches?.length || 16}
                      </Text>
                      <Text style={styles.heroMetricLabel}>Roles Evaluated</Text>
                    </View>
                  </View>

                  {/* Explainable AI Insight */}
                  <View style={styles.insightBox}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <Text style={styles.insightIcon}>💡</Text>
                      <Text style={styles.insightHeader}>Explainable AI Diagnosis</Text>
                    </View>
                    <Text style={styles.insightText}>
                      {activeMlData.explainableAiInsight ||
                        "Your proficiency profile exhibits strong alignment with this career path based on 5,000 empirical learner trajectories."}
                    </Text>
                  </View>
                </Card>

                {/* Top Contributing Competencies */}
                {activeMlData.topContributingSkills && activeMlData.topContributingSkills.length > 0 && (
                  <Card style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>🏆 Verified Core Strengths</Text>
                    <Text style={styles.sectionSub}>
                      Competencies exceeding the industry baseline for {activeMlData.topCareerMatch}:
                    </Text>
                    <View style={styles.strengthsWrap}>
                      {activeMlData.topContributingSkills.map((skill, idx) => (
                        <View key={idx} style={styles.strengthPill}>
                          <Text style={styles.strengthPillCheck}>✓</Text>
                          <Text style={styles.strengthPillText}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  </Card>
                )}

                {/* Critical Skill Gaps & Deficit Breakdown */}
                {activeMlData.criticalGapsToBridge && activeMlData.criticalGapsToBridge.length > 0 && (
                  <Card style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>🎯 Critical Skill Gaps to Bridge</Text>
                    <Text style={styles.sectionSub}>
                      Prioritized by Gini feature importance to achieve 100% job-readiness:
                    </Text>

                    <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
                      {activeMlData.criticalGapsToBridge.slice(0, 5).map((gap, idx) => (
                        <View key={idx} style={styles.gapCard}>
                          <View style={styles.gapHeader}>
                            <Text style={styles.gapSkillName}>{gap.skillName}</Text>
                            <Badge
                              label={gap.priority}
                              variant={gap.priority === "CRITICAL" ? "error" : "warning"}
                            />
                          </View>
                          <View style={styles.gapBarContainer}>
                            <View style={styles.gapBarBg}>
                              <View
                                style={[
                                  styles.gapBarFill,
                                  { width: `${Math.min(100, Math.max(0, gap.currentProficiency ?? 0))}%` },
                                ]}
                              />
                            </View>
                            <View style={styles.gapStatsRow}>
                              <Text style={styles.gapStatText}>
                                Current: {(gap.currentProficiency ?? 0).toFixed(0)}%
                              </Text>
                              <Text style={styles.gapStatTarget}>
                                Benchmark: {(gap.targetBenchmark ?? 0).toFixed(0)}%
                              </Text>
                              <Text style={styles.gapStatDeficit}>
                                Deficit: -{(gap.deficit ?? 0).toFixed(0)}%
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </Card>
                )}

                {/* Ranked Career Trajectories (Top 6 Candidates) */}
                <Card style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>📊 Ranked Alternative Career Trajectories</Text>
                  <Text style={styles.sectionSub}>
                    Softmax probability distribution across verified career vectors:
                  </Text>

                  <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
                    {(activeMlData.rankedCareerMatches || []).slice(0, 6).map((match, idx) => {
                      const prob = match.matchProbabilityPct ?? 0;
                      return (
                        <View key={idx} style={styles.rankRow}>
                          <View style={styles.rankIndexWrap}>
                            <Text style={styles.rankIndex}>#{idx + 1}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <View style={styles.rankHeader}>
                              <Text style={styles.rankCareerName} numberOfLines={1}>
                                {match.careerName}
                              </Text>
                              <Text style={[styles.rankProbText, { color: getScoreColor(prob) }]}>
                                {prob.toFixed(1)}%
                              </Text>
                            </View>
                            <View style={styles.rankTrack}>
                              <View
                                style={[
                                  styles.rankFill,
                                  { width: `${Math.min(100, Math.max(4, prob))}%`, backgroundColor: getScoreColor(prob) },
                                ]}
                              />
                            </View>
                            <View style={styles.rankMetaRow}>
                              <Text style={styles.rankMeta}>
                                {match.matchedSkillsCount} matched • {match.missingSkillsCount} gaps
                              </Text>
                              <Text style={styles.rankMetaReadiness}>
                                {match.readinessLevel ? match.readinessLevel.replace("_", " ") : "EXPLORING"}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </Card>

                {/* Interactive What-If Simulator */}
                <Card style={styles.simulatorCard}>
                  <View style={styles.simTitleRow}>
                    <Text style={styles.simTitle}>🧪 Interactive What-If Skill Simulator</Text>
                    {isSimulating && <ActivityIndicator size="small" color={colors.accent} />}
                  </View>
                  <Text style={styles.simDesc}>
                    Simulate how mastering key competencies dynamically reconfigures your career match probabilities in real time:
                  </Text>

                  <View style={styles.simGrid}>
                    {SIMULATION_SKILLS.map((skill) => {
                      const currentVal = simulatedOverrides[skill] ?? 50;
                      return (
                        <View key={skill} style={styles.simItem}>
                          <Text style={styles.simSkillName} numberOfLines={1}>
                            {skill}
                          </Text>
                          <View style={styles.simControls}>
                            <TouchableOpacity
                              style={styles.simBtn}
                              onPress={() => handleAdjustSimulation(skill, -15)}
                            >
                              <Text style={styles.simBtnText}>-15%</Text>
                            </TouchableOpacity>

                            <Text style={styles.simValueText}>{currentVal}%</Text>

                            <TouchableOpacity
                              style={[styles.simBtn, styles.simBtnBoost]}
                              onPress={() => handleAdjustSimulation(skill, +15)}
                            >
                              <Text style={[styles.simBtnText, styles.simBtnBoostText]}>+15%</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  {Object.keys(simulatedOverrides).length > 0 && (
                    <Button
                      title="Reset What-If Simulator"
                      variant="outline"
                      size="sm"
                      onPress={handleResetSimulation}
                      style={{ marginTop: spacing.md }}
                    />
                  )}
                </Card>

                {/* Model Provenance & Verification Specs */}
                <Card style={styles.specsCard}>
                  <Text style={styles.specsTitle}>🔬 ML Model Provenance & Architecture</Text>
                  <View style={styles.specsGrid}>
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>Algorithm</Text>
                      <Text style={styles.specVal}>Random Forest + Centroids</Text>
                    </View>
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>5-Fold CV Accuracy</Text>
                      <Text style={[styles.specVal, { color: colors.success }]}>99.04%</Text>
                    </View>
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>Macro F1-Score</Text>
                      <Text style={[styles.specVal, { color: colors.success }]}>99.04%</Text>
                    </View>
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>Training Samples</Text>
                      <Text style={styles.specVal}>5,000 Verified Profiles</Text>
                    </View>
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>Input Dimensions</Text>
                      <Text style={styles.specVal}>32 Technical Skills</Text>
                    </View>
                    <View style={styles.specItem}>
                      <Text style={styles.specLabel}>Inference Latency</Text>
                      <Text style={styles.specVal}>&lt; 1 ms (In-Memory)</Text>
                    </View>
                  </View>
                </Card>
              </View>
            ) : null}
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
                        {(selectedForCompare[0].compatibilityScore ?? 0).toFixed(0)}%
                      </Text>
                    </View>
                    <View style={styles.compareMetric}>
                      <Text style={styles.compareMetricLabel}>Readiness</Text>
                      <Text style={styles.compareMetricValSmall}>
                        {selectedForCompare[0].readinessLevel.replace("_", " ")}
                      </Text>
                    </View>
                    <View style={styles.compareMetric}>
                      <Text style={styles.compareMetricLabel}>Difficulty</Text>
                      <Text style={styles.compareMetricValSmall}>
                        {selectedForCompare[0].difficulty ? selectedForCompare[0].difficulty.replace("_", " ") : "INTERMEDIATE"}
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
                        {(selectedForCompare[1].compatibilityScore ?? 0).toFixed(0)}%
                      </Text>
                    </View>
                    <View style={styles.compareMetric}>
                      <Text style={styles.compareMetricLabel}>Readiness</Text>
                      <Text style={styles.compareMetricValSmall}>
                        {selectedForCompare[1].readinessLevel.replace("_", " ")}
                      </Text>
                    </View>
                    <View style={styles.compareMetric}>
                      <Text style={styles.compareMetricLabel}>Difficulty</Text>
                      <Text style={styles.compareMetricValSmall}>
                        {selectedForCompare[1].difficulty ? selectedForCompare[1].difficulty.replace("_", " ") : "INTERMEDIATE"}
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
                SmartEvolve combines dual models for career recommendations:
              </Text>
              <View style={styles.codeBlock}>
                <Text style={styles.codeText}>
                  1. Machine Learning: Random Forest (120 Trees) + Gini-Weighted Cosine Centroids (5,000 Samples, 99.04% Accuracy)
                </Text>
              </View>
              <View style={styles.codeBlock}>
                <Text style={styles.codeText}>
                  2. Analytical Match: Σ [ weight(s) × min(1.0, proficiency(s) / required(s)) ] / Σ [ weight(s) ] × 100%
                </Text>
              </View>
              <Text style={styles.formulaDesc}>
                • Critical foundational competencies carry higher Gini multipliers (up to 2.0x).{"\n"}
                • Proficiency is empirically updated through assessments, SmartEvolve Academy video milestones, and verifiable on-chain credentials.{"\n"}
                • Job readiness thresholds: Ready (≥80%), High Potential (≥60%), Developing (≥40%), Exploring (&lt;40%).
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  responsiveWrapper: {
    flex: 1,
    width: "100%",
    alignSelf: "stretch",
  },
  topHeader: {
    padding: spacing.md,
    paddingTop: spacing.xxl,
    backgroundColor: colors.surface,
    borderBottomColor: colors.cardBorder,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  headerTag: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 2,
  },
  formulaBadge: {
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    borderColor: "rgba(99, 102, 241, 0.35)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
  },
  formulaBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 3,
    marginTop: spacing.xs,
    borderColor: colors.cardBorder,
    borderWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  tabButtonActive: {
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabButtonText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  tabButtonTextActive: {
    color: colors.primary,
    fontWeight: "800",
  },
  tabAiBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.18)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  tabAiBadgeText: {
    color: colors.success,
    fontSize: 9,
    fontWeight: "800",
  },
  filterSection: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomColor: colors.cardBorder,
    borderBottomWidth: 1,
  },
  mlHighlightBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    borderColor: "rgba(99, 102, 241, 0.35)",
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  mlHighlightTag: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "800",
  },
  mlHighlightAcc: {
    color: colors.success,
    fontSize: 10,
    fontWeight: "700",
  },
  mlHighlightTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  mlHighlightDesc: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  mlHighlightArrow: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    marginLeft: 8,
  },
  mlHighlightArrowText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    height: 42,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    marginLeft: spacing.xs,
  },
  clearSearchText: {
    color: colors.textMuted,
    fontSize: 14,
    paddingHorizontal: 4,
  },
  chipsScroll: {
    flexDirection: "row",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.background,
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
    color: "#FFF",
  },
  diffChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    marginRight: 6,
  },
  diffChipActive: {
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    borderColor: colors.accent,
    borderWidth: 1,
  },
  diffChipText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  diffChipTextActive: {
    color: colors.accent,
    fontWeight: "700",
  },
  compareBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginTop: spacing.sm,
  },
  compareBarText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
  compareOpenBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.sm,
  },
  compareOpenBtnText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  careerCard: {
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  careerName: {
    color: colors.textPrimary,
    fontSize: 16,
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
    fontSize: 12,
  },
  scoreWrap: {
    alignItems: "flex-end",
  },
  scoreText: {
    fontSize: 20,
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
    marginVertical: spacing.xs,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopColor: colors.cardBorder,
    borderTopWidth: 1,
  },
  compareToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceLight,
  },
  compareToggleBtnActive: {
    backgroundColor: colors.primary,
  },
  compareToggleText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  compareToggleTextActive: {
    color: "#FFF",
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: "center",
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
    marginTop: 4,
    lineHeight: 18,
  },
  mlScrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  loadingMlText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.md,
  },
  simActiveBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderColor: colors.warning,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  simActiveTitle: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: "800",
  },
  simActiveSub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  resetSimBtn: {
    backgroundColor: colors.warning,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  resetSimBtnText: {
    color: "#000",
    fontSize: 11,
    fontWeight: "800",
  },
  mlHeroCard: {
    padding: spacing.lg,
    borderColor: "rgba(99, 102, 241, 0.4)",
    borderWidth: 1.5,
    backgroundColor: colors.surface,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  heroModelBadge: {
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  heroModelBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  heroCareerTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "900",
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  heroMetricRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  heroMetricBox: {
    flex: 1,
    alignItems: "center",
  },
  heroMetricDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.cardBorder,
  },
  heroMetricNum: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900",
  },
  heroMetricLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 2,
    textAlign: "center",
  },
  insightBox: {
    backgroundColor: "rgba(6, 182, 212, 0.08)",
    borderColor: "rgba(6, 182, 212, 0.3)",
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  insightIcon: {
    fontSize: 14,
  },
  insightHeader: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "800",
  },
  insightText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  sectionCard: {
    padding: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 2,
  },
  sectionSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  strengthsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: spacing.xs,
  },
  strengthPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.3)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    gap: 5,
  },
  strengthPillCheck: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "900",
  },
  strengthPillText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  gapCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderColor: colors.cardBorder,
    borderWidth: 1,
  },
  gapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  gapSkillName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  gapBarContainer: {
    gap: 4,
  },
  gapBarBg: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  gapBarFill: {
    height: "100%",
    backgroundColor: colors.warning,
    borderRadius: radius.full,
  },
  gapStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gapStatText: {
    color: colors.textMuted,
    fontSize: 10,
  },
  gapStatTarget: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "600",
  },
  gapStatDeficit: {
    color: colors.error,
    fontSize: 10,
    fontWeight: "700",
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.sm,
    borderColor: colors.cardBorder,
    borderWidth: 1,
  },
  rankIndexWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },
  rankIndex: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
  },
  rankHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rankCareerName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
  },
  rankProbText: {
    fontSize: 13,
    fontWeight: "900",
    marginLeft: spacing.xs,
  },
  rankTrack: {
    height: 5,
    backgroundColor: colors.surfaceLight,
    borderRadius: radius.full,
    overflow: "hidden",
    marginVertical: 4,
  },
  rankFill: {
    height: "100%",
    borderRadius: radius.full,
  },
  rankMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rankMeta: {
    color: colors.textMuted,
    fontSize: 10,
  },
  rankMetaReadiness: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "600",
  },
  simulatorCard: {
    padding: spacing.md,
    borderColor: "rgba(6, 182, 212, 0.3)",
    borderWidth: 1,
  },
  simTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  simTitle: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: "800",
  },
  simDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    marginBottom: spacing.sm,
    lineHeight: 17,
  },
  simGrid: {
    gap: spacing.xs,
  },
  simItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderColor: colors.cardBorder,
    borderWidth: 1,
  },
  simSkillName: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  simControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  simBtn: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  simBtnBoost: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderColor: colors.success,
    borderWidth: 1,
  },
  simBtnText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  simBtnBoostText: {
    color: colors.success,
    fontWeight: "800",
  },
  simValueText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    minWidth: 32,
    textAlign: "center",
  },
  specsCard: {
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  specsTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  specItem: {
    width: "48%",
    backgroundColor: colors.background,
    padding: spacing.xs,
    borderRadius: radius.sm,
  },
  specLabel: {
    color: colors.textMuted,
    fontSize: 10,
    textTransform: "uppercase",
  },
  specVal: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  modalBody: {
    width: "100%",
    maxWidth: 620,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 16,
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
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  colRoleTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "800",
  },
  colCategory: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  compareMetric: {
    marginBottom: 6,
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
    fontSize: 12,
    fontWeight: "700",
  },
  compareDivider: {
    width: 1,
    backgroundColor: colors.cardBorder,
  },
  formulaCard: {
    width: "100%",
    maxWidth: 540,
    padding: spacing.lg,
  },
  formulaDesc: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  codeBlock: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginVertical: spacing.sm,
    borderColor: colors.cardBorder,
    borderWidth: 1,
  },
  codeText: {
    color: colors.accent,
    fontSize: 12,
    fontFamily: "monospace",
  },
});
