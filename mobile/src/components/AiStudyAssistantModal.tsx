import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  StyleProp,
  ViewStyle,
} from "react-native";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { api } from "../api/client";
import { StudyAssistantResponse } from "../types";
import { colors, radius, spacing } from "../theme/colors";

interface AiStudyAssistantModalProps {
  visible: boolean;
  onClose: () => void;
  initialTopic?: string;
  skillId?: string;
}

export const AiStudyAssistantModal: React.FC<AiStudyAssistantModalProps> = ({
  visible,
  onClose,
  initialTopic,
  skillId,
}) => {
  const [question, setQuestion] = useState(initialTopic || "");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<StudyAssistantResponse | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswerExplanation, setShowAnswerExplanation] = useState(false);

  const quickPrompts = [
    "Explain System Design Scalability",
    "Python Concurrency vs Threading",
    "How does Spring Boot Dependency Injection work?",
    "Machine Learning Gradient Descent intuition",
  ];

  const handleSend = async (customPrompt?: string) => {
    const q = (customPrompt || question).trim();
    if (!q) return;

    setLoading(true);
    setSelectedOption(null);
    setShowAnswerExplanation(false);

    try {
      const res = await api.askStudyAssistant({
        question: q,
        skillId,
        topicTitle: q,
        contextMode: "EXPLANATION",
      });
      setResponse(res);
      if (customPrompt) setQuestion(customPrompt);
    } catch (err: any) {
      setResponse({
        answer: "SmartEvolve AI study engine is connecting. Please check your query or verify network connectivity.",
        keyConcepts: ["System Architecture", "Continuous Learning"],
        recommendedTopics: ["Software Engineering Fundamentals"],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (index: number) => {
    setSelectedOption(index);
    setShowAnswerExplanation(true);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.aiBadge}>
                <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2.5">
                  <Circle cx="12" cy="12" r="10" />
                  <Path d="M12 16v-4M12 8h.01" />
                </Svg>
                <Text style={styles.aiBadgeText}>SmartEvolve AI Tutor</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="2">
                  <Path d="M18 6L6 18M6 6l12 12" />
                </Svg>
              </TouchableOpacity>
            </View>
            <Text style={styles.headerSubtitle}>
              Ask conceptual questions, request deep-dive explanations, or practice interview scenarios.
            </Text>
          </View>

          {/* Quick Prompts Bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickPromptsContainer}
          >
            {quickPrompts.map((p, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.promptChip}
                onPress={() => handleSend(p)}
              >
                <Text style={styles.promptChipText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Response Scroll Area */}
          <ScrollView style={styles.responseArea} contentContainerStyle={styles.responseContent}>
            {loading ? (
              <View style={styles.loaderWrap}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Synthesizing personalized explanation...</Text>
              </View>
            ) : response ? (
              <View>
                {/* Main Markdown Text */}
                <View style={styles.answerCard}>
                  <Text style={styles.answerText}>{response.answer}</Text>
                </View>

                {/* Key Concepts */}
                {response.keyConcepts && response.keyConcepts.length > 0 && (
                  <View style={styles.conceptsSection}>
                    <Text style={styles.sectionHeader}>Key Concepts to Master:</Text>
                    <View style={styles.conceptsRow}>
                      {response.keyConcepts.map((c, i) => (
                        <View key={i} style={styles.conceptTag}>
                          <Text style={styles.conceptTagText}>• {c}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Interactive Practice Question */}
                {response.practiceQuestion && (
                  <View style={styles.quizBox}>
                    <View style={styles.quizBoxHeader}>
                      <Text style={styles.quizBadgeText}>🎯 Knowledge Check Scenario</Text>
                    </View>
                    <Text style={styles.quizQuestionText}>
                      {response.practiceQuestion.questionText}
                    </Text>

                    <View style={styles.optionsList}>
                      {response.practiceQuestion.options.map((opt, i) => {
                        const isSelected = selectedOption === i;
                        const isCorrect = i === response.practiceQuestion?.correctOptionIndex;
                        let optionStyle: StyleProp<ViewStyle> = styles.optionItem;
                        if (showAnswerExplanation) {
                          if (isCorrect) optionStyle = [styles.optionItem, styles.correctOption];
                          else if (isSelected && !isCorrect)
                            optionStyle = [styles.optionItem, styles.wrongOption];
                        } else if (isSelected) {
                          optionStyle = [styles.optionItem, styles.selectedOption];
                        }

                        return (
                          <TouchableOpacity
                            key={i}
                            style={optionStyle}
                            onPress={() => handleSelectOption(i)}
                          >
                            <Text style={styles.optionText}>{opt}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {showAnswerExplanation && (
                      <View style={styles.explanationCard}>
                        <Text style={styles.explanationTitle}>
                          {selectedOption === response.practiceQuestion.correctOptionIndex
                            ? "✓ Correct Answer!"
                            : "Insight & Explanation:"}
                        </Text>
                        <Text style={styles.explanationText}>
                          {response.practiceQuestion.explanation}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Recommended Roadmap Topics */}
                {response.recommendedTopics && response.recommendedTopics.length > 0 && (
                  <View style={styles.recSection}>
                    <Text style={styles.sectionHeader}>Suggested Roadmap Topics:</Text>
                    {response.recommendedTopics.map((t, idx) => (
                      <View key={idx} style={styles.recItem}>
                        <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="2.5">
                          <Path d="M5 12h14M12 5l7 7-7 7" />
                        </Svg>
                        <Text style={styles.recItemText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="1.5">
                  <Circle cx="12" cy="12" r="10" />
                  <Path d="M12 8v4M12 16h.01" />
                </Svg>
                <Text style={styles.emptyTitle}>What would you like to master today?</Text>
                <Text style={styles.emptySub}>
                  Type a technical question below or tap any quick suggestion above to begin.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Input Bottom Bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask anything (e.g., 'How does Kahn's algorithm work?')"
              placeholderTextColor={colors.textMuted}
              value={question}
              onChangeText={setQuestion}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendBtn, !question.trim() && { opacity: 0.5 }]}
              onPress={() => handleSend()}
              disabled={loading || !question.trim()}
            >
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5">
                <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </Svg>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    height: Platform.OS === "web" ? "88%" : "90%",
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  aiBadgeText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  closeBtn: {
    padding: spacing.xs,
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  quickPromptsContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  promptChip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  promptChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  responseArea: {
    flex: 1,
  },
  responseContent: {
    padding: spacing.md,
  },
  loaderWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  answerCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  answerText: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
  },
  conceptsSection: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  conceptsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  conceptTag: {
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  conceptTagText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "600",
  },
  quizBox: {
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)",
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  quizBoxHeader: {
    marginBottom: spacing.xs,
  },
  quizBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  quizQuestionText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  optionsList: {
    gap: spacing.xs,
  },
  optionItem: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
  },
  selectedOption: {
    borderColor: colors.primary,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
  },
  correctOption: {
    borderColor: colors.success,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  wrongOption: {
    borderColor: colors.error,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },
  optionText: {
    color: colors.textPrimary,
    fontSize: 13,
  },
  explanationCard: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: radius.sm,
  },
  explanationTitle: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  explanationText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  recSection: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  recItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: 4,
  },
  recItemText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
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
    maxWidth: 320,
    lineHeight: 18,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: 14,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
