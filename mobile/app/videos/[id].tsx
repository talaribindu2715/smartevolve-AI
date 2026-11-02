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
import { colors, radius, spacing } from "../../src/theme/colors";

const SAVED_VIDEOS_STORAGE_KEY = "smartevolve_saved_videos";

// Dynamic quiz question bank tailored by skill/topic
interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUESTION_BANK: Record<string, QuizQuestion[]> = {
  springboot: [
    {
      id: 1,
      question: "Which annotation in Spring Boot combines @Controller and @ResponseBody to create RESTful JSON endpoints?",
      options: ["@RestController", "@Service", "@Repository", "@Component"],
      correctIndex: 0,
      explanation: "@RestController is a convenience annotation that combines @Controller and @ResponseBody, ensuring every handler method automatically serializes return values directly into HTTP response bodies as JSON.",
    },
    {
      id: 2,
      question: "What is the primary role of Spring Boot Auto-Configuration?",
      options: [
        "Automatically configures Spring beans based on jar dependencies on the classpath",
        "Compiles Java source files into bytecode",
        "Deploys application containers directly to cloud clusters",
        "Formats and checks Java indentation styles",
      ],
      correctIndex: 0,
      explanation: "Auto-Configuration inspects your project dependencies (e.g., spring-boot-starter-web) and automatically registers sensible default beans so you don't have to write verbose XML or Java configuration.",
    },
    {
      id: 3,
      question: "Which Spring Data interface provides built-in pagination, sorting, and standard CRUD operations?",
      options: ["JpaRepository", "JdbcTemplate", "CrudEngine", "SessionManager"],
      correctIndex: 0,
      explanation: "JpaRepository extends PagingAndSortingRepository and CrudRepository, providing out-of-the-box support for pagination, sorting, batch operations, and common persistence queries.",
    },
    {
      id: 4,
      question: "Where are environment configurations primarily defined in standard Spring Boot projects?",
      options: [
        "application.yml or application.properties",
        "pom.xml or build.gradle",
        "web.xml under WEB-INF",
        "beans.xml in root classpath",
      ],
      correctIndex: 0,
      explanation: "application.yml (or application.properties) in src/main/resources is the canonical location for configuring port, datasource, JPA dialects, mail, and custom properties in Spring Boot.",
    },
    {
      id: 5,
      question: "Which HTTP status code should a REST endpoint return when a new entity is successfully created?",
      options: ["201 Created", "200 OK", "204 No Content", "202 Accepted"],
      correctIndex: 0,
      explanation: "RFC 7231 specifies HTTP 201 Created as the correct standard response for POST requests that successfully result in the creation of a new persistent resource.",
    },
  ],
  python: [
    {
      id: 1,
      question: "What is the output of `[x**2 for x in range(4) if x % 2 == 0]` in Python?",
      options: ["[0, 4]", "[0, 1, 4, 9]", "[4, 16]", "[0, 2]"],
      correctIndex: 0,
      explanation: "The range is 0, 1, 2, 3. The even numbers are 0 and 2. Squaring them yields 0**2 = 0 and 2**2 = 4, resulting in the list [0, 4].",
    },
    {
      id: 2,
      question: "Which Python data structure is immutable and defined with parentheses?",
      options: ["Tuple", "List", "Dictionary", "Set"],
      correctIndex: 0,
      explanation: "Tuples are immutable sequence types in Python; once initialized, their elements cannot be appended, removed, or reassigned.",
    },
    {
      id: 3,
      question: "Which library is the standard foundation for high-performance multidimensional array math in Python?",
      options: ["NumPy", "Requests", "Flask", "BeautifulSoup"],
      correctIndex: 0,
      explanation: "NumPy provides the contiguous C-level ndarray object and optimized vector math routines fundamental to Python scientific computing.",
    },
    {
      id: 4,
      question: "In Python, which keyword is used to create an anonymous single-expression function?",
      options: ["lambda", "def", "inline", "anon"],
      correctIndex: 0,
      explanation: "The `lambda` keyword defines anonymous single-expression functions in Python (e.g. `lambda x: x * 2`).",
    },
    {
      id: 5,
      question: "What does the GIL (Global Interpreter Lock) enforce in CPython?",
      options: [
        "Only one native OS thread executes Python bytecode at any given instant",
        "Encrypts variables stored in shared memory",
        "Automatically terminates deadlocked processes",
        "Enforces strict type annotations at compile time",
      ],
      correctIndex: 0,
      explanation: "The GIL is a mutex that protects access to Python objects, preventing multiple native threads from executing Python bytecodes simultaneously in CPython.",
    },
  ],
  machinelearning: [
    {
      id: 1,
      question: "What mathematical function maps real numbers to probabilities between 0 and 1 in binary classification?",
      options: ["Sigmoid function", "Linear function", "ReLU", "Step function"],
      correctIndex: 0,
      explanation: "The Sigmoid (logistic) function σ(z) = 1 / (1 + e^(-z)) smoothly squashes any real value into the (0, 1) probability range.",
    },
    {
      id: 2,
      question: "Which technique is primarily used to prevent overfitting in complex machine learning models?",
      options: [
        "L1/L2 Regularization, dropout, and pruning",
        "Increasing the learning rate infinitely",
        "Removing validation and test sets",
        "Artificially duplicating training examples",
      ],
      correctIndex: 0,
      explanation: "Regularization penalizes extreme weight magnitudes, preventing the model from fitting training noise and improving generalization.",
    },
    {
      id: 3,
      question: "In Cosine Similarity, what does a score of 1.0 indicate between two skill vectors?",
      options: [
        "Identical direction / perfect profile alignment",
        "Vectors are orthogonal (completely independent)",
        "Vectors point in opposite directions",
        "Zero data points exist",
      ],
      correctIndex: 0,
      explanation: "Cosine similarity measures the cosine of the angle between two multi-dimensional vectors. Cos(0°) = 1.0, representing exact alignment.",
    },
    {
      id: 4,
      question: "What is the primary evaluation metric recommended when assessing models on heavily imbalanced datasets?",
      options: ["F1-Score / PR-AUC", "Accuracy", "Mean Absolute Error", "R-squared"],
      correctIndex: 0,
      explanation: "Accuracy can be deceptively high if the majority class dominates; F1-Score balances Precision and Recall for minority class detection.",
    },
    {
      id: 5,
      question: "What does the Attempt-Damped Proficiency formula λ(n) = 1 / √(max(1, n)) achieve in SmartEvolve AI?",
      options: [
        "Dampens proficiency increments on repeated attempts to limit score inflation by 39%",
        "Doubles user scores on every retry",
        "Randomly shifts questions on each assessment",
        "Deletes failed attempts from the database",
      ],
      correctIndex: 0,
      explanation: "As validated in the SmartEvolve research paper, attempt damping ensures genuine mastery is required by decelerating score accumulation on repeated attempts.",
    },
  ],
  sql: [
    {
      id: 1,
      question: "Which SQL clause is used to filter records after performing an aggregate GROUP BY operation?",
      options: ["HAVING", "WHERE", "ORDER BY", "QUALIFY"],
      correctIndex: 0,
      explanation: "WHERE filters rows before grouping; HAVING filters the aggregated groups created by GROUP BY.",
    },
    {
      id: 2,
      question: "What does ACID stand for in database transaction theory?",
      options: [
        "Atomicity, Consistency, Isolation, Durability",
        "Asynchronous, Concurrent, Indexed, Distributed",
        "Access, Control, Identity, Data",
        "Active, Cached, Insert, Delete",
      ],
      correctIndex: 0,
      explanation: "ACID principles guarantee reliable transaction processing in relational database management systems.",
    },
    {
      id: 3,
      question: "Which JOIN returns all rows from the left table and matching rows from the right table?",
      options: ["LEFT OUTER JOIN", "INNER JOIN", "CROSS JOIN", "RIGHT OUTER JOIN"],
      correctIndex: 0,
      explanation: "LEFT JOIN retains every record from the left table; if no match exists in the right table, NULLs are returned for right columns.",
    },
    {
      id: 4,
      question: "What is the index data structure used by most relational engines for high-performance B-tree indexing?",
      options: ["B+ Tree", "Linked List", "Binary Heap", "Hash Ring"],
      correctIndex: 0,
      explanation: "B+ Trees store all actual record pointers in leaf nodes linked sequentially, facilitating both fast point lookups and range scans.",
    },
    {
      id: 5,
      question: "What is the primary purpose of database normalization (1NF through 3NF)?",
      options: [
        "Minimize data redundancy and avoid update anomalies",
        "Compress database disk files",
        "Encrypt sensitive passwords",
        "Speed up network packet transfer",
      ],
      correctIndex: 0,
      explanation: "Normalization decomposes relations to ensure each fact is stored only once, eliminating insertion, update, and deletion anomalies.",
    },
  ],
  general: [
    {
      id: 1,
      question: "What is the time complexity of searching for an element in a balanced Binary Search Tree (AVL / Red-Black)?",
      options: ["O(log n)", "O(n)", "O(1)", "O(n log n)"],
      correctIndex: 0,
      explanation: "Because a balanced BST halves the search space at each comparison, search operations execute in O(log n) time.",
    },
    {
      id: 2,
      question: "In Kahn's Algorithm for Topological Sorting, what prerequisite condition must the graph satisfy?",
      options: [
        "Directed Acyclic Graph (DAG) with no circular cycles",
        "Fully connected undirected graph",
        "Weighted complete bipartite graph",
        "Binary tree with degree at most 2",
      ],
      correctIndex: 0,
      explanation: "Topological sorting can only be performed on Directed Acyclic Graphs (DAGs) because cycles prevent establishing a valid prerequisite sequence.",
    },
    {
      id: 3,
      question: "Which cryptographic hash function is used to produce EVM 32-byte dual-hash verifiable credentials in SmartEvolve AI?",
      options: ["Keccak-256", "MD5", "DES", "CRC32"],
      correctIndex: 0,
      explanation: "SmartEvolve AI uses Keccak-256 (the Ethereum standard) combined with student profile and achievement hashes for on-chain credential integrity.",
    },
    {
      id: 4,
      question: "Which HTTP status code signifies that a client must authenticate itself to get the requested response?",
      options: ["401 Unauthorized", "403 Forbidden", "404 Not Found", "500 Internal Server Error"],
      correctIndex: 0,
      explanation: "401 indicates missing or invalid authentication credentials; 403 indicates authentication was recognized but authorization is forbidden.",
    },
    {
      id: 5,
      question: "What is the primary role of a container runtime like Docker in modern microservices architectures?",
      options: [
        "Package applications with their entire runtime dependencies into portable, isolated containers",
        "Replace operating systems with custom hardware drivers",
        "Automatically write unit tests for backend controllers",
        "Format code before committing to Git",
      ],
      correctIndex: 0,
      explanation: "Docker containers encapsulate code, libraries, and runtime dependencies together, guaranteeing uniform execution across dev and production.",
    },
  ],
};

function getTopicKey(skillName?: string, title?: string): string {
  const combined = ((skillName || "") + " " + (title || "")).toLowerCase();
  if (combined.includes("spring") || combined.includes("java")) return "springboot";
  if (combined.includes("python") || combined.includes("django") || combined.includes("flask")) return "python";
  if (combined.includes("machine") || combined.includes("ai") || combined.includes("neural") || combined.includes("data science")) return "machinelearning";
  if (combined.includes("sql") || combined.includes("database") || combined.includes("postgres")) return "sql";
  return "general";
}

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

  const { data: video, isLoading } = useQuery({
    queryKey: ["youtubeVideoDetail", id],
    queryFn: () => api.getYouTubeVideoDetail(id!),
    enabled: !!id,
  });

  const { data: assessments } = useQuery({
    queryKey: ["assessments"],
    queryFn: () => api.getAssessments(),
  });

  const { data: relatedVideos } = useQuery({
    queryKey: ["relatedVideos", video?.skillId],
    queryFn: () =>
      api.getYouTubeVideos({
        skillId: video?.skillId,
        limit: 4,
      }),
    enabled: !!video?.skillId,
  });

  // Watchlist persistence
  useEffect(() => {
    if (!video) return;
    AsyncStorage.getItem(SAVED_VIDEOS_STORAGE_KEY).then((val) => {
      if (val) {
        try {
          const list: string[] = JSON.parse(val);
          setIsSaved(list.includes(video.id) || list.includes(video.videoId));
        } catch (_) {}
      }
    });
  }, [video]);

  const toggleSaveForLater = async () => {
    if (!video) return;
    try {
      const val = await AsyncStorage.getItem(SAVED_VIDEOS_STORAGE_KEY);
      let list: string[] = val ? JSON.parse(val) : [];
      const vId = video.id || video.videoId;

      if (isSaved) {
        list = list.filter((item) => item !== vId && item !== video.videoId && item !== video.id);
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
        videoId: video?.id,
        youtubeVideoId: video?.videoId,
        watchedSeconds: status === "COMPLETED" ? (video ? video.estimatedMinutes * 60 : 1800) : 900,
        totalSeconds: video ? video.estimatedMinutes * 60 : 1800,
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
          ? `Your progress has been recorded and +3.0% proficiency has been added to your ${video?.skillName || "skill"} profile!`
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

  if (isLoading || !video) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading SmartEvolve Masterclass...</Text>
      </View>
    );
  }

  const isCompleted = video.watchStatus === "COMPLETED";
  const topicKey = getTopicKey(video.skillName, video.title);
  const quizQuestions = QUESTION_BANK[topicKey] || QUESTION_BANK.general;
  const currentQuestion = quizQuestions[currentQuestionIndex];

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

    // Calculate Attempt-Damped Proficiency Gain
    const lambda = 1.0 / Math.sqrt(Math.max(1, quizAttempts));
    const rawGain = (correctCount / quizQuestions.length) * 5.0; // max +5.0%
    const dampedGain = (rawGain * lambda).toFixed(1);

    // Record progress dynamically in backend
    api.updateVideoProgress({
      videoId: video.id,
      youtubeVideoId: video.videoId,
      watchedSeconds: video.estimatedMinutes * 60,
      totalSeconds: video.estimatedMinutes * 60,
      status: "COMPLETED",
    }).catch(() => {});

    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["evolutionHistory"] });
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setCurrentQuestionIndex(0);
    setQuizAttempts((prev) => prev + 1);
  };

  const relatedAssessment = (assessments || []).find(
    (a) => a.skillId === video.skillId || a.title?.toLowerCase().includes((video.skillName || "").toLowerCase())
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
          videoIdOrUrl={video.videoId}
          title={video.title}
          thumbnailUrl={video.thumbnailUrl}
          autoPlay={true}
        />

        {/* Video Header & Metadata */}
        <View style={styles.metaHeader}>
          <View style={styles.topPillsRow}>
            <Badge label={video.difficulty || "INTERMEDIATE"} variant="primary" />
            <Badge
              label={isCompleted ? "COMPLETED" : video.watchStatus === "IN_PROGRESS" ? "IN PROGRESS" : "NOT STARTED"}
              variant={isCompleted ? "success" : video.watchStatus === "IN_PROGRESS" ? "warning" : "info"}
            />
            <Text style={styles.durationPill}>⏱️ {video.duration || `${video.estimatedMinutes}:00`}</Text>

            <TouchableOpacity style={styles.saveBtn} onPress={toggleSaveForLater}>
              <Text style={styles.saveBtnText}>{isSaved ? "★ In Watchlist" : "☆ Save for Later"}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.videoTitle}>{video.title}</Text>

          <View style={styles.channelRow}>
            <Text style={styles.channelName}>{video.channelTitle || "SmartEvolve Educator"}</Text>
            {video.viewCount ? (
              <Text style={styles.viewCount}>• {video.viewCount.toLocaleString()} views</Text>
            ) : null}
            <Badge label={video.skillName || "Masterclass"} variant="info" />
          </View>
        </View>

        {/* Learning Verification & Progress Recording */}
        <Card style={styles.progressCard}>
          <Text style={styles.progressCardTitle}>Learning Verification</Text>
          <Text style={styles.progressCardSub}>
            Watch the video lesson and verify your understanding to calibrate your skill evolution.
          </Text>

          <View style={styles.actionButtonsRow}>
            <Button
              title={isCompleted ? "✓ Masterclass Completed (+3% Proficiency)" : "Mark Video as Completed (100%)"}
              onPress={() => updateProgressMutation.mutate("COMPLETED")}
              variant="primary"
              loading={updateProgressMutation.isPending}
              size="md"
              style={{ flex: 1 }}
            />
            {!isCompleted && (
              <Button
                title="Mark as In Progress (50%)"
                onPress={() => updateProgressMutation.mutate("IN_PROGRESS")}
                variant="outline"
                loading={updateProgressMutation.isPending}
                size="md"
                style={{ flex: 1, marginTop: spacing.xs }}
              />
            )}
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
                {video.description || "In-depth video tutorial covering essential concepts and practical industry implementations."}
              </Text>

              <View style={styles.keyPointsBox}>
                <Text style={styles.keyPointsTitle}>💡 Key Learning Takeaways</Text>
                <Text style={styles.bulletItem}>• Hands-on coding paradigms and syntax mastery.</Text>
                <Text style={styles.bulletItem}>• Production engineering best practices from senior practitioners.</Text>
                <Text style={styles.bulletItem}>• Direct alignment with Kahn DAG prerequisite milestones.</Text>
              </View>
            </Card>
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
                    {video.skillName} Diagnostic Quiz
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
                .filter((v) => v.videoId !== video.videoId)
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
    alignSelf: "stretch",
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
    gap: 6,
    marginBottom: 4,
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
});
