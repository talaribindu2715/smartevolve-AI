import { Platform } from "react-native";
import { secureStorage } from "../services/secureStorage";
import {
  Profile,
  Skill,
  StudentSkill,
  Career,
  CareerDetail,
  LearningResource,
  Assessment,
  AssessmentResult,
  Roadmap,
  Recommendation,
  Credential,
  VerifyCredentialResponse,
  EvolutionHistory,
  DashboardSummary,
  Analytics,
  YouTubeVideo,
  YouTubeSkillSummary,
  UpdateVideoProgressRequest,
} from "../types";

// Dynamic API base URL configuration:
// - Android Emulator uses 10.0.2.2 to reach host machine localhost:8080
// - iOS Simulator and Web use localhost:8080
// - Production builds use EXPO_PUBLIC_API_URL (e.g. Render backend URL)
const DEFAULT_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:8080"
    : "http://localhost:8080";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || DEFAULT_URL;

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await secureStorage.getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errBody = await response.json();
      if (errBody.message) errorMsg = errBody.message;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return await response.json();
}

export const api = {
  // Profile
  getProfile: () => apiFetch<Profile>("/api/profiles/me"),
  updateProfile: (data: Partial<Profile>) =>
    apiFetch<Profile>("/api/profiles/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Dashboard
  getDashboard: () => apiFetch<DashboardSummary>("/api/dashboard"),

  // Skills
  getAllSkills: () => apiFetch<Skill[]>("/api/skills"),
  getMySkills: () => apiFetch<StudentSkill[]>("/api/skills/my"),
  saveSkill: (data: { skillId: string; proficiency: number; selfRating1To5?: number }) =>
    apiFetch<StudentSkill>("/api/skills/self-report", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Careers
  getCareers: () => apiFetch<Career[]>("/api/careers"),
  getCareerDetail: (id: string) => apiFetch<CareerDetail>(`/api/careers/${id}`),
  setCareerGoal: (id: string) =>
    apiFetch<{ message: string }>(`/api/careers/${id}/set-goal`, {
      method: "POST",
    }),

  // Learning
  getResources: () => apiFetch<LearningResource[]>("/api/learning"),
  getResourceDetail: (id: string) => apiFetch<LearningResource>(`/api/learning/${id}`),
  updateProgress: (data: { resourceId: string; status: string; progressPercentage?: number }) =>
    apiFetch<LearningResource>("/api/learning/progress", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Roadmaps
  getActiveRoadmap: () => apiFetch<Roadmap>("/api/roadmaps/active"),
  refreshRoadmap: (careerId: string) =>
    apiFetch<Roadmap>(`/api/roadmaps/refresh/${careerId}`, {
      method: "POST",
    }),

  // Assessments
  getAssessments: () => apiFetch<Assessment[]>("/api/assessments"),
  getAssessmentQuestions: (id: string) => apiFetch<Assessment>(`/api/assessments/${id}`),
  submitAssessment: (data: {
    assessmentId: string;
    timeTakenSeconds?: number;
    responses: { questionId: string; submittedAnswer: string }[];
  }) =>
    apiFetch<AssessmentResult>("/api/assessments/submit", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Evolution & Trends
  getEvolutionHistory: () => apiFetch<EvolutionHistory[]>("/api/evolution/history"),
  getTrends: () => apiFetch<any>("/api/evolution/trends"),

  // Blockchain Credentials
  getCredentials: () => apiFetch<Credential[]>("/api/credentials"),
  verifyCredential: (id: string) =>
    apiFetch<VerifyCredentialResponse>(`/api/credentials/${id}/verify`, {
      method: "POST",
    }),

  // Analytics
  getAnalytics: () => apiFetch<Analytics>("/api/analytics"),

  // YouTube Educational Pipeline
  getYouTubeVideos: (params?: { skillId?: string; difficulty?: string; query?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.skillId) searchParams.append("skillId", params.skillId);
    if (params?.difficulty) searchParams.append("difficulty", params.difficulty);
    if (params?.query) searchParams.append("query", params.query);
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    const qs = searchParams.toString();
    return apiFetch<YouTubeVideo[]>(`/api/youtube/videos${qs ? `?${qs}` : ""}`);
  },

  getYouTubeVideoDetail: (idOrVideoId: string) =>
    apiFetch<YouTubeVideo>(`/api/youtube/videos/${idOrVideoId}`),

  getRecommendedYouTubeVideos: () =>
    apiFetch<YouTubeVideo[]>("/api/youtube/recommended"),

  getYouTubeSkills: () =>
    apiFetch<YouTubeSkillSummary[]>("/api/youtube/skills"),

  updateVideoProgress: (data: UpdateVideoProgressRequest) =>
    apiFetch<YouTubeVideo>("/api/youtube/progress", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  ingestYouTubeVideos: (query: string, skillId?: string) => {
    const searchParams = new URLSearchParams({ query });
    if (skillId) searchParams.append("skillId", skillId);
    return apiFetch<YouTubeVideo[]>(`/api/youtube/ingest?${searchParams.toString()}`, {
      method: "POST",
    });
  },
};
