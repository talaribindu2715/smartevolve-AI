import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Svg, { Path, Circle } from "react-native-svg";
import { api } from "../../src/api/client";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { Button } from "../../src/components/Button";
import { ProficiencyBar } from "../../src/components/ProficiencyBar";
import { Skeleton, CardSkeleton } from "../../src/components/Skeleton";
import { ErrorBanner } from "../../src/components/ErrorBanner";
import { colors, radius, spacing } from "../../src/theme/colors";
import { getStoredEarnedCertificates } from "../../src/services/certificateService";
import { Roadmap, RoadmapStep } from "../../src/types";

const CAREER_TRACKS = [
  { key: "fullstack", label: "💼 Full-Stack Developer", careerName: "Full-Stack Software Engineer" },
  { key: "ai", label: "🤖 AI & ML Engineer", careerName: "AI & Machine Learning Engineer" },
  { key: "java", label: "☕ Java Developer", careerName: "Java Enterprise Developer" },
  { key: "cloud", label: "☁️ Cloud & DevOps", careerName: "Cloud & DevOps Architect" },
];

const DEFAULT_ROADMAPS: Record<string, Roadmap> = {
  "fullstack": {
    id: "default-roadmap-fullstack",
    careerId: "00000000-0000-0000-0002-000000000005",
    careerName: "Full-Stack Software Engineer",
    version: 1,
    status: "ACTIVE",
    generatedAt: "2026-11-03T00:00:00Z",
    totalSteps: 7,
    completedSteps: 2,
    progressPercentage: 28.5,
    steps: [
      {
        id: "fs-1",
        resourceId: "20000000-0000-0000-0001-000000000001",
        resourceTitle: "Modern TypeScript & ES6+ Architecture",
        difficulty: "BEGINNER",
        phase: "BEGINNER",
        estimatedMinutes: 45,
        skillId: "00000000-0000-0000-0001-000000000004",
        skillName: "TypeScript & JavaScript",
        sequenceNumber: 1,
        priority: "CRITICAL",
        reason: "Prerequisite foundation for component design, type safety, and async patterns.",
        status: "COMPLETED",
        progressPercentage: 100,
        prerequisiteResourceIds: [],
      },
      {
        id: "fs-2",
        resourceId: "20000000-0000-0000-0001-000000000003",
        resourceTitle: "Relational Modeling & PostgreSQL Querying",
        difficulty: "BEGINNER",
        phase: "BEGINNER",
        estimatedMinutes: 50,
        skillId: "00000000-0000-0000-0001-000000000005",
        skillName: "PostgreSQL & SQL",
        sequenceNumber: 2,
        priority: "CRITICAL",
        reason: "Core persistence layer needed for structured storage and data integrity.",
        status: "COMPLETED",
        progressPercentage: 100,
        prerequisiteResourceIds: [],
      },
      {
        id: "fs-3",
        resourceId: "20000000-0000-0000-0005-000000000002",
        resourceTitle: "Spring Boot 3 REST APIs & Microservices",
        difficulty: "INTERMEDIATE",
        phase: "INTERMEDIATE",
        estimatedMinutes: 75,
        skillId: "00000000-0000-0000-0005-000000000002",
        skillName: "Spring Boot",
        sequenceNumber: 3,
        priority: "HIGH",
        reason: "Enterprise backend services with declarative transactions and JPA repositories.",
        status: "IN_PROGRESS",
        progressPercentage: 45,
        prerequisiteResourceIds: ["20000000-0000-0000-0001-000000000003"],
      },
      {
        id: "fs-4",
        resourceId: "20000000-0000-0000-0001-000000000002",
        resourceTitle: "React & React Native Component Systems",
        difficulty: "INTERMEDIATE",
        phase: "INTERMEDIATE",
        estimatedMinutes: 60,
        skillId: "00000000-0000-0000-0005-000000000001",
        skillName: "React & React Native",
        sequenceNumber: 4,
        priority: "HIGH",
        reason: "Modern reactive frontends, state management, and cross-platform mobile views.",
        status: "AVAILABLE",
        progressPercentage: 0,
        prerequisiteResourceIds: ["20000000-0000-0000-0001-000000000001"],
      },
      {
        id: "fs-5",
        resourceId: "20000000-0000-0000-0003-000000000001",
        resourceTitle: "Docker Containerization & Multi-Stage Builds",
        difficulty: "INTERMEDIATE",
        phase: "INTERMEDIATE",
        estimatedMinutes: 40,
        skillId: "00000000-0000-0000-0006-000000000001",
        skillName: "Docker",
        sequenceNumber: 5,
        priority: "MEDIUM",
        reason: "Package frontend and backend services into reproducible immutable containers.",
        status: "AVAILABLE",
        progressPercentage: 0,
        prerequisiteResourceIds: ["20000000-0000-0000-0005-000000000002"],
      },
      {
        id: "fs-6",
        resourceId: "20000000-0000-0000-0005-000000000001",
        resourceTitle: "Distributed System Design & Microservice Caching",
        difficulty: "ADVANCED",
        phase: "ADVANCED",
        estimatedMinutes: 90,
        skillId: "00000000-0000-0000-0007-000000000002",
        skillName: "System Design",
        sequenceNumber: 6,
        priority: "HIGH",
        reason: "Scalability, Redis caching tiers, message queues, and horizontal partitioning.",
        status: "LOCKED",
        progressPercentage: 0,
        prerequisiteResourceIds: ["20000000-0000-0000-0003-000000000001"],
      },
      {
        id: "fs-7",
        resourceId: "20000000-0000-0000-0003-000000000003",
        resourceTitle: "Automated CI/CD Pipelines & Cloud Deployment",
        difficulty: "ADVANCED",
        phase: "ADVANCED",
        estimatedMinutes: 60,
        skillId: "00000000-0000-0000-0006-000000000003",
        skillName: "CI/CD Pipelines",
        sequenceNumber: 7,
        priority: "MEDIUM",
        reason: "Automate testing, build verification, and zero-downtime production releases.",
        status: "LOCKED",
        progressPercentage: 0,
        prerequisiteResourceIds: ["20000000-0000-0000-0005-000000000001"],
      },
    ],
  },
  "ai": {
    id: "default-roadmap-ai",
    careerId: "00000000-0000-0000-0002-000000000001",
    careerName: "AI & Machine Learning Engineer",
    version: 1,
    status: "ACTIVE",
    generatedAt: "2026-11-03T00:00:00Z",
    totalSteps: 6,
    completedSteps: 2,
    progressPercentage: 33.3,
    steps: [
      {
        id: "ai-1",
        resourceId: "20000000-0000-0000-0001-000000000001",
        resourceTitle: "Python Mastery & Vectorized Math with NumPy",
        difficulty: "BEGINNER",
        phase: "BEGINNER",
        estimatedMinutes: 45,
        skillId: "00000000-0000-0000-0001-000000000001",
        skillName: "Python",
        sequenceNumber: 1,
        priority: "CRITICAL",
        reason: "Syntax foundation, list comprehensions, and NumPy ndarray manipulation.",
        status: "COMPLETED",
        progressPercentage: 100,
        prerequisiteResourceIds: [],
      },
      {
        id: "ai-2",
        resourceId: "20000000-0000-0000-0003-000000000001",
        resourceTitle: "Data Wrangling with Pandas & Feature Engineering",
        difficulty: "BEGINNER",
        phase: "BEGINNER",
        estimatedMinutes: 50,
        skillId: "00000000-0000-0000-0003-000000000001",
        skillName: "Pandas & NumPy",
        sequenceNumber: 2,
        priority: "CRITICAL",
        reason: "Data cleaning, imputation, categorical encoding, and feature scaling.",
        status: "COMPLETED",
        progressPercentage: 100,
        prerequisiteResourceIds: ["20000000-0000-0000-0001-000000000001"],
      },
      {
        id: "ai-3",
        resourceId: "20000000-0000-0000-0001-000000000002",
        resourceTitle: "Supervised & Unsupervised Machine Learning",
        difficulty: "INTERMEDIATE",
        phase: "INTERMEDIATE",
        estimatedMinutes: 80,
        skillId: "00000000-0000-0000-0004-000000000001",
        skillName: "Machine Learning",
        sequenceNumber: 3,
        priority: "CRITICAL",
        reason: "Scikit-learn algorithms: Random Forest, SVM, Gradient Boosting & cross-validation.",
        status: "IN_PROGRESS",
        progressPercentage: 40,
        prerequisiteResourceIds: ["20000000-0000-0000-0003-000000000001"],
      },
      {
        id: "ai-4",
        resourceId: "20000000-0000-0000-0005-000000000001",
        resourceTitle: "Deep Neural Networks, PyTorch & Backpropagation",
        difficulty: "INTERMEDIATE",
        phase: "INTERMEDIATE",
        estimatedMinutes: 90,
        skillId: "00000000-0000-0000-0004-000000000002",
        skillName: "Deep Learning",
        sequenceNumber: 4,
        priority: "HIGH",
        reason: "Tensors, autograd, multilayer perceptrons, convolutional layers, and loss optimization.",
        status: "AVAILABLE",
        progressPercentage: 0,
        prerequisiteResourceIds: ["20000000-0000-0000-0001-000000000002"],
      },
      {
        id: "ai-5",
        resourceId: "20000000-0000-0000-0005-000000000002",
        resourceTitle: "Generative AI, LLMs & Retrieval Augmented Generation (RAG)",
        difficulty: "ADVANCED",
        phase: "ADVANCED",
        estimatedMinutes: 75,
        skillId: "00000000-0000-0000-0004-000000000004",
        skillName: "Prompt Engineering & LLMs",
        sequenceNumber: 5,
        priority: "CRITICAL",
        reason: "Vector databases, chunking strategies, embeddings, and few-shot prompt templates.",
        status: "LOCKED",
        progressPercentage: 0,
        prerequisiteResourceIds: ["20000000-0000-0000-0005-000000000001"],
      },
      {
        id: "ai-6",
        resourceId: "20000000-0000-0000-0003-000000000003",
        resourceTitle: "Production ML Pipelines & Model Serving",
        difficulty: "ADVANCED",
        phase: "ADVANCED",
        estimatedMinutes: 60,
        skillId: "00000000-0000-0000-0005-000000000004",
        skillName: "RESTful API Design",
        sequenceNumber: 6,
        priority: "MEDIUM",
        reason: "FastAPI inference microservices, ONNX runtime, and latency optimization.",
        status: "LOCKED",
        progressPercentage: 0,
        prerequisiteResourceIds: ["20000000-0000-0000-0005-000000000002"],
      },
    ],
  },
  "java": {
    id: "default-roadmap-java",
    careerId: "00000000-0000-0000-0002-000000000009",
    careerName: "Java Enterprise Developer",
    version: 1,
    status: "ACTIVE",
    generatedAt: "2026-11-03T00:00:00Z",
    totalSteps: 5,
    completedSteps: 2,
    progressPercentage: 40.0,
    steps: [
      {
        id: "java-1",
        resourceId: "20000000-0000-0000-0005-000000000001",
        resourceTitle: "Java 21 Modern Capabilities & Virtual Threads",
        difficulty: "BEGINNER",
        phase: "BEGINNER",
        estimatedMinutes: 60,
        skillId: "00000000-0000-0000-0001-000000000002",
        skillName: "Java",
        sequenceNumber: 1,
        priority: "CRITICAL",
        reason: "Records, sealed classes, pattern matching switch, and Project Loom virtual threads.",
        status: "COMPLETED",
        progressPercentage: 100,
        prerequisiteResourceIds: [],
      },
      {
        id: "java-2",
        resourceId: "20000000-0000-0000-0001-000000000003",
        resourceTitle: "Relational SQL & PostgreSQL Optimization",
        difficulty: "BEGINNER",
        phase: "BEGINNER",
        estimatedMinutes: 40,
        skillId: "00000000-0000-0000-0001-000000000005",
        skillName: "SQL & PostgreSQL",
        sequenceNumber: 2,
        priority: "CRITICAL",
        reason: "Database schema normalization, multi-table joins, and B-Tree indexing.",
        status: "COMPLETED",
        progressPercentage: 100,
        prerequisiteResourceIds: [],
      },
      {
        id: "java-3",
        resourceId: "20000000-0000-0000-0005-000000000002",
        resourceTitle: "Spring Boot 3 Enterprise REST APIs & Spring Data JPA",
        difficulty: "INTERMEDIATE",
        phase: "INTERMEDIATE",
        estimatedMinutes: 75,
        skillId: "00000000-0000-0000-0005-000000000002",
        skillName: "Spring Boot",
        sequenceNumber: 3,
        priority: "CRITICAL",
        reason: "Dependency injection, Spring Data JPA, JWT authentication, and Actuator monitoring.",
        status: "IN_PROGRESS",
        progressPercentage: 55,
        prerequisiteResourceIds: ["20000000-0000-0005-000000000001", "20000000-0000-0000-0001-000000000003"],
      },
      {
        id: "java-4",
        resourceId: "20000000-0000-0000-0001-000000000004",
        resourceTitle: "Data Structures & Algorithmic Problem Solving",
        difficulty: "INTERMEDIATE",
        phase: "INTERMEDIATE",
        estimatedMinutes: 65,
        skillId: "00000000-0000-0000-0007-000000000001",
        skillName: "Data Structures & Algorithms",
        sequenceNumber: 4,
        priority: "HIGH",
        reason: "Balanced binary search trees, topological sorting DAGs, and dynamic programming.",
        status: "AVAILABLE",
        progressPercentage: 0,
        prerequisiteResourceIds: ["20000000-0000-0005-000000000001"],
      },
      {
        id: "java-5",
        resourceId: "20000000-0000-0000-0003-000000000001",
        resourceTitle: "Containerized Microservice Deployment with Docker",
        difficulty: "ADVANCED",
        phase: "ADVANCED",
        estimatedMinutes: 50,
        skillId: "00000000-0000-0000-0006-000000000001",
        skillName: "Docker",
        sequenceNumber: 5,
        priority: "MEDIUM",
        reason: "Multi-stage Docker builds, Alpine JRE runtimes, and container orchestration.",
        status: "LOCKED",
        progressPercentage: 0,
        prerequisiteResourceIds: ["20000000-0000-0000-0005-000000000002"],
      },
    ],
  },
  "cloud": {
    id: "default-roadmap-cloud",
    careerId: "00000000-0000-0000-0002-000000000010",
    careerName: "Cloud & DevOps Architect",
    version: 1,
    status: "ACTIVE",
    generatedAt: "2026-11-03T00:00:00Z",
    totalSteps: 5,
    completedSteps: 1,
    progressPercentage: 20.0,
    steps: [
      {
        id: "cloud-1",
        resourceId: "20000000-0000-0000-0003-000000000001",
        resourceTitle: "Docker Containerization Fundamentals",
        difficulty: "BEGINNER",
        phase: "BEGINNER",
        estimatedMinutes: 40,
        skillId: "00000000-0000-0000-0006-000000000001",
        skillName: "Docker",
        sequenceNumber: 1,
        priority: "CRITICAL",
        reason: "Container runtimes, images, volume management, and networking bridges.",
        status: "COMPLETED",
        progressPercentage: 100,
        prerequisiteResourceIds: [],
      },
      {
        id: "cloud-2",
        resourceId: "20000000-0000-0000-0001-000000000001",
        resourceTitle: "Linux Administration & Bash Automation",
        difficulty: "BEGINNER",
        phase: "BEGINNER",
        estimatedMinutes: 45,
        skillId: "00000000-0000-0000-0006-000000000005",
        skillName: "Linux Administration",
        sequenceNumber: 2,
        priority: "CRITICAL",
        reason: "File permissions, systemd service units, cron jobs, and SSH key management.",
        status: "AVAILABLE",
        progressPercentage: 0,
        prerequisiteResourceIds: [],
      },
      {
        id: "cloud-3",
        resourceId: "20000000-0000-0000-0003-000000000003",
        resourceTitle: "CI/CD Automation with GitHub Actions",
        difficulty: "INTERMEDIATE",
        phase: "INTERMEDIATE",
        estimatedMinutes: 55,
        skillId: "00000000-0000-0000-0006-000000000003",
        skillName: "CI/CD Pipelines",
        sequenceNumber: 3,
        priority: "HIGH",
        reason: "Automated regression testing, linting gates, container pushes to registries.",
        status: "AVAILABLE",
        progressPercentage: 0,
        prerequisiteResourceIds: ["20000000-0000-0000-0003-000000000001"],
      },
      {
        id: "cloud-4",
        resourceId: "20000000-0000-0000-0005-000000000001",
        resourceTitle: "Kubernetes Cluster Orchestration & Ingress",
        difficulty: "ADVANCED",
        phase: "ADVANCED",
        estimatedMinutes: 80,
        skillId: "00000000-0000-0000-0006-000000000002",
        skillName: "Kubernetes",
        sequenceNumber: 4,
        priority: "HIGH",
        reason: "Pods, Deployments, ReplicaSets, ClusterIP services, and ConfigMaps.",
        status: "LOCKED",
        progressPercentage: 0,
        prerequisiteResourceIds: ["20000000-0000-0000-0003-000000000001"],
      },
      {
        id: "cloud-5",
        resourceId: "20000000-0000-0000-0005-000000000002",
        resourceTitle: "AWS Cloud Infrastructure & Well-Architected Framework",
        difficulty: "ADVANCED",
        phase: "ADVANCED",
        estimatedMinutes: 90,
        skillId: "00000000-0000-0000-0006-000000000004",
        skillName: "AWS Cloud Core",
        sequenceNumber: 5,
        priority: "CRITICAL",
        reason: "VPC subnets, security groups, RDS multi-AZ, IAM least-privilege, and S3.",
        status: "LOCKED",
        progressPercentage: 0,
        prerequisiteResourceIds: ["20000000-0000-0000-0005-000000000001"],
      },
    ],
  },
};

export default function LearnScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>("ALL");
  const [selectedTrackKey, setSelectedTrackKey] = useState<string>("fullstack");
  const [dailyTasksCompleted, setDailyTasksCompleted] = useState<Record<string, boolean>>({
    task1: true,
    task2: false,
    task3: false,
    task4: false,
  });

  const {
    data: roadmap,
    isLoading: isRoadmapLoading,
    isError: isRoadmapError,
    refetch: refetchRoadmap,
    isRefetching,
  } = useQuery({
    queryKey: ["activeRoadmap"],
    queryFn: () => api.getActiveRoadmap(),
  });

  const { data: storedEarnedCerts } = useQuery({
    queryKey: ["storedEarnedCerts"],
    queryFn: () => getStoredEarnedCertificates(),
  });

  // Query career detail to display required skills & skill gap breakdown on roadmap screen
  const { data: careerDetail } = useQuery({
    queryKey: ["careerDetail", roadmap?.careerId],
    queryFn: () => api.getCareerDetail(roadmap!.careerId),
    enabled: !!roadmap?.careerId,
  });

  // Query assessments list to link milestone steps to quizzes
  const { data: assessments } = useQuery({
    queryKey: ["assessments"],
    queryFn: () => api.getAssessments(),
  });

  // Query live careers from backend
  const { data: careers } = useQuery({
    queryKey: ["careers"],
    queryFn: () => api.getCareers(),
  });

  const refreshRoadmapMutation = useMutation({
    mutationFn: (careerId: string) => api.refreshRoadmap(careerId),
    onSuccess: (updatedRoadmap) => {
      queryClient.setQueryData(["activeRoadmap"], updatedRoadmap);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["evolutionHistory"] });
    },
    onError: (err: any) => {
      console.warn("Roadmap switch note:", err.message);
    },
  });

  const markCompleteMutation = useMutation({
    mutationFn: (resourceId: string) =>
      api.updateProgress({
        resourceId,
        status: "COMPLETED",
        progressPercentage: 100,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeRoadmap"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["evolutionHistory"] });
      Alert.alert("Milestone Completed", "Progress recorded and dependent skills unlocked!");
    },
  });

  const getStepStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge label="COMPLETED" variant="success" />;
      case "AVAILABLE":
        return <Badge label="AVAILABLE" variant="info" />;
      case "IN_PROGRESS":
        return <Badge label="IN PROGRESS" variant="warning" />;
      default:
        return <Badge label="LOCKED" variant="error" />;
    }
  };

  const handleStepPress = (step: RoadmapStep) => {
    if (step.status === "LOCKED") {
      Alert.alert(
        "Module Locked",
        "This learning step has prerequisite dependencies. Complete preceding available modules to unlock this topic."
      );
      return;
    }
    router.push(`/learning/${step.resourceId}`);
  };

  const toggleDailyTask = (taskId: string) => {
    setDailyTasksCompleted((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const phases = [
    { key: "BEGINNER", label: "Phase 1: Foundations", desc: "Core conceptual prerequisites & syntax fundamentals" },
    { key: "INTERMEDIATE", label: "Phase 2: Core Engineering", desc: "Applied architectures, APIs & production patterns" },
    { key: "ADVANCED", label: "Phase 3: Advanced Mastery", desc: "Performance optimization, security & scaling" },
  ];

  const fallbackRoadmap = DEFAULT_ROADMAPS[selectedTrackKey] || DEFAULT_ROADMAPS.fullstack;
  const rawRoadmap: Roadmap = (roadmap?.steps && roadmap.steps.length > 0) ? roadmap : fallbackRoadmap;

  // Dynamically enrich roadmap steps based on earned certificates & passed assessments
  const effectiveRoadmap: Roadmap = React.useMemo(() => {
    if (!rawRoadmap || !rawRoadmap.steps) return rawRoadmap;
    const certs = storedEarnedCerts || [];
    if (certs.length === 0) return rawRoadmap;

    let hasFoundActive = false;
    const steps = rawRoadmap.steps.map((step) => {
      const stepText = (step.resourceTitle + " " + step.skillName).toLowerCase();
      const isMatched = certs.some((c) => {
        const ct = (c.courseTitle + " " + (c.category || "")).toLowerCase();
        if (stepText.includes("typescript") && (ct.includes("react") || ct.includes("next.js") || ct.includes("typescript"))) return true;
        if (stepText.includes("postgresql") && (ct.includes("sql") || ct.includes("database") || ct.includes("spring"))) return true;
        if (stepText.includes("spring") && ct.includes("spring")) return true;
        if (stepText.includes("react") && (ct.includes("react") || ct.includes("next.js"))) return true;
        if (stepText.includes("python") && ct.includes("python")) return true;
        if (stepText.includes("docker") && ct.includes("docker")) return true;
        if (stepText.includes("data") && (ct.includes("data") || ct.includes("machine learning"))) return true;
        return false;
      });

      if (isMatched || step.status === "COMPLETED") {
        return {
          ...step,
          status: "COMPLETED" as const,
          progressPercentage: 100,
        };
      }

      if (!hasFoundActive) {
        hasFoundActive = true;
        return {
          ...step,
          status: "IN_PROGRESS" as const,
          progressPercentage: Math.max(step.progressPercentage || 0, 45),
        };
      }

      return step;
    });

    const completedCount = steps.filter((s) => s.status === "COMPLETED").length;
    const pct = Math.round((completedCount / steps.length) * 100);

    return {
      ...rawRoadmap,
      steps,
      completedSteps: completedCount,
      progressPercentage: pct,
    };
  }, [rawRoadmap, storedEarnedCerts]);

  const stepsList: RoadmapStep[] = effectiveRoadmap.steps || [];
  const filteredSteps = stepsList.filter((step) => {
    if (selectedPhaseFilter === "ALL") return true;
    const stepPhase =
      step.phase ||
      (step.difficulty === "ADVANCED"
        ? "ADVANCED"
        : step.difficulty === "INTERMEDIATE"
        ? "INTERMEDIATE"
        : "BEGINNER");
    return stepPhase === selectedPhaseFilter;
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetchRoadmap}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.responsiveWrapper}>
        {/* Header Info */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tagline}>ADAPTIVE LEARNING ROADMAP</Text>
              <Text style={styles.title}>{effectiveRoadmap.careerName}</Text>
            </View>
          </View>

          <Text style={styles.subtitle}>
            {effectiveRoadmap.completedSteps} of {effectiveRoadmap.totalSteps} milestones achieved (
            {(effectiveRoadmap.progressPercentage ?? 0).toFixed(0)}% complete)
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, Math.max(0, effectiveRoadmap.progressPercentage ?? 0))}%` },
              ]}
            />
          </View>
        </View>

        {/* Quick Career Goal Switcher */}
        <View style={{ marginBottom: spacing.md }}>
          <Text style={styles.trackSwitcherLabel}>CHOOSE CAREER GOAL ROADMAP</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trackScroll}>
            {CAREER_TRACKS.map((track) => {
              const isSelected = (!roadmap?.steps || roadmap.steps.length === 0)
                ? selectedTrackKey === track.key
                : effectiveRoadmap.careerName.toLowerCase().includes(track.key);
              return (
                <TouchableOpacity
                  key={track.key}
                  style={[styles.trackChip, isSelected && styles.trackChipActive]}
                  onPress={() => {
                    setSelectedTrackKey(track.key);
                    const defaultObj = DEFAULT_ROADMAPS[track.key];
                    const matchedCareer = (careers || []).find((c) =>
                      c.name.toLowerCase().includes(track.key.toLowerCase()) ||
                      c.category.toLowerCase().includes(track.key.toLowerCase())
                    );
                    const targetCareerId = matchedCareer?.id || defaultObj?.careerId;
                    if (targetCareerId && !targetCareerId.startsWith("00000000-0000-0000-0002-")) {
                      refreshRoadmapMutation.mutate(targetCareerId);
                    }
                  }}
                >
                  <Text style={[styles.trackChipText, isSelected && styles.trackChipTextActive]}>
                    {track.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Backend Connectivity Notice if Error */}
        {isRoadmapError && (
          <ErrorBanner
            title="Roadmap Connection Notice"
            message="Connecting to the roadmap planner. If the live backend is cold-starting on Render, please tap retry."
            onRetry={refetchRoadmap}
          />
        )}

        {/* Loading Skeletons */}
        {isRoadmapLoading && (
          <View>
            <CardSkeleton />
            <CardSkeleton />
          </View>
        )}

        {/* Target Career Competencies & Skill Gap Analysis Card */}
        {careerDetail && careerDetail.skillGaps && careerDetail.skillGaps.length > 0 && (
          <Card style={styles.careerGapCard}>
            <View style={styles.gapHeaderRow}>
              <View>
                <Text style={styles.gapCardTag}>ROLE COMPETENCIES & GAPS</Text>
                <Text style={styles.gapCardTitle}>{careerDetail.name} Skill Matrix</Text>
              </View>
              <Badge
                label={`${(careerDetail.compatibilityScore ?? 0).toFixed(0)}% Ready`}
                variant={(careerDetail.compatibilityScore ?? 0) >= 70 ? "success" : "warning"}
              />
            </View>

            <Text style={styles.gapCardSub}>
              Current proficiency vs required industry benchmark. Completing roadmap milestones closes these gaps:
            </Text>

            <View style={{ marginTop: spacing.sm }}>
              {careerDetail.skillGaps.slice(0, 4).map((gap) => (
                <View key={gap.skillId} style={styles.gapItemRow}>
                  <View style={styles.gapItemTop}>
                    <Text style={styles.gapSkillName}>{gap.skillName}</Text>
                    <Badge
                      label={gap.priority}
                      variant={
                        gap.priority === "MASTERED"
                          ? "success"
                          : gap.priority === "CRITICAL"
                          ? "error"
                          : "warning"
                      }
                    />
                  </View>
                  <ProficiencyBar
                    label=""
                    value={gap.currentProficiency}
                    targetValue={gap.requiredProficiency}
                  />
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Daily & Weekly Learning Sprint Checklist */}
        {effectiveRoadmap && (
          <Card style={styles.dailyTaskCard}>
            <View style={styles.dailyTaskHeader}>
              <Text style={styles.dailyTaskTitle}>🎯 Active Learning Sprint</Text>
              <Text style={styles.dailyTaskDate}>Daily & Weekly Goals</Text>
            </View>

            <TouchableOpacity
              style={styles.taskItem}
              activeOpacity={0.8}
              onPress={() => toggleDailyTask("task1")}
            >
              <View style={[styles.checkbox, dailyTasksCompleted.task1 && styles.checkboxDone]}>
                {dailyTasksCompleted.task1 && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.taskText, dailyTasksCompleted.task1 && styles.taskTextDone]}>
                Study next active roadmap module & run code examples (25 min)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.taskItem}
              activeOpacity={0.8}
              onPress={() => toggleDailyTask("task2")}
            >
              <View style={[styles.checkbox, dailyTasksCompleted.task2 && styles.checkboxDone]}>
                {dailyTasksCompleted.task2 && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.taskText, dailyTasksCompleted.task2 && styles.taskTextDone]}>
                Watch 1 recommended SmartEvolve deep-dive video masterclass
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.taskItem}
              activeOpacity={0.8}
              onPress={() => toggleDailyTask("task3")}
            >
              <View style={[styles.checkbox, dailyTasksCompleted.task3 && styles.checkboxDone]}>
                {dailyTasksCompleted.task3 && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.taskText, dailyTasksCompleted.task3 && styles.taskTextDone]}>
                Take a skill diagnostic assessment to trigger AI evolution
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.taskItem}
              activeOpacity={0.8}
              onPress={() => toggleDailyTask("task4")}
            >
              <View style={[styles.checkbox, dailyTasksCompleted.task4 && styles.checkboxDone]}>
                {dailyTasksCompleted.task4 && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.taskText, dailyTasksCompleted.task4 && styles.taskTextDone]}>
                Weekly Milestone: Complete at least 2 prerequisite milestones
              </Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* YouTube Academy Gateway */}
        {effectiveRoadmap && (
          <TouchableOpacity
            style={styles.youtubeAcademyBanner}
            activeOpacity={0.88}
            onPress={() => router.push("/videos")}
          >
            <View style={styles.ytBannerLeft}>
              <View style={styles.ytIconCircle}>
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF">
                  <Path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </Svg>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.ytBannerTitle}>SmartEvolve Academy</Text>
                <Text style={styles.ytBannerSub}>Curated ad-free video masterclasses aligned with your skill gaps</Text>
              </View>
            </View>
            <Text style={styles.ytBannerArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Learning Phase Filter Chips */}
        {effectiveRoadmap && (
          <View style={{ marginBottom: spacing.md }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.phaseFilterBar}>
              <TouchableOpacity
                style={[styles.filterChip, selectedPhaseFilter === "ALL" && styles.filterChipActive]}
                onPress={() => setSelectedPhaseFilter("ALL")}
              >
                <Text style={[styles.filterChipText, selectedPhaseFilter === "ALL" && styles.filterChipTextActive]}>
                  All Phases ({stepsList.length})
                </Text>
              </TouchableOpacity>
              {phases.map((ph) => {
                const count = stepsList.filter(
                  (s) =>
                    (s.phase ||
                      (s.difficulty === "ADVANCED"
                        ? "ADVANCED"
                        : s.difficulty === "INTERMEDIATE"
                        ? "INTERMEDIATE"
                        : "BEGINNER")) === ph.key
                ).length;
                return (
                  <TouchableOpacity
                    key={ph.key}
                    style={[styles.filterChip, selectedPhaseFilter === ph.key && styles.filterChipActive]}
                    onPress={() => setSelectedPhaseFilter(ph.key)}
                  >
                    <Text style={[styles.filterChipText, selectedPhaseFilter === ph.key && styles.filterChipTextActive]}>
                      {ph.label.split(":")[0]} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Sequence of Ordered Steps */}
        {effectiveRoadmap && (
          <View style={styles.timelineList}>
            {filteredSteps.map((step, idx) => {
              const isCompleted = step.status === "COMPLETED";
              const isAvailable = step.status === "AVAILABLE" || step.status === "IN_PROGRESS";
              const phase =
                step.phase ||
                (step.difficulty === "ADVANCED"
                  ? "ADVANCED"
                  : step.difficulty === "INTERMEDIATE"
                  ? "INTERMEDIATE"
                  : "BEGINNER");

              // Look up if an assessment exists for this milestone's skill
              const stepAssessment = (assessments || []).find((a) => a.skillId === step.skillId);

              return (
                <View key={step.id} style={styles.stepCardWrap}>
                  {/* Connector line between steps */}
                  {idx < filteredSteps.length - 1 && (
                    <View
                      style={[
                        styles.connectorLine,
                        isCompleted && styles.connectorLineDone,
                      ]}
                    />
                  )}

                  {/* Sequence number badge */}
                  <View
                    style={[
                      styles.seqBadge,
                      isCompleted
                        ? styles.seqBadgeDone
                        : isAvailable
                        ? styles.seqBadgeActive
                        : styles.seqBadgeLocked,
                    ]}
                  >
                    {isCompleted ? (
                      <Text style={styles.seqTextDone}>✓</Text>
                    ) : (
                      <Text style={styles.seqText}>{step.sequenceNumber}</Text>
                    )}
                  </View>

                  {/* Step Card */}
                  <Card
                    style={[
                      styles.cardBody,
                      isAvailable ? styles.cardActiveBorder : undefined,
                      !isAvailable && !isCompleted ? styles.cardLockedOpacity : undefined,
                    ]}
                  >
                    <TouchableOpacity activeOpacity={0.85} onPress={() => handleStepPress(step)}>
                      <View style={styles.cardTop}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          {getStepStatusBadge(step.status)}
                          <Badge label={phase} variant="info" />
                        </View>
                        <Text style={styles.stepDuration}>{step.estimatedMinutes} mins</Text>
                      </View>

                      <Text style={styles.stepTitle}>{step.resourceTitle}</Text>
                      <Text style={styles.stepSkill}>
                        Target Skill: <Text style={{ color: colors.accent, fontWeight: "700" }}>{step.skillName}</Text>
                      </Text>
                      <Text style={styles.stepReason}>{step.reason}</Text>

                      {/* Progress Indicator */}
                      <View style={styles.stepProgressRow}>
                        <Text style={styles.stepProgressLabel}>Milestone Progress</Text>
                        <Text style={styles.stepProgressVal}>
                          {step.progressPercentage ?? (isCompleted ? 100 : 0)}%
                        </Text>
                      </View>
                      <View style={styles.stepProgressBar}>
                        <View
                          style={[
                            styles.stepProgressFill,
                            { width: `${step.progressPercentage ?? (isCompleted ? 100 : 0)}%` },
                          ]}
                        />
                      </View>
                    </TouchableOpacity>

                    {/* Direct Action Buttons */}
                    <View style={styles.cardActionRow}>
                      {isAvailable && (
                        <TouchableOpacity
                          style={styles.actionBtnPrimary}
                          onPress={() => router.push(`/learning/${step.resourceId}`)}
                        >
                          <Text style={styles.actionBtnPrimaryText}>
                            {step.status === "IN_PROGRESS" ? "Continue Lesson" : "Start Learning"}
                          </Text>
                        </TouchableOpacity>
                      )}

                      {isAvailable && !isCompleted && (
                        <TouchableOpacity
                          style={styles.actionBtnSecondary}
                          onPress={() => markCompleteMutation.mutate(step.resourceId)}
                          disabled={markCompleteMutation.isPending}
                        >
                          <Text style={styles.actionBtnSecondaryText}>Mark Completed</Text>
                        </TouchableOpacity>
                      )}

                      {stepAssessment && (
                        <TouchableOpacity
                          style={styles.actionBtnQuiz}
                          onPress={() => router.push(`/assessment/${stepAssessment.id}`)}
                        >
                          <Text style={styles.actionBtnQuizText}>Quiz</Text>
                        </TouchableOpacity>
                      )}

                      {isCompleted && (
                        <View style={styles.completedTagRow}>
                          <Text style={styles.completedTagText}>✓ Mastery Recorded</Text>
                        </View>
                      )}
                    </View>
                  </Card>
                </View>
              );
            })}
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
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  responsiveWrapper: {
    width: "100%",
    alignSelf: "stretch",
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  tagline: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 2,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  refreshBtn: {
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  refreshBtnText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    marginTop: spacing.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  trackSwitcherLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  trackScroll: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  trackChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    marginRight: spacing.xs,
  },
  trackChipActive: {
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    borderColor: colors.primary,
  },
  trackChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  trackChipTextActive: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  careerGapCard: {
    padding: spacing.md,
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    borderColor: "rgba(99, 102, 241, 0.3)",
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  gapHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  gapCardTag: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  gapCardTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 2,
  },
  gapCardSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  gapItemRow: {
    marginBottom: 10,
  },
  gapItemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  gapSkillName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  dailyTaskCard: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  dailyTaskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  dailyTaskTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  dailyTaskDate: {
    color: colors.textMuted,
    fontSize: 11,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "900",
  },
  taskText: {
    color: colors.textPrimary,
    fontSize: 13,
    flex: 1,
  },
  taskTextDone: {
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
  youtubeAcademyBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  ytBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  ytIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  ytBannerTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  ytBannerSub: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  ytBannerArrow: {
    color: "#EF4444",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: spacing.sm,
  },
  phaseFilterBar: {
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#FFF",
  },
  timelineList: {
    position: "relative",
  },
  stepCardWrap: {
    position: "relative",
    paddingLeft: 36,
    marginBottom: spacing.md,
  },
  connectorLine: {
    position: "absolute",
    left: 15,
    top: 32,
    bottom: -16,
    width: 2,
    backgroundColor: colors.cardBorder,
  },
  connectorLineDone: {
    backgroundColor: colors.success,
  },
  seqBadge: {
    position: "absolute",
    left: 0,
    top: 4,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  seqBadgeDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  seqBadgeActive: {
    backgroundColor: colors.surface,
    borderColor: colors.accent,
  },
  seqBadgeLocked: {
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
  },
  seqText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
  seqTextDone: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "900",
  },
  cardBody: {
    padding: spacing.md,
  },
  cardActiveBorder: {
    borderColor: colors.accent,
    borderWidth: 1,
  },
  cardLockedOpacity: {
    opacity: 0.65,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  stepDuration: {
    color: colors.textMuted,
    fontSize: 12,
  },
  stepTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  stepSkill: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  stepReason: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: spacing.sm,
  },
  stepProgressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  stepProgressLabel: {
    color: colors.textMuted,
    fontSize: 11,
  },
  stepProgressVal: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: "700",
  },
  stepProgressBar: {
    height: 4,
    backgroundColor: colors.background,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  stepProgressFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  cardActionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 4,
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.sm,
  },
  actionBtnPrimaryText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  actionBtnSecondary: {
    backgroundColor: "transparent",
    borderColor: colors.cardBorder,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  actionBtnSecondaryText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  actionBtnQuiz: {
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    borderColor: "rgba(99, 102, 241, 0.4)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  actionBtnQuizText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  completedTagRow: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  completedTagText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    marginTop: spacing.md,
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
});
