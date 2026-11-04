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
  Alert,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { colors, radius, spacing } from "../theme/colors";
import { Button } from "./Button";

interface AiMentorModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AiMentorModal({ visible, onClose }: AiMentorModalProps) {
  const [question, setQuestion] = useState("");
  const [chatLog, setChatLog] = useState<
    Array<{ sender: "user" | "gemini"; text: string; isGemini?: boolean }>
  >([]);
  const [isAsking, setIsAsking] = useState(false);

  const {
    data: aiHealth,
    isLoading: isHealthLoading,
    refetch: refetchHealth,
  } = useQuery({
    queryKey: ["aiHealth"],
    queryFn: () => api.checkAiHealth(),
    enabled: visible,
  });

  const handleSendQuestion = async (customText?: string) => {
    const textToSend = customText || question.trim();
    if (!textToSend) return;

    setQuestion("");
    setChatLog((prev) => [...prev, { sender: "user", text: textToSend }]);
    setIsAsking(true);

    try {
      const res = await api.askAiMentor(textToSend);
      setChatLog((prev) => [
        ...prev,
        {
          sender: "gemini",
          text: res.reply || "AI Mentor response received.",
          isGemini: res.isGeminiPowered || res.aiProvider === "GEMINI",
        },
      ]);
    } catch (err: any) {
      setChatLog((prev) => [
        ...prev,
        {
          sender: "gemini",
          text:
            "I could not connect to the cloud AI service at this moment. If the backend is waking up, please allow ~30s and try again.",
          isGemini: false,
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const QUICK_QUESTIONS = [
    "How can I become a Full Stack Engineer?",
    "What projects should I build for my portfolio?",
    "Explain how SmartEvolve blockchain verification works",
  ];

  const isGeminiLive = aiHealth?.status === "ONLINE" || aiHealth?.working === true;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTag}>SMARTEVOLVE COGNITIVE ADVISOR</Text>
              <Text style={styles.headerTitle}>Google Gemini AI Mentor</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* AI Connection Status Banner */}
          <View
            style={[
              styles.healthBanner,
              isGeminiLive ? styles.healthOnline : styles.healthPending,
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.healthTitle,
                  { color: isGeminiLive ? colors.success : colors.warning },
                ]}
              >
                {isGeminiLive
                  ? "🟢 Google Gemini AI: Active & Operational"
                  : aiHealth?.status === "NOT_CONFIGURED"
                  ? "🟡 Gemini Key Not Set in Render"
                  : "⏳ Checking Gemini AI Cloud Connection..."}
              </Text>
              <Text style={styles.healthSub}>
                {aiHealth?.message ||
                  (isHealthLoading
                    ? "Testing Gemini 1.5 Flash endpoint..."
                    : "Ready for live cognitive skill analysis.")}
              </Text>
              {aiHealth?.latencyMs ? (
                <Text style={styles.healthLatency}>
                  Latency: {aiHealth.latencyMs}ms • Model: {aiHealth.model || "gemini-1.5-flash"}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity style={styles.refreshHealthBtn} onPress={() => refetchHealth()}>
              <Text style={styles.refreshHealthBtnText}>🔄 Test</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Prompts */}
          <View style={styles.quickPromptsWrap}>
            <Text style={styles.quickPromptsLabel}>Quick Prompts:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {QUICK_QUESTIONS.map((q, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.quickChip}
                  onPress={() => handleSendQuestion(q)}
                >
                  <Text style={styles.quickChipText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Chat Messages */}
          <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
            {chatLog.length === 0 ? (
              <View style={styles.emptyChat}>
                <Text style={styles.emptyChatEmoji}>🤖✨</Text>
                <Text style={styles.emptyChatTitle}>Ask Gemini AI Anything</Text>
                <Text style={styles.emptyChatSub}>
                  Ask technical questions, get advice on required skills, career roadmaps, or interview prep.
                </Text>
              </View>
            ) : (
              chatLog.map((msg, i) => (
                <View
                  key={i}
                  style={[
                    styles.msgBubble,
                    msg.sender === "user" ? styles.userBubble : styles.geminiBubble,
                  ]}
                >
                  {msg.sender === "gemini" && (
                    <Text style={styles.geminiBadge}>
                      {msg.isGemini ? "✨ Powered by Google Gemini" : "💡 Adaptive AI Mentor"}
                    </Text>
                  )}
                  <Text style={styles.msgText}>{msg.text}</Text>
                </View>
              ))
            )}
            {isAsking && (
              <View style={[styles.msgBubble, styles.geminiBubble, { flexDirection: "row", gap: 8, alignItems: "center" }]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.msgText}>Gemini AI is analyzing...</Text>
              </View>
            )}
          </ScrollView>

          {/* Input Bar */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Ask Gemini AI (e.g. How to master Spring Boot?)..."
              placeholderTextColor={colors.textMuted}
              value={question}
              onChangeText={setQuestion}
              onSubmitEditing={() => handleSendQuestion()}
            />
            <Button
              title="Send ➔"
              size="sm"
              onPress={() => handleSendQuestion()}
              loading={isAsking}
              disabled={!question.trim()}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  modalCard: {
    width: "100%",
    maxWidth: 680,
    height: "90%",
    maxHeight: 700,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.surfaceLight,
  },
  headerTag: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  healthBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  healthOnline: {
    backgroundColor: "rgba(16, 185, 129, 0.08)",
  },
  healthPending: {
    backgroundColor: "rgba(245, 158, 11, 0.08)",
  },
  healthTitle: {
    fontSize: 12,
    fontWeight: "800",
  },
  healthSub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  healthLatency: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
    fontFamily: "monospace",
  },
  refreshHealthBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  refreshHealthBtnText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: "700",
  },
  quickPromptsWrap: {
    padding: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  quickPromptsLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 4,
  },
  quickChip: {
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    borderColor: "rgba(99, 102, 241, 0.3)",
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  quickChipText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "600",
  },
  chatScroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chatContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  emptyChat: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
  },
  emptyChatEmoji: {
    fontSize: 36,
    marginBottom: spacing.xs,
  },
  emptyChatTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  emptyChatSub: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    maxWidth: 340,
    marginTop: 4,
    lineHeight: 18,
  },
  msgBubble: {
    padding: spacing.md,
    borderRadius: radius.md,
    maxWidth: "88%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
  },
  geminiBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
  },
  geminiBadge: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  msgText: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
});
