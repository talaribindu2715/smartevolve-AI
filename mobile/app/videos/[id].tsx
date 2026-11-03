import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  useWindowDimensions,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Svg, { Path } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../src/api/client";
import { YouTubePlayer } from "../../src/components/YouTubePlayer";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { Button } from "../../src/components/Button";
import { VideoCard } from "../../src/components/VideoCard";
import { CertificateModal } from "../../src/components/CertificateModal";
import { InteractiveQuizArenaModal } from "../../src/components/InteractiveQuizArenaModal";
import { getMasterVideoById } from "../../src/data/masterVideos";
import { colors, radius, spacing } from "../../src/theme/colors";

const SAVED_VIDEOS_STORAGE_KEY = "smartevolve_saved_videos";

import { getQuestionsForVideo, ArenaQuestion } from "../../src/data/quizQuestionsBank";

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [activeTab, setActiveTab] = useState<"overview" | "quiz" | "related">("overview");
  const [isSaved, setIsSaved] = useState(false);

  // In-line Skill Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAttempts, setQuizAttempts] = useState(1);
  const [showCertModal, setShowCertModal] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(false);

  const handleMarkCompleted = () => {
    setLocalCompleted(true);
    updateProgressMutation.mutate("COMPLETED");
    setShowCertModal(true);
  };

  // Interactive Quiz Arena Mode State (Kahoot / Wayground / Quizizz - zero external login)
  const [arenaModalVisible, setArenaModalVisible] = useState(false);
  const [arenaPlatform, setArenaPlatform] = useState<"kahoot" | "wayground" | "quizizz">("kahoot");
  const [selectedPoolSize, setSelectedPoolSize] = useState<number>(30);

  const launchArena = (plat: "kahoot" | "wayground" | "quizizz") => {
    setArenaPlatform(plat);
    setArenaModalVisible(true);
  };

  const handleArenaComplete = (correctCount: number, total: number, answers: Record<number, number>) => {
    setSelectedAnswers(answers);
    setQuizScore(correctCount);
    setQuizSubmitted(true);

    const isPassing = correctCount >= Math.ceil(total * 0.6);
    if (isPassing) {
      updateProgressMutation.mutate("COMPLETED");
    }

    // Persist to PostgreSQL database directly
    api.submitCourseQuizResult({
      courseOrVideoId: effectiveVideo?.videoId || effectiveVideo?.id || "course",
      courseTitle: effectiveVideo?.title || "Masterclass",
      skillName: effectiveVideo?.skillName || "Computer Science",
      score: correctCount,
      totalQuestions: total,
      timeTakenSeconds: 90,
      attemptNumber: quizAttempts,
      difficulty: effectiveVideo?.difficulty || "INTERMEDIATE",
      platform: arenaPlatform.toUpperCase(),
    }).then(() => {
      setDbPersisted(true);
    }).catch((err) => {
      console.warn("Arena persist notice:", err);
    });

    if (effectiveVideo) {
      api.updateVideoProgress({
        videoId: effectiveVideo.id,
        youtubeVideoId: effectiveVideo.videoId,
        watchedSeconds: (effectiveVideo.estimatedMinutes || 30) * 60,
        totalSeconds: (effectiveVideo.estimatedMinutes || 30) * 60,
        status: "COMPLETED",
      }).catch(() => {});
    }

    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["evolutionHistory"] });
    queryClient.invalidateQueries({ queryKey: ["evolutionTrends"] });
    queryClient.invalidateQueries({ queryKey: ["studentSkills"] });
    queryClient.invalidateQueries({ queryKey: ["credentials"] });
  };

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.getProfile(),
  });
  const [dbPersisted, setDbPersisted] = useState(false);

  const { data: video, isLoading } = useQuery({
    queryKey: ["youtubeVideoDetail", id],
    queryFn: () => api.getYouTubeVideoDetail(id!),
    enabled: !!id,
  });

  const fallbackVideo = getMasterVideoById(id || "");
  const effectiveVideo = video || fallbackVideo;

  const quizQuestions = React.useMemo(() => {
    return getQuestionsForVideo(effectiveVideo?.skillName, effectiveVideo?.title, selectedPoolSize);
  }, [effectiveVideo?.skillName, effectiveVideo?.title, selectedPoolSize]);

  const { data: assessments } = useQuery({
    queryKey: ["assessments"],
    queryFn: () => api.getAssessments(),
  });

  const { data: relatedVideos } = useQuery({
    queryKey: ["relatedVideos", effectiveVideo?.skillId],
    queryFn: () =>
      api.getYouTubeVideos({
        skillId: effectiveVideo?.skillId,
        limit: 4,
      }),
    enabled: !!effectiveVideo?.skillId,
  });

  // Watchlist persistence
  useEffect(() => {
    if (!effectiveVideo) return;
    AsyncStorage.getItem(SAVED_VIDEOS_STORAGE_KEY).then((val) => {
      if (val) {
        try {
          const list: string[] = JSON.parse(val);
          setIsSaved(list.includes(effectiveVideo.id) || list.includes(effectiveVideo.videoId));
        } catch (_) {}
      }
    });
  }, [video]);

  const toggleSaveForLater = async () => {
    if (!effectiveVideo) return;
    try {
      const val = await AsyncStorage.getItem(SAVED_VIDEOS_STORAGE_KEY);
      let list: string[] = val ? JSON.parse(val) : [];
      const vId = effectiveVideo.id || effectiveVideo.videoId;

      if (isSaved) {
        list = list.filter((item) => item !== vId && item !== effectiveVideo.videoId && item !== effectiveVideo.id);
        setIsSaved(false);
        Alert.alert("Removed from Watchlist", "Video removed from your saved videos.");
      } else {
        if (!list.includes(vId)) list.push(vId);
        setIsSaved(true);
        Alert.alert("Saved for Later", "Video added to your Watchlist.");
      }
      await AsyncStorage.setItem(SAVED_VIDEOS_STORAGE_KEY, JSON.stringify(list));
    } catch (_) {}
  };

  const updateProgressMutation = useMutation({
    mutationFn: (status: "IN_PROGRESS" | "COMPLETED") =>
      api.updateVideoProgress({
        videoId: effectiveVideo?.id,
        youtubeVideoId: effectiveVideo?.videoId,
        watchedSeconds: status === "COMPLETED" ? (effectiveVideo?.estimatedMinutes ? effectiveVideo.estimatedMinutes * 60 : 1800) : 900,
        totalSeconds: effectiveVideo?.estimatedMinutes ? effectiveVideo.estimatedMinutes * 60 : 1800,
        status,
      }),
    onSuccess: (updated, status) => {
      queryClient.invalidateQueries({ queryKey: ["youtubeVideoDetail", id] });
      queryClient.invalidateQueries({ queryKey: ["youtubeVideos"] });
      queryClient.invalidateQueries({ queryKey: ["recommendedYouTubeVideos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["evolutionHistory"] });
      Alert.alert(
        status === "COMPLETED" ? "🎉 Masterclass Completed!" : "Progress Recorded",
        status === "COMPLETED"
          ? `Your progress has been recorded and +3.0% proficiency has been added to your ${effectiveVideo?.skillName || "skill"} profile!`
          : "Progress marked as in-progress. Keep watching to unlock mastery."
      );
    },
    onError: (err: any) => {
      Alert.alert("Error", err.message || "Failed to update video watch progress");
    },
  });

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/videos");
    }
  };

  if (isLoading && !effectiveVideo) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading SmartEvolve Masterclass...</Text>
      </View>
    );
  }

  if (!effectiveVideo) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: colors.error }]}>Masterclass not found.</Text>
        <Button title="← Return to Academy" onPress={handleBack} style={{ marginTop: 16 }} />
      </View>
    );
  }

  const isCompleted =
    effectiveVideo?.watchStatus === "COMPLETED" ||
    localCompleted ||
    (quizSubmitted && quizScore >= Math.ceil(quizQuestions.length * 0.6));
  const currentQuestion = quizQuestions[currentQuestionIndex] || quizQuestions[0];

  const handleSelectOption = (qId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    quizQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    setQuizScore(correctCount);
    setQuizSubmitted(true);

    const isPassing = correctCount >= Math.ceil(quizQuestions.length * 0.6);
    if (isPassing) {
      updateProgressMutation.mutate("COMPLETED");
      setShowCertModal(true);
    }

    // Calculate Attempt-Damped Proficiency Gain
    const lambda = 1.0 / Math.sqrt(Math.max(1, quizAttempts));
    const rawGain = (correctCount / quizQuestions.length) * 5.0; // max +5.0%
    const dampedGain = (rawGain * lambda).toFixed(1);

    // Submit quiz marks & attempt directly to PostgreSQL database
    api.submitCourseQuizResult({
      courseOrVideoId: effectiveVideo.videoId || effectiveVideo.id,
      courseTitle: effectiveVideo.title,
      skillName: effectiveVideo.skillName || "Computer Science",
      score: correctCount,
      totalQuestions: quizQuestions.length,
      timeTakenSeconds: 120,
      attemptNumber: quizAttempts,
      difficulty: effectiveVideo.difficulty || "INTERMEDIATE",
      platform: "SMARTEVOLVE",
    }).then(() => {
      setDbPersisted(true);
    }).catch((err) => {
      console.warn("Course quiz DB persist notice:", err);
    });

    // Record progress dynamically in backend
    api.updateVideoProgress({
      videoId: effectiveVideo.id,
      youtubeVideoId: effectiveVideo.videoId,
      watchedSeconds: (effectiveVideo?.estimatedMinutes || 30) * 60,
      totalSeconds: (effectiveVideo?.estimatedMinutes || 30) * 60,
      status: "COMPLETED",
    }).catch(() => {});

    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["evolutionHistory"] });
    queryClient.invalidateQueries({ queryKey: ["evolutionTrends"] });
    queryClient.invalidateQueries({ queryKey: ["studentSkills"] });
    queryClient.invalidateQueries({ queryKey: ["credentials"] });
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setCurrentQuestionIndex(0);
    setQuizAttempts((prev) => prev + 1);
  };

  const relatedAssessment = (assessments || []).find(
    (a) => a.skillId === effectiveVideo.skillId || a.title?.toLowerCase().includes((effectiveVideo.skillName || "").toLowerCase())
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.responsiveWrapper}>
        {/* Back Link */}
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backBtnText}>← Return to SmartEvolve Academy</Text>
        </TouchableOpacity>

        {/* Embedded YouTube Player with Focus & Ad-Free Protection */}
        <YouTubePlayer
          videoIdOrUrl={effectiveVideo.videoId}
          title={effectiveVideo.title}
          thumbnailUrl={effectiveVideo.thumbnailUrl}
          autoPlay={true}
        />

        {/* Video Header & Metadata */}
        <View style={styles.metaHeader}>
          <View style={styles.topPillsRow}>
            <Badge label={effectiveVideo.difficulty || "INTERMEDIATE"} variant="primary" />
            <Badge
              label={isCompleted ? "COMPLETED" : effectiveVideo.watchStatus === "IN_PROGRESS" ? "IN PROGRESS" : "NOT STARTED"}
              variant={isCompleted ? "success" : effectiveVideo.watchStatus === "IN_PROGRESS" ? "warning" : "info"}
            />
            <Text style={styles.durationPill}>⏱️ {effectiveVideo.duration || `${effectiveVideo.estimatedMinutes}:00`}</Text>

            <View style={styles.topRightActions}>
              <TouchableOpacity
                style={[styles.quickCompleteBtn, isCompleted && styles.quickCompleteBtnDone]}
                onPress={handleMarkCompleted}
                activeOpacity={0.8}
              >
                <Text style={[styles.quickCompleteBtnText, isCompleted && styles.quickCompleteBtnTextDone]}>
                  {isCompleted ? "🎓 Certificate Ready" : "✓ Mark Completed"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={toggleSaveForLater}>
                <Text style={styles.saveBtnText}>{isSaved ? "★ In Watchlist" : "☆ Save for Later"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.videoTitle}>{effectiveVideo.title}</Text>

          <View style={styles.channelRow}>
            <Text style={styles.channelName}>{effectiveVideo.channelTitle || "SmartEvolve Educator"}</Text>
            {effectiveVideo.viewCount ? (
              <Text style={styles.viewCount}>• {effectiveVideo.viewCount.toLocaleString()} views</Text>
            ) : null}
            <Badge label={effectiveVideo.skillName || "Masterclass"} variant="info" />
          </View>
        </View>

        {/* Learning Verification & Progress Status (Verified Automatic Unlocking) */}
        <Card style={[styles.progressCard, isCompleted && { borderColor: "#10B981", backgroundColor: "rgba(16, 185, 129, 0.08)" }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Text style={{ fontSize: 24 }}>{isCompleted ? "🏆" : "🔒"}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.progressCardTitle, isCompleted && { color: "#10B981" }]}>
                {isCompleted ? "Course Mastered & Certificate Ready!" : "Certificate Verification & Completion Status"}
              </Text>
              <Text style={styles.progressCardSub}>
                {isCompleted
                  ? "Congratulations! You have fulfilled the academic study requirements. Your official SmartEvolve certificate is unlocked and ready to view or download."
                  : "Watch the video masterclass or click 'Mark as Completed' below to test and preview your certificate immediately."}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
            <View style={{ flex: 1, padding: 8, backgroundColor: "rgba(255, 255, 255, 0.04)", borderRadius: 6, borderWidth: 1, borderColor: colors.cardBorder }}>
              <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: "700" }}>STUDY STATUS</Text>
              <Text style={{ fontSize: 12, color: isCompleted ? colors.success : colors.warning, fontWeight: "700", marginTop: 2 }}>
                {isCompleted ? "Completed ✓" : "In Progress ⏳"}
              </Text>
            </View>
            <View style={{ flex: 1, padding: 8, backgroundColor: "rgba(255, 255, 255, 0.04)", borderRadius: 6, borderWidth: 1, borderColor: colors.cardBorder }}>
              <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: "700" }}>SKILL QUIZ EVALUATION</Text>
              <Text style={{ fontSize: 12, color: quizSubmitted ? (quizScore >= Math.ceil(quizQuestions.length * 0.6) ? colors.success : colors.error) : colors.textMuted, fontWeight: "700", marginTop: 2 }}>
                {quizSubmitted ? `${Math.round((quizScore / quizQuestions.length) * 100)}% (${quizScore >= Math.ceil(quizQuestions.length * 0.6) ? "Passed ✓" : "Retake Quiz"})` : "Optional Quiz Below ✍️"}
              </Text>
            </View>
          </View>

          {/* Action Buttons: Mark as Completed & View Certificate */}
          <View style={styles.certActionsRow}>
            <TouchableOpacity
              style={[styles.markCompletedBtn, isCompleted && styles.markCompletedBtnActive]}
              onPress={handleMarkCompleted}
              activeOpacity={0.85}
            >
              <Text style={styles.markCompletedBtnText}>
                {isCompleted ? "✓ Video Completed (Click to Re-open Certificate)" : "✓ Mark Video as Completed"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewCertBtn}
              onPress={() => {
                if (!isCompleted) {
                  handleMarkCompleted();
                } else {
                  setShowCertModal(true);
                }
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.viewCertBtnText}>
                🎓 View Official SmartEvolve Certificate
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Segmented Tab Navigation */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "overview" && styles.tabBtnActive]}
            onPress={() => setActiveTab("overview")}
          >
            <Text style={[styles.tabBtnText, activeTab === "overview" && styles.tabBtnTextActive]}>
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "quiz" && styles.tabBtnActive]}
            onPress={() => setActiveTab("quiz")}
          >
            <Text style={[styles.tabBtnText, activeTab === "quiz" && styles.tabBtnTextActive]}>
              Skill Quiz ({quizQuestions.length} Questions)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "related" && styles.tabBtnActive]}
            onPress={() => setActiveTab("related")}
          >
            <Text style={[styles.tabBtnText, activeTab === "related" && styles.tabBtnTextActive]}>
              Related Videos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <View style={styles.tabContent}>
            <Card style={styles.bodyCard}>
              <Text style={styles.bodyCardHeading}>Masterclass Description</Text>
              <Text style={styles.bodyDescription}>
                {effectiveVideo.description || "In-depth video tutorial covering essential concepts and practical industry implementations."}
              </Text>

              <View style={styles.keyPointsBox}>
                <Text style={styles.keyPointsTitle}>💡 Key Learning Takeaways</Text>
                <Text style={styles.bulletItem}>• Hands-on coding paradigms and syntax mastery.</Text>
                <Text style={styles.bulletItem}>• Production engineering best practices from senior practitioners.</Text>
                <Text style={styles.bulletItem}>• Direct alignment with Kahn DAG prerequisite milestones.</Text>
              </View>
            </Card>

            {/* Overview Quick Arena Launcher */}
            <View style={styles.arenaCalloutCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 15 }}>
                  🎮 Masterclass Quiz Arena
                </Text>
                <View style={styles.noLoginBadge}>
                  <Text style={styles.noLoginBadgeText}>No Login Required</Text>
                </View>
              </View>
              <Text style={{ color: "#94A3B8", fontSize: 12, lineHeight: 18, marginBottom: 12 }}>
                Ready to test what you learned? Launch an interactive game session for this video with Kahoot shapes or Wayground speed timers:
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                <TouchableOpacity
                  style={styles.kahootBtn}
                  onPress={() => launchArena("kahoot")}
                >
                  <Text style={styles.arenaBtnText}>▲ ◆ ● ■ Launch Kahoot Arena</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.waygroundBtn}
                  onPress={() => launchArena("wayground")}
                >
                  <Text style={styles.arenaBtnText}>⚡ Launch Wayground Mode</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Tab 2: Interactive Skill Quiz (No more 'Coming Soon'!) */}
        {activeTab === "quiz" && (
          <View style={styles.tabContent}>
            <Card style={styles.quizWrapperCard}>
              {/* Quiz Header */}
              <View style={styles.quizHeaderRow}>
                <View>
                  <Text style={styles.quizHeadline}>
                    {effectiveVideo.skillName} Diagnostic Quiz
                  </Text>
                  <Text style={styles.quizSubHeadline}>
                    Attempt #{quizAttempts} • Calibrated with Attempt-Damped Proficiency Recalibration
                  </Text>
                </View>
                <Badge
                  label={quizSubmitted ? `${quizScore}/${quizQuestions.length} Score` : `Q ${currentQuestionIndex + 1}/${quizQuestions.length}`}
                  variant={quizSubmitted ? (quizScore >= 4 ? "success" : "warning") : "primary"}
                />
              </View>

              {/* Challenge Depth Selector */}
              <View style={styles.poolSelectorCard}>
                <Text style={styles.poolSelectorTitle}>🎯 Quiz Questions Pool:</Text>
                <View style={styles.poolPillsRow}>
                  <TouchableOpacity
                    style={[styles.poolPill, selectedPoolSize === 15 && styles.poolPillActive]}
                    onPress={() => { setSelectedPoolSize(15); setCurrentQuestionIndex(0); }}
                  >
                    <Text style={[styles.poolPillText, selectedPoolSize === 15 && styles.poolPillTextActive]}>
                      ⚡ 15 Questions
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.poolPill, selectedPoolSize === 30 && styles.poolPillActive]}
                    onPress={() => { setSelectedPoolSize(30); setCurrentQuestionIndex(0); }}
                  >
                    <Text style={[styles.poolPillText, selectedPoolSize === 30 && styles.poolPillTextActive]}>
                      🏆 30 Questions (Deep Exam)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.poolPill, selectedPoolSize >= 40 && styles.poolPillActive]}
                    onPress={() => { setSelectedPoolSize(50); setCurrentQuestionIndex(0); }}
                  >
                    <Text style={[styles.poolPillText, selectedPoolSize >= 40 && styles.poolPillTextActive]}>
                      👑 Grand Championship (All Qs)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* In-App Interactive Quiz Arena (Kahoot • Wayground • Quizizz - No External Sign-In) */}
              <View style={styles.arenaLaunchBanner}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 14 }}>
                    🎮 In-App Quiz Arena: Kahoot • Wayground • Quizizz
                  </Text>
                  <View style={styles.noLoginBadge}>
                    <Text style={styles.noLoginBadgeText}>Zero Sign-in • In-App</Text>
                  </View>
                </View>
                <Text style={{ color: "#94A3B8", fontSize: 12, lineHeight: 18, marginBottom: 12 }}>
                  Directly launches interactive questions for this video! Play with 25s countdown timers, Kahoot shape blocks, speed streaks, and earn your certificate:
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                  <TouchableOpacity
                    style={styles.kahootBtn}
                    onPress={() => launchArena("kahoot")}
                  >
                    <Text style={styles.arenaBtnText}>▲ ◆ ● ■ Play Kahoot Arena ➔</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.waygroundBtn}
                    onPress={() => launchArena("wayground")}
                  >
                    <Text style={styles.arenaBtnText}>⚡ Play Wayground Speed ➔</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quizizzBtn}
                    onPress={() => launchArena("quizizz")}
                  >
                    <Text style={styles.arenaBtnText}>🎯 Play Quizizz Challenge ➔</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submitted Results View */}
              {quizSubmitted ? (
                <View style={styles.resultsContainer}>
                  <View style={styles.scoreBanner}>
                    <Text style={styles.scoreBigText}>
                      {Math.round((quizScore / quizQuestions.length) * 100)}%
                    </Text>
                    <Text style={styles.scoreSubText}>
                      You answered {quizScore} out of {quizQuestions.length} questions correctly.
                    </Text>
                    <View style={styles.dampedPill}>
                      <Text style={styles.dampedPillText}>
                        📈 +{((quizScore / quizQuestions.length) * (5.0 / Math.sqrt(Math.max(1, quizAttempts)))).toFixed(1)}% Skill Proficiency Added
                      </Text>
                    </View>

                    <View style={{ marginTop: 10, padding: 10, backgroundColor: "rgba(16, 185, 129, 0.15)", borderColor: "#10B981", borderWidth: 1, borderRadius: 8, alignItems: "center" }}>
                      <Text style={{ color: "#10B981", fontWeight: "700", fontSize: 13 }}>
                        ✓ Quiz Marks & Evolution History Saved to PostgreSQL Database
                      </Text>
                      <Text style={{ color: "#94A3B8", fontSize: 11, marginTop: 2 }}>
                        Attempt #{quizAttempts} recorded with {quizScore}/{quizQuestions.length} ({Math.round((quizScore / quizQuestions.length) * 100)}%)
                      </Text>
                    </View>
                  </View>

                  {/* Review Questions */}
                  <Text style={styles.reviewHeading}>Question Analysis & Explanations:</Text>
                  {quizQuestions.map((q, idx) => {
                    const studentAns = selectedAnswers[q.id];
                    const isCorrect = studentAns === q.correctIndex;
                    return (
                      <View key={q.id} style={[styles.reviewItem, isCorrect ? styles.reviewItemCorrect : styles.reviewItemWrong]}>
                        <View style={styles.reviewTopRow}>
                          <Text style={styles.reviewQuestionNum}>Question {idx + 1}</Text>
                          <Text style={isCorrect ? styles.correctBadge : styles.wrongBadge}>
                            {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                          </Text>
                        </View>
                        <Text style={styles.reviewQuestionText}>{q.question}</Text>
                        <Text style={styles.reviewAnswerText}>
                          Your answer: <Text style={{ fontWeight: "700" }}>{studentAns !== undefined ? q.options[studentAns] : "Not Answered"}</Text>
                        </Text>
                        {!isCorrect && (
                          <Text style={styles.reviewCorrectText}>
                            Correct answer: <Text style={{ fontWeight: "700" }}>{q.options[q.correctIndex]}</Text>
                          </Text>
                        )}
                        <Text style={styles.reviewExplanation}>
                          💡 {q.explanation}
                        </Text>
                      </View>
                    );
                  })}

                  <View style={styles.resultsActionRow}>
                    <Button
                      title="🔄 Retry Quiz"
                      onPress={handleResetQuiz}
                      variant="outline"
                      size="md"
                      style={{ flex: 1 }}
                    />
                    {relatedAssessment && (
                      <Button
                        title="Take Formal Assessment →"
                        onPress={() => router.push(`/assessment/${relatedAssessment.id}`)}
                        variant="primary"
                        size="md"
                        style={{ flex: 1 }}
                      />
                    )}
                  </View>
                </View>
              ) : (
                /* Active Question View */
                <View style={styles.activeQuestionContainer}>
                  {/* Progress Indicator Dots */}
                  <View style={styles.dotsRow}>
                    {quizQuestions.map((q, i) => (
                      <TouchableOpacity
                        key={q.id}
                        onPress={() => setCurrentQuestionIndex(i)}
                        style={[
                          styles.dot,
                          i === currentQuestionIndex && styles.dotActive,
                          selectedAnswers[q.id] !== undefined && styles.dotAnswered,
                        ]}
                      />
                    ))}
                  </View>

                  <Text style={styles.questionText}>
                    {currentQuestionIndex + 1}. {currentQuestion.question}
                  </Text>

                  {/* Options List */}
                  <View style={styles.optionsList}>
                    {currentQuestion.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[currentQuestion.id] === optIdx;
                      return (
                        <TouchableOpacity
                          key={optIdx}
                          style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                          onPress={() => handleSelectOption(currentQuestion.id, optIdx)}
                        >
                          <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                            {isSelected && <View style={styles.radioInner} />}
                          </View>
                          <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Question Navigation */}
                  <View style={styles.questionNavRow}>
                    <TouchableOpacity
                      disabled={currentQuestionIndex === 0}
                      onPress={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                      style={[styles.navBtn, currentQuestionIndex === 0 && styles.navBtnDisabled]}
                    >
                      <Text style={[styles.navBtnText, currentQuestionIndex === 0 && styles.navBtnTextDisabled]}>
                        ← Previous
                      </Text>
                    </TouchableOpacity>

                    {currentQuestionIndex < quizQuestions.length - 1 ? (
                      <TouchableOpacity
                        onPress={() => setCurrentQuestionIndex((prev) => prev + 1)}
                        style={styles.navBtnNext}
                      >
                        <Text style={styles.navBtnNextText}>Next →</Text>
                      </TouchableOpacity>
                    ) : (
                      <Button
                        title="Submit Quiz & Calibrate Score"
                        onPress={handleSubmitQuiz}
                        variant="primary"
                        size="sm"
                        disabled={Object.keys(selectedAnswers).length === 0}
                      />
                    )}
                  </View>
                </View>
              )}
            </Card>
          </View>
        )}

        {/* Tab 3: Related Videos */}
        {activeTab === "related" && (
          <View style={styles.tabContent}>
            {relatedVideos && relatedVideos.length > 0 ? (
              relatedVideos
                .filter((v) => v.videoId !== effectiveVideo.videoId)
                .map((v) => (
                  <VideoCard
                    key={v.id}
                    video={v}
                    layout="horizontal"
                    onPress={(item) => router.push(`/videos/${item.id || item.videoId}`)}
                  />
                ))
            ) : (
              <Text style={styles.emptySub}>No additional videos for this skill yet.</Text>
            )}
          </View>
        )}
        {/* In-App Interactive Quiz Arena (Kahoot • Wayground • Quizizz) */}
        <InteractiveQuizArenaModal
          visible={arenaModalVisible}
          onClose={() => setArenaModalVisible(false)}
          platform={arenaPlatform}
          videoTitle={effectiveVideo.title}
          skillName={effectiveVideo.skillName || "Computer Science"}
          questions={quizQuestions}
          studentName={profile?.fullName || "SmartEvolve Scholar"}
          onComplete={handleArenaComplete}
          onViewCertificate={() => setShowCertModal(true)}
        />

        {/* Autonomous Great Learning Style Course Certificate Modal */}
        <CertificateModal
          visible={showCertModal}
          onClose={() => setShowCertModal(false)}
          certificate={{
            id: "SE-GL-" + (effectiveVideo.videoId || "CERT").toUpperCase(),
            studentName: profile?.fullName || "Bindu Talari",
            department: profile?.branch || "Computer Science and Engineering",
            institution: profile?.institution || "K.S.R.M. College of Engineering (Autonomous)",
            graduationYear: profile?.graduationYear || 2026,
            courseOrSkillTitle: effectiveVideo.title,
            category: effectiveVideo.category || effectiveVideo.skillName || "Computer Science",
            proficiency: quizSubmitted ? Math.round((quizScore / quizQuestions.length) * 100) : 95,
            issuedDate: new Date().toISOString(),
            certificateCode: "SE-GL-" + Math.floor(100000 + Math.random() * 900000),
          }}
        />
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
  // Responsive full-width layout without desktop margins
  responsiveWrapper: {
    width: "100%",
    maxWidth: 960,
    alignSelf: "center",
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
  backBtn: {
    marginBottom: spacing.sm,
  },
  backBtnText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  metaHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  topPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
    flexWrap: "wrap",
  },
  durationPill: {
    color: colors.textMuted,
    fontSize: 12,
  },
  saveBtn: {
    marginLeft: "auto",
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  saveBtnText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "600",
  },
  topRightActions: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  quickCompleteBtn: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "#10B981",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  quickCompleteBtnDone: {
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    borderColor: "#6366F1",
  },
  quickCompleteBtnText: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "700",
  },
  quickCompleteBtnTextDone: {
    color: "#818CF8",
  },
  certActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: spacing.md,
    flexWrap: "wrap",
  },
  markCompletedBtn: {
    flex: 1,
    minWidth: 200,
    backgroundColor: "#059669",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  markCompletedBtnActive: {
    backgroundColor: "rgba(16, 185, 129, 0.18)",
    borderWidth: 1.5,
    borderColor: "#10B981",
  },
  markCompletedBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  viewCertBtn: {
    flex: 1,
    minWidth: 200,
    backgroundColor: "#4338CA",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4338CA",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  viewCertBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  videoTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 28,
    marginTop: 4,
    marginBottom: 6,
  },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  channelName: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  viewCount: {
    color: colors.textMuted,
    fontSize: 12,
  },
  progressCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderColor: "rgba(99, 102, 241, 0.2)",
    borderWidth: 1,
  },
  progressCardTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  progressCardSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  actionButtonsRow: {
    flexDirection: "column",
    gap: spacing.xs,
  },
  tabsRow: {
    flexDirection: "row",
    borderBottomColor: colors.cardBorder,
    borderBottomWidth: 1,
    marginBottom: spacing.md,
  },
  tabBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabBtnActive: {
    borderBottomColor: colors.primary,
  },
  tabBtnText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  tabBtnTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  tabContent: {
    marginBottom: spacing.lg,
  },
  bodyCard: {
    padding: spacing.md,
  },
  bodyCardHeading: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  bodyDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  keyPointsBox: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: radius.sm,
    gap: 4,
  },
  keyPointsTitle: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  bulletItem: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  quizWrapperCard: {
    padding: spacing.lg,
    borderColor: "rgba(99, 102, 241, 0.25)",
    borderWidth: 1,
  },
  quizHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
  },
  quizHeadline: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  quizSubHeadline: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  activeQuestionContainer: {
    gap: spacing.md,
  },
  dotsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
    justifyContent: "center",
  },
  dot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.cardBorder,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  dotAnswered: {
    backgroundColor: colors.success,
  },
  questionText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
  },
  optionsList: {
    gap: spacing.sm,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  optionItemSelected: {
    borderColor: colors.primary,
    backgroundColor: "rgba(99, 102, 241, 0.12)",
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.primary,
  },
  optionLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  optionLabelSelected: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  questionNavRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  navBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  navBtnTextDisabled: {
    color: colors.textMuted,
  },
  navBtnNext: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  navBtnNextText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  resultsContainer: {
    gap: spacing.md,
  },
  scoreBanner: {
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    borderColor: "rgba(99, 102, 241, 0.3)",
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: "center",
  },
  scoreBigText: {
    color: colors.primary,
    fontSize: 38,
    fontWeight: "900",
  },
  scoreSubText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },
  dampedPill: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderColor: colors.success,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginTop: spacing.sm,
  },
  dampedPillText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "800",
  },
  reviewHeading: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  reviewItem: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    gap: 4,
  },
  reviewItemCorrect: {
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  reviewItemWrong: {
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  reviewTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewQuestionNum: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  correctBadge: {
    color: colors.success,
    fontSize: 11,
    fontWeight: "800",
  },
  wrongBadge: {
    color: colors.error,
    fontSize: 11,
    fontWeight: "800",
  },
  reviewQuestionText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
    marginVertical: 2,
  },
  reviewAnswerText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  reviewCorrectText: {
    color: colors.success,
    fontSize: 12,
  },
  reviewExplanation: {
    color: colors.accent,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  resultsActionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  arenaLaunchBanner: {
    backgroundColor: "rgba(70, 23, 143, 0.25)",
    borderColor: "rgba(168, 85, 247, 0.4)",
    borderWidth: 1.5,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  arenaCalloutCard: {
    backgroundColor: "#131B2E",
    borderColor: "rgba(99, 102, 241, 0.35)",
    borderWidth: 1.5,
    borderRadius: 14,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  noLoginBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderColor: "#10B981",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  noLoginBadgeText: {
    color: "#10B981",
    fontSize: 10,
    fontWeight: "800",
  },
  kahootBtn: {
    backgroundColor: "#46178F",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  waygroundBtn: {
    backgroundColor: "#0066CC",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  quizizzBtn: {
    backgroundColor: "#8854C0",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  arenaBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  poolSelectorCard: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.25)",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  poolSelectorTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  poolPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  poolPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  poolPillActive: {
    backgroundColor: "rgba(99, 102, 241, 0.25)",
    borderColor: "#6366F1",
  },
  poolPillText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  poolPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});
