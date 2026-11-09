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
import { YouTubeVideo } from "../../src/types";
import { MASTER_VIDEOS, getMasterVideoById } from "../../src/data/masterVideos";
import { saveEarnedCertificate } from "../../src/services/certificateService";
import { colors, radius, spacing } from "../../src/theme/colors";

const SAVED_VIDEOS_STORAGE_KEY = "smartevolve_saved_videos";

import { getQuestionsForVideo, ArenaQuestion } from "../../src/data/quizQuestionsBank";

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [activeTab, setActiveTab] = useState<"quiz" | "related">("quiz");
  const [isSaved, setIsSaved] = useState(false);
  const scrollRef = React.useRef<ScrollView>(null);

  // Reset quiz progress and scroll to top when video ID changes
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setQuizPoints(0);
    setQuizStreak(0);
    setMaxQuizStreak(0);
    setLocalCompleted(false);
    setShowCertModal(false);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [id]);

  // In-line Skill Quiz State with Merged Kahoot & Wayground Gamification
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAttempts, setQuizAttempts] = useState(1);
  const [showCertModal, setShowCertModal] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(false);
  const [quizPoints, setQuizPoints] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [maxQuizStreak, setMaxQuizStreak] = useState(0);

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
    return getQuestionsForVideo(effectiveVideo?.skillName, effectiveVideo?.title, 200);
  }, [effectiveVideo?.skillName, effectiveVideo?.title]);

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

  // Curated Related Videos: Backend results merged with full MASTER_VIDEOS catalog
  const effectiveRelatedVideos = React.useMemo(() => {
    if (!effectiveVideo) return [];

    const currentId = effectiveVideo.id;
    const currentVid = effectiveVideo.videoId;
    const currentSkill = (effectiveVideo.skillName || "").toLowerCase().trim();
    const currentCategory = (effectiveVideo.category || "").toLowerCase().trim();

    // 1. Backend results (filtered to exclude current video)
    const backendItems = (relatedVideos || []).filter(
      (v) => v.videoId !== currentVid && v.id !== currentId
    );

    // 2. Discover related courses from MASTER_VIDEOS catalog
    const sameSkill: YouTubeVideo[] = [];
    const sameCategory: YouTubeVideo[] = [];
    const otherRecs: YouTubeVideo[] = [];

    MASTER_VIDEOS.forEach((v) => {
      if (v.videoId === currentVid || v.id === currentId) return;

      const vSkill = (v.skillName || "").toLowerCase().trim();
      const vCat = (v.category || "").toLowerCase().trim();

      if (currentSkill && (vSkill === currentSkill || vSkill.includes(currentSkill) || currentSkill.includes(vSkill))) {
        sameSkill.push(v);
      } else if (currentCategory && vCat === currentCategory) {
        sameCategory.push(v);
      } else {
        otherRecs.push(v);
      }
    });

    // Merge in priority order, deduplicating by videoId
    const mergedMap = new Map<string, YouTubeVideo>();
    [...backendItems, ...sameSkill, ...sameCategory, ...otherRecs].forEach((v) => {
      if (v.videoId && !mergedMap.has(v.videoId)) {
        mergedMap.set(v.videoId, v);
      }
    });

    return Array.from(mergedMap.values()).slice(0, 10);
  }, [effectiveVideo, relatedVideos]);

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

  const isPassingScore =
    quizSubmitted && quizQuestions.length > 0 && quizScore >= Math.ceil(quizQuestions.length * 0.6);
  const isCompleted =
    effectiveVideo?.watchStatus === "COMPLETED" || localCompleted || isPassingScore;

  const handleMarkCompleted = () => {
    setLocalCompleted(true);
    updateProgressMutation.mutate("COMPLETED");
    if (isPassingScore) {
      setShowCertModal(true);
    } else {
      Alert.alert(
        "Masterclass Marked as Completed! 🎯",
        "Video progress is recorded. To unlock and claim your official SmartEvolve Academic Certificate, take the Skill Quiz below and score at least 60%!",
        [
          { text: "Take Skill Quiz", onPress: () => setActiveTab("quiz") },
          { text: "Later", style: "cancel" },
        ]
      );
    }
  };

  const currentQuestion = quizQuestions[currentQuestionIndex] || quizQuestions[0];

  const handleSelectOption = (qId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    if (selectedAnswers[qId] !== undefined) return; // Strict Kahoot/Wayground lock once answered
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIdx }));

    const currentQ = quizQuestions[currentQuestionIndex];
    if (currentQ) {
      if (optionIdx === currentQ.correctIndex) {
        const nextStreak = quizStreak + 1;
        setQuizStreak(nextStreak);
        if (nextStreak > maxQuizStreak) setMaxQuizStreak(nextStreak);
        setQuizPoints((prev) => prev + 500 + nextStreak * 100);
      } else {
        setQuizStreak(0);
      }
    }
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

    const passingThreshold = Math.ceil(quizQuestions.length * 0.6);
    const isPassing = correctCount >= passingThreshold;
    const scorePct = Math.round((correctCount / quizQuestions.length) * 100);

    if (isPassing) {
      updateProgressMutation.mutate("COMPLETED");
      saveEarnedCertificate({
        courseTitle: effectiveVideo.title,
        courseId: effectiveVideo.videoId || effectiveVideo.id,
        category: effectiveVideo.category || effectiveVideo.skillName || "Computer Science",
        score: correctCount,
        total: quizQuestions.length,
        percentage: scorePct,
        studentName: profile?.fullName || "Student",
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["credentials"] });
        queryClient.invalidateQueries({ queryKey: ["storedEarnedCerts"] });
      }).catch(() => {});
      setShowCertModal(true);
    } else {
      Alert.alert(
        "Quiz Result: 60% Passing Required",
        `You scored ${correctCount}/${quizQuestions.length} (${scorePct}%).\n\nA score of at least 60% (≥${passingThreshold} correct) is required to unlock your official certificate. Please review the takeaways below and retake!`,
        [{ text: "Retake Quiz", onPress: handleResetQuiz }, { text: "Review Key Concepts", style: "cancel" }]
      );
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
      platform: "MERGED_3IN1_ARENA",
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
    setQuizPoints(0);
    setQuizStreak(0);
    setMaxQuizStreak(0);
  };

  const relatedAssessment = (assessments || []).find(
    (a) => a.skillId === effectiveVideo.skillId || a.title?.toLowerCase().includes((effectiveVideo.skillName || "").toLowerCase())
  );

  return (
    <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.content}>
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
            </View>
          </View>

          <Text style={styles.videoTitle}>{effectiveVideo.title}</Text>
        </View>

        {/* Certificate Display: Hidden completely until user completes both video watching and quiz */}
        {isCompleted && isPassingScore ? (
          <TouchableOpacity
            style={styles.viewCertificateOnlyBtn}
            onPress={() => setShowCertModal(true)}
            activeOpacity={0.85}
          >
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
              <Path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <Path d="M6 12v5c3 3 9 3 12 0v-5" />
            </Svg>
            <Text style={styles.viewCertificateOnlyBtnText}>View Certificate</Text>
          </TouchableOpacity>
        ) : null}

        {/* Segmented Tab Navigation */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "quiz" && styles.tabBtnActive]}
            onPress={() => setActiveTab("quiz")}
          >
            <Text style={[styles.tabBtnText, activeTab === "quiz" && styles.tabBtnTextActive]}>
              Masterclass Quiz ({quizQuestions.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "related" && styles.tabBtnActive]}
            onPress={() => setActiveTab("related")}
          >
            <Text style={[styles.tabBtnText, activeTab === "related" && styles.tabBtnTextActive]}>
              Related Videos ({effectiveRelatedVideos.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab 2: Unified Interactive Skill Quiz */}
        {activeTab === "quiz" && (
          <View style={styles.tabContent}>
            <Card style={styles.quizWrapperCard}>
              {/* Quiz Header */}
              <View style={styles.quizHeaderRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.quizHeadline}>
                    {effectiveVideo.skillName} Masterclass Certification Quiz
                  </Text>
                </View>
                {quizSubmitted && (
                  <Badge
                    label={`${quizScore}/${quizQuestions.length} (${Math.round((quizScore / quizQuestions.length) * 100)}%)`}
                    variant={
                      quizScore >= Math.ceil(quizQuestions.length * 0.6)
                        ? "success"
                        : "error"
                    }
                  />
                )}
              </View>

              {/* Submitted Results View */}
              {quizSubmitted ? (
                <View style={styles.resultsContainer}>
                  <View
                    style={[
                      styles.scoreBanner,
                      quizScore >= Math.ceil(quizQuestions.length * 0.6)
                        ? styles.scoreBannerPassed
                        : styles.scoreBannerFailed,
                    ]}
                  >
                    <View style={styles.resultStatusBadge}>
                      <Text
                        style={[
                          styles.resultStatusBadgeText,
                          {
                            color:
                              quizScore >= Math.ceil(quizQuestions.length * 0.6)
                                ? "#10B981"
                                : "#EF4444",
                          },
                        ]}
                      >
                        {quizScore >= Math.ceil(quizQuestions.length * 0.6)
                          ? "✓ PASSED (≥60% THRESHOLD MET)"
                          : "✗ RETAKE REQUIRED (<60% SCORE)"}
                      </Text>
                    </View>

                    <Text style={styles.scoreBigText}>
                      {Math.round((quizScore / quizQuestions.length) * 100)}%
                    </Text>
                    <Text style={styles.scoreSubText}>
                      You answered {quizScore} out of {quizQuestions.length} questions correctly.
                      {quizScore >= Math.ceil(quizQuestions.length * 0.6)
                        ? " Congratulations! Your official certificate is unlocked."
                        : ` Passing mark is 60% (at least ${Math.ceil(quizQuestions.length * 0.6)} correct answers).`}
                    </Text>

                    {quizScore >= Math.ceil(quizQuestions.length * 0.6) && (
                      <TouchableOpacity
                        style={styles.claimCertBtn}
                        onPress={() => setShowCertModal(true)}
                      >
                        <Text style={styles.claimCertBtnText}>
                          🎓 View & Claim Official Certificate ➔
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Arena Gamified Stats Podium */}
                    <View style={styles.hudStatsPodium}>
                      <View style={styles.podiumCol}>
                        <Text style={styles.podiumVal}>{quizPoints.toLocaleString()}</Text>
                        <Text style={styles.podiumLabel}>TOTAL POINTS</Text>
                      </View>
                      <View style={styles.podiumDivider} />
                      <View style={styles.podiumCol}>
                        <Text style={[styles.podiumVal, { color: quizScore >= Math.ceil(quizQuestions.length * 0.6) ? "#10B981" : "#EF4444" }]}>
                          {quizScore}/{quizQuestions.length}
                        </Text>
                        <Text style={styles.podiumLabel}>ACCURACY ({Math.round((quizScore / quizQuestions.length) * 100)}%)</Text>
                      </View>
                      <View style={styles.podiumDivider} />
                      <View style={styles.podiumCol}>
                        <Text style={[styles.podiumVal, { color: "#F59E0B" }]}>
                          {maxQuizStreak}x
                        </Text>
                        <Text style={styles.podiumLabel}>MAX STREAK</Text>
                      </View>
                    </View>

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
                      title="🔄 Retake Quiz"
                      onPress={handleResetQuiz}
                      variant="outline"
                      size="md"
                      style={{ flex: 1 }}
                    />
                    {quizScore >= Math.ceil(quizQuestions.length * 0.6) ? (
                      <Button
                        title="🎓 View Certificate"
                        onPress={() => setShowCertModal(true)}
                        variant="primary"
                        size="md"
                        style={{ flex: 1 }}
                      />
                    ) : (
                      relatedAssessment && (
                        <Button
                          title="Take Formal Assessment →"
                          onPress={() => router.push(`/assessment/${relatedAssessment.id}`)}
                          variant="primary"
                          size="md"
                          style={{ flex: 1 }}
                        />
                      )
                    )}
                  </View>
                </View>
              ) : (
                /* Active Question View (Merged Kahoot & Wayground Interactive Gameplay) */
                <View style={styles.activeQuestionContainer}>
                  {/* Clean Quiz Status Header: Question tracker & passing threshold */}
                  <View style={styles.singleQuizStatusRow}>
                    <View style={styles.singleQuizTracker}>
                      <Text style={styles.singleQuizTrackerText}>
                        Question {currentQuestionIndex + 1} of {quizQuestions.length}
                      </Text>
                    </View>
                    <View style={styles.singleQuizPassingBadge}>
                      <Text style={styles.singleQuizPassingText}>🎯 Score ≥60% to Pass</Text>
                    </View>
                    {quizStreak > 1 && (
                      <View style={styles.singleQuizStreakBadge}>
                        <Text style={styles.singleQuizStreakText}>🔥 {quizStreak}x Streak</Text>
                      </View>
                    )}
                  </View>

                  {/* Progress Indicator: Dots for <=30 Qs, Sleek Bar for 50-150+ Qs */}
                  {quizQuestions.length <= 30 ? (
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
                  ) : (
                    <View style={styles.quizProgressBarTrack}>
                      <View
                        style={[
                          styles.quizProgressBarFill,
                          {
                            width: `${Math.round(
                              ((currentQuestionIndex + 1) / quizQuestions.length) * 100
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                  )}

                  {/* Question Card Box */}
                  <View style={styles.arenaQuestionCard}>
                    <Text style={styles.arenaQuestionNumber}>
                      QUESTION {currentQuestionIndex + 1} OF {quizQuestions.length}
                    </Text>
                    <Text style={styles.arenaQuestionText}>
                      {currentQuestion.question}
                    </Text>
                  </View>

                  {/* Vibrant Colored Option Tiles (Kahoot & Wayground Style) */}
                  <View style={[styles.tileGrid, isDesktop && styles.tileGridDesktop]}>
                    {currentQuestion.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[currentQuestion.id] === optIdx;
                      const isAnswered = selectedAnswers[currentQuestion.id] !== undefined;
                      const isCorrect = optIdx === currentQuestion.correctIndex;

                      const shapes = ["▲", "◆", "●", "■"];
                      const tileColors = ["#E21B3C", "#1368CE", "#D97706", "#16A34A"];
                      const tileBg = tileColors[optIdx % tileColors.length];

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
                          onPress={() => handleSelectOption(currentQuestion.id, optIdx)}
                        >
                          <View style={styles.tileShapeBadge}>
                            <Text style={styles.tileShapeText}>{shapes[optIdx]}</Text>
                          </View>
                          <Text style={styles.tileText}>{opt}</Text>
                          {isAnswered && isCorrect && (
                            <View style={styles.tileStatusBadgeCorrect}>
                              <Text style={styles.tileStatusText}>✓ Correct</Text>
                            </View>
                          )}
                          {isAnswered && isSelected && !isCorrect && (
                            <View style={styles.tileStatusBadgeWrong}>
                              <Text style={styles.tileStatusText}>✗ Selected</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Instant Feedback Takeaway Card */}
                  {selectedAnswers[currentQuestion.id] !== undefined && (
                    <View
                      style={[
                        styles.feedbackCard,
                        selectedAnswers[currentQuestion.id] === currentQuestion.correctIndex
                          ? styles.feedbackCorrect
                          : styles.feedbackWrong,
                      ]}
                    >
                      <View style={styles.feedbackHeaderRow}>
                        <Text style={styles.feedbackTitle}>
                          {selectedAnswers[currentQuestion.id] === currentQuestion.correctIndex
                            ? `🎉 AWESOME! CORRECT ANSWER (+${500 + quizStreak * 100} PTS)`
                            : "❌ NOT QUITE"}
                        </Text>
                        {quizStreak > 1 && selectedAnswers[currentQuestion.id] === currentQuestion.correctIndex && (
                          <Text style={styles.feedbackStreak}>🔥 {quizStreak}x Streak Active!</Text>
                        )}
                      </View>

                      <Text style={styles.feedbackExplanation}>
                        💡 <Text style={{ fontWeight: "700" }}>Key Concept:</Text> {currentQuestion.explanation}
                      </Text>

                      {currentQuestionIndex < quizQuestions.length - 1 ? (
                        <TouchableOpacity
                          style={styles.arenaNextBtn}
                          onPress={() => setCurrentQuestionIndex((prev) => prev + 1)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.arenaNextBtnText}>Next Question ➔</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.arenaSubmitBtn}
                          onPress={handleSubmitQuiz}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.arenaSubmitBtnText}>Submit Quiz & Claim Certificate 🏆</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

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
                        <Text style={styles.navBtnNextText}>Next Question →</Text>
                      </TouchableOpacity>
                    ) : (
                      <Button
                        title="Submit Quiz & Unlock Certificate 🏆"
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
            <View style={styles.relatedSectionHeader}>
              <Text style={styles.relatedSectionTitle}>
                Recommended Masterclasses & Related Courses
              </Text>
              <Text style={styles.relatedSectionSubtitle}>
                Curated courses aligned with {effectiveVideo?.skillName || effectiveVideo?.category || "this masterclass"}
              </Text>
            </View>

            {effectiveRelatedVideos && effectiveRelatedVideos.length > 0 ? (
              effectiveRelatedVideos.map((v) => (
                <VideoCard
                  key={v.id || v.videoId}
                  video={v}
                  layout="horizontal"
                  onPress={(item) => router.push(`/videos/${item.id || item.videoId}`)}
                />
              ))
            ) : (
              <View style={{ paddingVertical: spacing.xl, alignItems: "center" }}>
                <Text style={styles.emptySub}>No additional videos found.</Text>
              </View>
            )}
          </View>
        )}

        {/* Autonomous Great Learning Style Course Certificate Modal */}
        <CertificateModal
          visible={showCertModal}
          onClose={() => setShowCertModal(false)}
          certificate={{
            id: "SE-GL-" + (effectiveVideo.videoId || "CERT").toUpperCase(),
            studentName: profile?.fullName || "Student",
            department: profile?.branch || "Computer Science",
            institution: profile?.institution || "SmartEvolve Academy",
            graduationYear: profile?.graduationYear,
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
    maxWidth: 880,
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
  viewCertificateOnlyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#10B981",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  viewCertificateOnlyBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  tabsRow: {
    flexDirection: "row",
    borderBottomColor: colors.cardBorder,
    borderBottomWidth: 1,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
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
  relatedSectionHeader: {
    marginBottom: spacing.md,
    paddingHorizontal: 2,
  },
  relatedSectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  relatedSectionSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    marginBottom: spacing.xs,
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
  quizMergedSubHeadline: {
    color: "#A5B4FC",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  poolSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 6,
    flexWrap: "wrap",
  },
  poolSelectorLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "800",
    marginRight: 2,
  },
  poolPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  poolPillActive: {
    backgroundColor: "rgba(99, 102, 241, 0.3)",
    borderColor: "#6366F1",
  },
  poolPillText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "700",
  },
  poolPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  mergedPartsBar: {
    flexDirection: "row",
    gap: 6,
    marginVertical: 10,
    width: "100%",
  },
  mergedPartTab: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderWidth: 1.5,
    borderColor: "rgba(99, 102, 241, 0.25)",
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  mergedPartTabActiveKahoot: {
    backgroundColor: "#46178F",
    borderColor: "#C084FC",
  },
  mergedPartTabActiveWayground: {
    backgroundColor: "#0066CC",
    borderColor: "#38BDF8",
  },
  mergedPartTabActiveTest: {
    backgroundColor: "#0F766E",
    borderColor: "#34D399",
  },
  mergedPartTabText: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },
  mergedPartTabTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  mergedBreakdownCard: {
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderRadius: 12,
    padding: 10,
    marginVertical: 8,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  mergedBreakdownTitle: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    textAlign: "center",
    marginBottom: 6,
  },
  mergedBreakdownRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  mergedBreakdownCol: {
    alignItems: "center",
    flex: 1,
  },
  mergedBreakdownVal: {
    fontSize: 15,
    fontWeight: "900",
  },
  mergedBreakdownLabel: {
    color: "#94A3B8",
    fontSize: 9,
    fontWeight: "800",
    marginTop: 2,
    textAlign: "center",
  },
  miniPartBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniPartKahoot: {
    backgroundColor: "rgba(168, 85, 247, 0.25)",
  },
  miniPartWayground: {
    backgroundColor: "rgba(56, 189, 248, 0.25)",
  },
  miniPartExam: {
    backgroundColor: "rgba(52, 211, 153, 0.25)",
  },
  miniPartBadgeText: {
    color: "#E2E8F0",
    fontSize: 9,
    fontWeight: "800",
  },
  arenaQuestionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 6,
  },
  partBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  partBadgeKahoot: {
    backgroundColor: "rgba(168, 85, 247, 0.25)",
    borderColor: "#A855F7",
    borderWidth: 1,
  },
  partBadgeWayground: {
    backgroundColor: "rgba(56, 189, 248, 0.25)",
    borderColor: "#38BDF8",
    borderWidth: 1,
  },
  partBadgeExam: {
    backgroundColor: "rgba(52, 211, 153, 0.25)",
    borderColor: "#34D399",
    borderWidth: 1,
  },
  partBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  activeQuestionContainer: {
    gap: spacing.md,
  },
  quizProgressBarTrack: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    overflow: "hidden",
    marginVertical: 8,
  },
  quizProgressBarFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#6366F1",
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
  scoreBannerPassed: {
    borderColor: "rgba(16, 185, 129, 0.4)",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  scoreBannerFailed: {
    borderColor: "rgba(239, 68, 68, 0.4)",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
  },
  resultStatusBadge: {
    alignSelf: "center",
    marginBottom: spacing.xs,
  },
  resultStatusBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  claimCertBtn: {
    backgroundColor: "#10B981",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
    alignItems: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  claimCertBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  // Comfortable Single Unified Quiz Styles
  singleQuizStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.25)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    gap: 8,
  },
  singleQuizTracker: {
    flexDirection: "row",
    alignItems: "center",
  },
  singleQuizTrackerText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  singleQuizPassingBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "#10B981",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  singleQuizPassingText: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "800",
  },
  singleQuizStreakBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    borderColor: "#F59E0B",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  singleQuizStreakText: {
    color: "#F59E0B",
    fontSize: 11,
    fontWeight: "900",
  },
  arenaQuestionCard: {
    backgroundColor: "#131B2E",
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1.5,
    borderRadius: 14,
    padding: spacing.md,
    marginVertical: 6,
    minHeight: 85,
    justifyContent: "center",
    alignItems: "center",
  },
  arenaQuestionNumber: {
    color: "#818CF8",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: "center",
  },
  arenaQuestionText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 22,
  },
  tileGrid: {
    gap: 8,
    marginVertical: 8,
  },
  tileGridDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  answerTile: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    minHeight: 50,
    justifyContent: "center",
    position: "relative",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  answerTileDesktop: {
    width: "48.8%",
  },
  tileShapeBadge: {
    position: "absolute",
    top: 12,
    left: 10,
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
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
    paddingLeft: 30,
    paddingRight: 60,
    lineHeight: 18,
  },
  tileStatusBadgeCorrect: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#10B981",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tileStatusBadgeWrong: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#EF4444",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tileStatusText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  feedbackCard: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
    marginVertical: 8,
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
    marginBottom: 4,
  },
  feedbackTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  feedbackStreak: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "800",
  },
  feedbackExplanation: {
    color: "#E2E8F0",
    fontSize: 12,
    lineHeight: 18,
  },
  hudStatsPodium: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 10,
    width: "100%",
  },
  podiumCol: {
    alignItems: "center",
    flex: 1,
  },
  podiumVal: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  podiumLabel: {
    color: "#94A3B8",
    fontSize: 9,
    fontWeight: "800",
    marginTop: 2,
  },
  podiumDivider: {
    width: 1,
    height: 26,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  arenaNextBtn: {
    backgroundColor: "#6366F1",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  arenaNextBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  arenaSubmitBtn: {
    backgroundColor: "#10B981",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  arenaSubmitBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
});
