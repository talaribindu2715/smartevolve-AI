import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  StyleProp,
  ViewStyle,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../src/api/client";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { Button } from "../../src/components/Button";
import { AssessmentResult } from "../../src/types";
import { colors, radius, spacing } from "../../src/theme/colors";

export default function AssessmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [submittedResult, setSubmittedResult] = useState<AssessmentResult | null>(null);

  const { data: assessment, isLoading } = useQuery({
    queryKey: ["assessmentQuestions", id],
    queryFn: () => api.getAssessmentQuestions(id!),
    enabled: !!id,
  });

  // Timer
  useEffect(() => {
    if (submittedResult) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [submittedResult]);

  const submitMutation = useMutation({
    mutationFn: () => {
      const questions = assessment?.questions || [];
      const responses = questions.map((q) => ({
        questionId: q.id,
        submittedAnswer: selectedAnswers[q.id] || "",
      }));

      return api.submitAssessment({
        assessmentId: id!,
        timeTakenSeconds: elapsedSeconds,
        responses,
      });
    },
    onSuccess: (data: AssessmentResult) => {
      setSubmittedResult(data);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["activeRoadmap"] });
      queryClient.invalidateQueries({ queryKey: ["studentSkills"] });
      queryClient.invalidateQueries({ queryKey: ["evolutionHistory"] });
      queryClient.invalidateQueries({ queryKey: ["evolutionTrends"] });
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
    },
    onError: (err: any) => {
      Alert.alert("Submission Error", err.message || "Failed to submit assessment");
    },
  });

  if (isLoading || !assessment) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading Assessment Questions...</Text>
      </View>
    );
  }

  const questions = assessment.questions || [];

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (submittedResult) return; // Read-only after submission
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? "0" : ""}${remainder}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Quiz Header Bar */}
      <View style={styles.quizHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.quizTag}>{assessment.assessmentType}</Text>
          <Text style={styles.quizTitle}>{assessment.title}</Text>
          <Text style={styles.quizSkill}>Target Skill: {assessment.skillName}</Text>
        </View>

        <View style={styles.timerWrap}>
          <Text style={styles.timerVal}>{formatTimer(elapsedSeconds)}</Text>
          <Text style={styles.timerLabel}>Time Elapsed</Text>
        </View>
      </View>

      {/* Adaptive Profile Update Result Card (Shown after submission) */}
      {submittedResult && (
        <Card style={styles.resultHeroCard}>
          <View style={styles.resultTop}>
            <Text style={styles.resultTitle}>Assessment Score: {submittedResult.percentage.toFixed(0)}%</Text>
            <Badge
              label={submittedResult.percentage >= 80 ? "PASSED - MASTERY" : "ATTEMPT COMPLETED"}
              variant={submittedResult.percentage >= 80 ? "success" : "info"}
            />
          </View>

          <View style={styles.evolutionResultRow}>
            <View style={styles.evolutionCol}>
              <Text style={styles.evolutionSub}>Previous</Text>
              <Text style={styles.evolutionVal}>{submittedResult.previousProficiency.toFixed(0)}%</Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
            <View style={styles.evolutionCol}>
              <Text style={styles.evolutionSub}>Updated</Text>
              <Text style={[styles.evolutionVal, { color: colors.success }]}>
                {submittedResult.newProficiency.toFixed(0)}%
              </Text>
            </View>
            <View style={styles.deltaPill}>
              <Text style={styles.deltaPillText}>
                {submittedResult.proficiencyDelta >= 0 ? "+" : ""}
                {submittedResult.proficiencyDelta.toFixed(1)}%
              </Text>
            </View>
          </View>

          <Text style={styles.evolutionReasonText}>
            💡 {submittedResult.evolutionReason}
          </Text>

          {submittedResult.percentage >= 80 && (
            <View style={styles.blockchainPill}>
              <Text style={styles.blockchainPillText}>
                ⛓️ Milestone Verified on EVM Blockchain! Credential minted.
              </Text>
            </View>
          )}

          <Button
            title="Return to Dashboard"
            onPress={() => router.replace("/(tabs)")}
            size="sm"
            style={{ marginTop: spacing.sm }}
          />
        </Card>
      )}

      {/* Questions List */}
      <View style={styles.questionsWrap}>
        {questions.map((q, idx) => {
          let optionsList: { id: string; text: string }[] = [];
          try {
            optionsList = JSON.parse(q.options);
          } catch (_) {}

          const selected = selectedAnswers[q.id];

          // Post-submission review data
          const review = submittedResult?.questionReviews.find((r) => r.questionId === q.id);

          return (
            <Card key={q.id} style={styles.questionCard}>
              <View style={styles.questionTop}>
                <Text style={styles.questionNum}>Question {idx + 1} of {questions.length}</Text>
                <Text style={styles.questionMarks}>{q.marks} Mark{q.marks > 1 ? "s" : ""}</Text>
              </View>

              <Text style={styles.questionText}>{q.questionText}</Text>

              {/* Options */}
              <View style={styles.optionsWrap}>
                {optionsList.map((opt) => {
                  const isSelected = selected === opt.id;
                  let optStyle: StyleProp<ViewStyle> = styles.optionItem;

                  if (submittedResult && review) {
                    if (opt.id === review.correctAnswer) {
                      optStyle = [styles.optionItem, styles.optionCorrect];
                    } else if (isSelected && !review.isCorrect) {
                      optStyle = [styles.optionItem, styles.optionWrong];
                    }
                  } else if (isSelected) {
                    optStyle = [styles.optionItem, styles.optionSelected];
                  }

                  return (
                    <TouchableOpacity
                      key={opt.id}
                      activeOpacity={0.8}
                      onPress={() => handleSelectOption(q.id, opt.id)}
                      style={optStyle}
                    >
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                        <Text style={[styles.radioText, isSelected && styles.radioTextActive]}>
                          {opt.id}
                        </Text>
                      </View>
                      <Text style={styles.optionLabel}>{opt.text}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Explanation (Shown only after submission) */}
              {review && (
                <View style={styles.explanationWrap}>
                  <Text style={styles.explanationTitle}>
                    {review.isCorrect ? "✓ Correct!" : `✗ Correct Answer: Option ${review.correctAnswer}`}
                  </Text>
                  <Text style={styles.explanationBody}>{review.explanation}</Text>
                </View>
              )}
            </Card>
          );
        })}
      </View>

      {/* Submit Button (if not already submitted) */}
      {!submittedResult && (
        <Button
          title={`Submit Assessment (${Object.keys(selectedAnswers).length}/${questions.length} Answered)`}
          onPress={() => submitMutation.mutate()}
          loading={submitMutation.isPending}
          size="lg"
          style={{ marginTop: spacing.md, marginBottom: spacing.xl }}
        />
      )}
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  quizHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  quizTag: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  quizTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 2,
  },
  quizSkill: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  timerWrap: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  timerVal: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: "800",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  timerLabel: {
    color: colors.textMuted,
    fontSize: 9,
    textTransform: "uppercase",
  },
  resultHeroCard: {
    backgroundColor: colors.surface,
    borderColor: colors.success,
    borderWidth: 1.5,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  resultTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  resultTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  evolutionResultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    backgroundColor: "rgba(11, 15, 25, 0.4)",
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  evolutionCol: {
    alignItems: "center",
  },
  evolutionSub: {
    color: colors.textMuted,
    fontSize: 11,
    textTransform: "uppercase",
  },
  evolutionVal: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
  },
  arrowIcon: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: "800",
  },
  deltaPill: {
    backgroundColor: colors.successBg,
    borderRadius: radius.full,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  deltaPillText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: "800",
  },
  evolutionReasonText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginVertical: spacing.xs,
  },
  blockchainPill: {
    backgroundColor: colors.blockchainBg,
    borderColor: colors.blockchain,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  blockchainPillText: {
    color: colors.blockchain,
    fontSize: 12,
    fontWeight: "700",
  },
  questionsWrap: {
    gap: spacing.md,
  },
  questionCard: {
    padding: spacing.md,
  },
  questionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  questionNum: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  questionMarks: {
    color: colors.textMuted,
    fontSize: 12,
  },
  questionText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  optionsWrap: {
    gap: spacing.xs,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: spacing.sm,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: "rgba(99, 102, 241, 0.12)",
  },
  optionCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.successBg,
  },
  optionWrong: {
    borderColor: colors.error,
    backgroundColor: colors.errorBg,
  },
  radioCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  radioText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  radioTextActive: {
    color: "#FFF",
  },
  optionLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  explanationWrap: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  explanationTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  explanationBody: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
});
