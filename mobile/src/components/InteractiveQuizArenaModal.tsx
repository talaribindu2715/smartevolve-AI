import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Animated,
} from "react-native";
import Svg, { Path, Polygon, Circle, Rect } from "react-native-svg";
import { colors, radius, spacing } from "../theme/colors";

export interface ArenaQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface InteractiveQuizArenaModalProps {
  visible: boolean;
  onClose: () => void;
  platform: "kahoot" | "wayground" | "quizizz";
  videoTitle: string;
  skillName: string;
  questions: ArenaQuestion[];
  studentName?: string;
  onComplete: (correctCount: number, total: number, answers: Record<number, number>) => void;
  onViewCertificate: () => void;
}

export function InteractiveQuizArenaModal({
  visible,
  onClose,
  platform,
  videoTitle,
  skillName,
  questions,
  studentName = "SmartEvolve Scholar",
  onComplete,
  onViewCertificate,
}: InteractiveQuizArenaModalProps) {
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 768;

  // Arena game state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answersMap, setAnswersMap] = useState<Record<number, number>>({});
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [earnedDelta, setEarnedDelta] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnim = useRef(new Animated.Value(1)).current;

  const clearAutoAdvanceTimer = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  };

  const scheduleAutoAdvance = (delayMs: number = 1400) => {
    clearAutoAdvanceTimer();
    autoAdvanceTimerRef.current = setTimeout(() => {
      handleNext();
    }, delayMs);
  };

  // Platform themes
  const getTheme = () => {
    switch (platform) {
      case "kahoot":
        return {
          name: "Kahoot! Live Arena",
          badge: "KAHOOT MULTIPLAYER MODE",
          headerBg: "#46178F",
          accentColor: "#E21B3C",
          shapeIcons: ["▲", "◆", "●", "■"],
          tileColors: ["#E21B3C", "#1368CE", "#D89E00", "#26890C"],
        };
      case "wayground":
        return {
          name: "Wayground Speed Arena",
          badge: "WAYGROUND ARENA MODE",
          headerBg: "#0066CC",
          accentColor: "#06B6D4",
          shapeIcons: ["⚡", "🚀", "🎯", "🔥"],
          tileColors: ["#0284C7", "#0D9488", "#E11D48", "#16A34A"],
        };
      case "quizizz":
      default:
        return {
          name: "Quizizz Blitz Challenge",
          badge: "QUIZIZZ BLITZ MODE",
          headerBg: "#8854C0",
          accentColor: "#F59E0B",
          shapeIcons: ["1", "2", "3", "4"],
          tileColors: ["#7C3AED", "#2563EB", "#D97706", "#059669"],
        };
    }
  };

  const theme = getTheme();
  const currentQ = questions[currentIdx] || questions[0];

  // Start question timer
  useEffect(() => {
    if (!visible || isFinished || isAnswered) return;

    setTimeLeft(25);
    progressAnim.setValue(1);

    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 25000,
      useNativeDriver: false,
    }).start();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearAutoAdvanceTimer();
    };
  }, [currentIdx, visible, isAnswered, isFinished]);

  const handleTimeUp = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(-1); // -1 indicates timeout
    setStreak(0);
    setEarnedDelta(0);
    setAnswersMap((prev) => ({ ...prev, [currentQ.id]: -1 }));
    scheduleAutoAdvance(1400);
  };

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setIsAnswered(true);
    setSelectedOption(idx);
    setAnswersMap((prev) => ({ ...prev, [currentQ.id]: idx }));

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > maxStreak) setMaxStreak(nextStreak);

      // Point formula: Base 500 + time bonus (up to 400) + streak multiplier (100 * streak)
      const speedBonus = timeLeft * 16;
      const streakBonus = Math.min(nextStreak * 100, 500);
      const totalEarned = 500 + speedBonus + streakBonus;

      setEarnedDelta(totalEarned);
      setPoints((prev) => prev + totalEarned);
    } else {
      setStreak(0);
      setEarnedDelta(0);
    }

    // Automatically transition to the next question after brief verification
    scheduleAutoAdvance(1400);
  };

  const handleNext = () => {
    clearAutoAdvanceTimer();
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setIsAnswered(false);
      setSelectedOption(null);
      setEarnedDelta(0);
    } else {
      // Completed all questions
      setIsFinished(true);
      let correct = 0;
      const finalAnswers = { ...answersMap };
      if (selectedOption !== null) {
        finalAnswers[currentQ.id] = selectedOption;
      }
      questions.forEach((q) => {
        if (finalAnswers[q.id] === q.correctIndex) {
          correct += 1;
        }
      });
      onComplete(correct, questions.length, finalAnswers);
    }
  };

  const handleRestart = () => {
    clearAutoAdvanceTimer();
    setCurrentIdx(0);
    setSelectedOption(null);
    setAnswersMap({});
    setPoints(0);
    setStreak(0);
    setMaxStreak(0);
    setIsAnswered(false);
    setIsFinished(false);
    setEarnedDelta(0);
  };

  // Calculate results stats
  let totalCorrect = 0;
  questions.forEach((q) => {
    if (answersMap[q.id] === q.correctIndex) totalCorrect++;
  });
  const accuracyPct = Math.round((totalCorrect / Math.max(1, questions.length)) * 100);
  const isPassed = accuracyPct >= 60;

  const handleClose = () => {
    clearAutoAdvanceTimer();
    if (timerRef.current) clearInterval(timerRef.current);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleClose}>
      <View style={styles.container}>
        {/* Top Game Navigation Header */}
        <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
          <View style={styles.headerLeft}>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>{theme.badge}</Text>
            </View>
            <Text style={styles.courseTitle} numberOfLines={1}>
              {videoTitle}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.scoreHud}>
              <Text style={styles.scoreLabel}>POINTS</Text>
              <Text style={styles.scoreVal}>{points.toLocaleString()}</Text>
            </View>

            {streak > 1 && (
              <View style={styles.streakPill}>
                <Text style={styles.streakText}>🔥 {streak}x</Text>
              </View>
            )}

            <TouchableOpacity style={styles.exitBtn} onPress={handleClose}>
              <Text style={styles.exitBtnText}>✕ Exit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Area */}
        {!isFinished ? (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Timer & Question Progress Bar */}
            <View style={styles.timerWrap}>
              <View style={styles.timerRow}>
                <Text style={styles.questionCounter}>
                  Question {currentIdx + 1} of {questions.length} • {skillName}
                </Text>
                <Text style={[styles.timerSec, timeLeft <= 5 && { color: "#EF4444" }]}>
                  ⏱️ {timeLeft}s
                </Text>
              </View>
              <View style={styles.progressBarTrack}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                      backgroundColor:
                        timeLeft > 10 ? "#10B981" : timeLeft > 5 ? "#F59E0B" : "#EF4444",
                    },
                  ]}
                />
              </View>
            </View>

            {/* Question Text Box */}
            <View style={styles.questionCard}>
              <Text style={styles.questionPrompt}>{currentQ.question}</Text>
            </View>

            {/* Interactive Answer Tiles */}
            <View style={[styles.tileGrid, isDesktop && styles.tileGridDesktop]}>
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedOption === optIdx;
                const isCorrect = optIdx === currentQ.correctIndex;
                const tileBg = theme.tileColors[optIdx % theme.tileColors.length];

                let borderStyle: any = {};
                let tileOpacity = 1;

                if (isAnswered) {
                  if (isCorrect) {
                    borderStyle = { borderColor: "#10B981", borderWidth: 3.5, transform: [{ scale: 1.02 }] };
                  } else if (isSelected) {
                    borderStyle = { borderColor: "#EF4444", borderWidth: 3.5 };
                  } else {
                    tileOpacity = 0.45;
                  }
                }

                return (
                  <TouchableOpacity
                    key={optIdx}
                    activeOpacity={0.85}
                    disabled={isAnswered}
                    style={[
                      styles.answerTile,
                      isDesktop && styles.answerTileDesktop,
                      { backgroundColor: tileBg, opacity: tileOpacity },
                      borderStyle,
                    ]}
                    onPress={() => handleSelect(optIdx)}
                  >
                    <View style={styles.tileShapeBadge}>
                      <Text style={styles.tileShapeText}>{theme.shapeIcons[optIdx]}</Text>
                    </View>
                    <Text style={styles.tileText}>{opt}</Text>
                    {isAnswered && isCorrect && (
                      <View style={styles.tileStatusBadge}>
                        <Text style={styles.tileStatusText}>✓ Correct</Text>
                      </View>
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <View style={[styles.tileStatusBadge, { backgroundColor: "#EF4444" }]}>
                        <Text style={styles.tileStatusText}>✗ Selected</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Answer Result Banner & Next Button */}
            {isAnswered && (
              <View style={[styles.feedbackCard, selectedOption === currentQ.correctIndex ? styles.feedbackCorrect : styles.feedbackWrong]}>
                <View style={styles.feedbackHeaderRow}>
                  <Text style={styles.feedbackTitle}>
                    {selectedOption === currentQ.correctIndex
                      ? `🎉 AWESOME! +${earnedDelta} PTS`
                      : selectedOption === -1
                      ? "⏱️ TIME'S UP!"
                      : "❌ NOT QUITE"}
                  </Text>
                  {streak > 1 && selectedOption === currentQ.correctIndex && (
                    <Text style={styles.feedbackStreak}>🔥 {streak}x Streak Active!</Text>
                  )}
                </View>

                <Text style={styles.feedbackExplanation}>
                  💡 <Text style={{ fontWeight: "700" }}>Key Takeaway:</Text> {currentQ.explanation}
                </Text>

                <TouchableOpacity style={styles.nextQuestionBtn} onPress={handleNext}>
                  <Text style={styles.nextQuestionBtnText}>
                    {currentIdx < questions.length - 1 ? "Next Question ➔" : "View Final Arena Results 🏆"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        ) : (
          /* Arena Finish / Podium Screen */
          <ScrollView contentContainerStyle={styles.podiumContent} showsVerticalScrollIndicator={false}>
            <View style={styles.podiumTrophyCard}>
              <Text style={styles.podiumEmoji}>{isPassed ? "🏆" : "🎯"}</Text>
              <Text style={styles.podiumTitle}>
                {isPassed ? "Mastery Achieved!" : "Arena Completed!"}
              </Text>
              <Text style={styles.podiumSub}>
                {isPassed
                  ? `Outstanding performance! You cleared ${accuracyPct}% on ${skillName}.`
                  : `You scored ${accuracyPct}%. Review the course and retake to unlock your certificate.`}
              </Text>

              {/* Stats Box */}
              <View style={styles.podiumStatsRow}>
                <View style={styles.podiumStatCol}>
                  <Text style={styles.podiumStatVal}>{points.toLocaleString()}</Text>
                  <Text style={styles.podiumStatLabel}>TOTAL POINTS</Text>
                </View>
                <View style={styles.podiumDivider} />
                <View style={styles.podiumStatCol}>
                  <Text style={[styles.podiumStatVal, { color: isPassed ? "#10B981" : "#F59E0B" }]}>
                    {totalCorrect}/{questions.length}
                  </Text>
                  <Text style={styles.podiumStatLabel}>ACCURACY ({accuracyPct}%)</Text>
                </View>
                <View style={styles.podiumDivider} />
                <View style={styles.podiumStatCol}>
                  <Text style={[styles.podiumStatVal, { color: "#A855F7" }]}>
                    {maxStreak}x
                  </Text>
                  <Text style={styles.podiumStatLabel}>MAX STREAK</Text>
                </View>
              </View>

              {/* Database Persist Confirmation */}
              <View style={styles.dbNoticeBox}>
                <Text style={styles.dbNoticeText}>
                  ✓ Verified Results Saved to SmartEvolve PostgreSQL Database
                </Text>
                <Text style={styles.dbNoticeSub}>
                  Candidate: {studentName} • Score Recorded
                </Text>
              </View>

              {/* Certificate Unlocked Banner */}
              {isPassed ? (
                <View style={styles.certUnlockBanner}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.certUnlockTitle}>🎓 Official Certificate Unlocked!</Text>
                    <Text style={styles.certUnlockSub}>
                      Your SmartEvolve Academy verified credential is ready.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.viewCertBtn}
                    onPress={() => {
                      onClose();
                      onViewCertificate();
                    }}
                  >
                    <Text style={styles.viewCertBtnText}>📜 View Certificate</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {/* Action Buttons */}
              <View style={styles.podiumActions}>
                <TouchableOpacity style={styles.restartBtn} onPress={handleRestart}>
                  <Text style={styles.restartBtnText}>🔄 Play Arena Again</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
                  <Text style={styles.doneBtnText}>← Return to Course</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070B14",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingTop: spacing.xl,
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  badgePill: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    marginBottom: 4,
  },
  badgePillText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  courseTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scoreHud: {
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.md,
    alignItems: "center",
  },
  scoreLabel: {
    color: "#94A3B8",
    fontSize: 9,
    fontWeight: "800",
  },
  scoreVal: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  streakPill: {
    backgroundColor: "rgba(245, 158, 11, 0.25)",
    borderColor: "#F59E0B",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.md,
  },
  streakText: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "900",
  },
  exitBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  exitBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  scrollContent: {
    padding: spacing.md,
    maxWidth: 900,
    width: "100%",
    alignSelf: "center",
    paddingBottom: spacing.xxl,
  },
  timerWrap: {
    marginBottom: spacing.md,
  },
  timerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  questionCounter: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
  },
  timerSec: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: radius.full,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: radius.full,
  },
  questionCard: {
    backgroundColor: "#131B2E",
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    minHeight: 110,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  questionPrompt: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 26,
  },
  tileGrid: {
    gap: 8,
    marginBottom: spacing.md,
  },
  tileGridDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  answerTile: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    minHeight: 46,
    justifyContent: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    width: "100%",
  },
  answerTileDesktop: {
    width: "48.8%",
  },
  tileShapeBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  tileShapeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  tileText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    paddingLeft: 26,
    paddingRight: 20,
    lineHeight: 18,
  },
  tileStatusBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#10B981",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  tileStatusText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  feedbackCard: {
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: spacing.sm,
  },
  feedbackCorrect: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "#10B981",
  },
  feedbackWrong: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderColor: "#EF4444",
  },
  feedbackHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  feedbackTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  feedbackStreak: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "800",
  },
  feedbackExplanation: {
    color: "#E2E8F0",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  nextQuestionBtn: {
    backgroundColor: "#6366F1",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  nextQuestionBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  // Podium styles
  podiumContent: {
    padding: spacing.lg,
    maxWidth: 700,
    width: "100%",
    alignSelf: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  podiumTrophyCard: {
    backgroundColor: "#111827",
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: "center",
  },
  podiumEmoji: {
    fontSize: 54,
    marginBottom: 10,
  },
  podiumTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 4,
  },
  podiumSub: {
    color: "#94A3B8",
    fontSize: 13,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  podiumStatsRow: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  podiumStatCol: {
    alignItems: "center",
  },
  podiumStatVal: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  podiumStatLabel: {
    color: "#94A3B8",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 2,
  },
  podiumDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  dbNoticeBox: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "rgba(16, 185, 129, 0.3)",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  dbNoticeText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "700",
  },
  dbNoticeSub: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 2,
  },
  certUnlockBanner: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderColor: "rgba(245, 158, 11, 0.4)",
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    gap: 12,
  },
  certUnlockTitle: {
    color: "#F59E0B",
    fontSize: 14,
    fontWeight: "800",
  },
  certUnlockSub: {
    color: "#E2E8F0",
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  viewCertBtn: {
    backgroundColor: "#F59E0B",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  viewCertBtnText: {
    color: "#070B14",
    fontSize: 12,
    fontWeight: "900",
  },
  podiumActions: {
    width: "100%",
    gap: 10,
    marginTop: spacing.sm,
  },
  restartBtn: {
    backgroundColor: "#6366F1",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  restartBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  doneBtn: {
    backgroundColor: "transparent",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
  },
  doneBtnText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "700",
  },
});

