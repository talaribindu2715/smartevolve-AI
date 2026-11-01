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
  EligibleCredential,
  ClaimCredentialRequest,
  TrendAnalysisSummary,
  MentorDashboardSummary,
  AssignedStudent,
  MentorFeedbackRequest,
  AdminDashboardSummary,
  AdminUser,
  PlatformSettings,
  RecruiterDashboardSummary,
  CandidateSummary,
  CandidateDossier,
  ProfileShare,
  ShareProfileRequest,
  UserRole,
  StudyAssistantRequest,
  StudyAssistantResponse,
  AppNotification,
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
  const activeRole = await secureStorage.getActiveRole();
  const userId = await secureStorage.getUserId();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (activeRole) {
    headers["X-Demo-Role"] = activeRole;
  }
  if (userId) {
    headers["X-Demo-User-Id"] = userId;
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
  // Authentication
  login: (data: { email: string; password: string }) =>
    apiFetch<{ token: string; tokenType: string; userId: string; email: string; fullName: string; role: string }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    educationLevel?: string;
    institution?: string;
    branch?: string;
    graduationYear?: number;
    interests?: string;
  }) =>
    apiFetch<{ token: string; tokenType: string; userId: string; email: string; fullName: string; role: string }>(
      "/api/auth/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),
  forgotPassword: (email: string) =>
    apiFetch<{ message: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (email: string, newPassword: string) =>
    apiFetch<{ message: string }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, newPassword }),
    }),

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
  getTrends: () => apiFetch<TrendAnalysisSummary>("/api/evolution/trends"),
  recalculateEvolution: () =>
    apiFetch<{ message: string; historyCount: number }>("/api/evolution/recalculate", {
      method: "POST",
    }),

  // Blockchain Credentials
  getCredentials: () => apiFetch<Credential[]>("/api/credentials"),
  getEligibleCredentials: () => apiFetch<EligibleCredential[]>("/api/credentials/eligible"),
  claimCredential: (data: ClaimCredentialRequest) =>
    apiFetch<Credential>("/api/credentials/claim", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  verifyCredential: (id: string) =>
    apiFetch<VerifyCredentialResponse>(`/api/credentials/${id}/verify`, {
      method: "POST",
    }),
  getPublicCredentialVerification: (id: string) =>
    apiFetch<VerifyCredentialResponse>(`/api/credentials/public/${id}`),

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

  // ==========================================
  // RBAC: MENTOR API
  // ==========================================
  getMentorDashboard: () =>
    apiFetch<MentorDashboardSummary>("/api/mentor/dashboard"),

  getAssignedStudents: () =>
    apiFetch<AssignedStudent[]>("/api/mentor/students"),

  getMentorStudentDetail: (studentId: string) =>
    apiFetch<CandidateDossier>(`/api/mentor/students/${studentId}`),

  submitMentorFeedback: (studentId: string, data: MentorFeedbackRequest) =>
    apiFetch<AssignedStudent>(`/api/mentor/students/${studentId}/feedback`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // ==========================================
  // RBAC: ADMIN API
  // ==========================================
  getAdminDashboard: () =>
    apiFetch<AdminDashboardSummary>("/api/admin/dashboard"),

  getAdminUsers: (role?: string) => {
    const qs = role && role !== "ALL" ? `?role=${role}` : "";
    return apiFetch<AdminUser[]>(`/api/admin/users${qs}`);
  },

  updateUserRole: (userId: string, role: string) =>
    apiFetch<AdminUser>(`/api/admin/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    }),

  getPlatformSettings: () =>
    apiFetch<PlatformSettings>("/api/admin/settings"),

  updatePlatformSettings: (settings: Partial<PlatformSettings>) =>
    apiFetch<PlatformSettings>("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    }),

  // ==========================================
  // RBAC: RECRUITER API
  // ==========================================
  getRecruiterDashboard: () =>
    apiFetch<RecruiterDashboardSummary>("/api/recruiter/dashboard"),

  getSharedCandidates: () =>
    apiFetch<CandidateSummary[]>("/api/recruiter/candidates"),

  getCandidateDossier: (studentId: string) =>
    apiFetch<CandidateDossier>(`/api/recruiter/candidates/${studentId}`),

  verifyRecruiterCertificate: (credentialId: string) =>
    apiFetch<VerifyCredentialResponse>(`/api/recruiter/verify-certificate/${credentialId}`, {
      method: "POST",
    }),

  // ==========================================
  // RBAC: STUDENT PROFILE SHARING
  // ==========================================
  getMyProfileShares: () =>
    apiFetch<ProfileShare[]>("/api/profiles/shares"),

  shareProfileWithRecruiter: (data: ShareProfileRequest) =>
    apiFetch<ProfileShare>("/api/profiles/shares", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAvailableRecruiters: () =>
    apiFetch<AdminUser[]>("/api/profiles/recruiters"),

  // ==========================================
  // AI STUDY ASSISTANT API
  // ==========================================
  askStudyAssistant: (data: StudyAssistantRequest) =>
    apiFetch<StudyAssistantResponse>("/api/assistant/ask", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  explainTopic: (topic: string) =>
    apiFetch<StudyAssistantResponse>(`/api/assistant/explain/${encodeURIComponent(topic)}`),

  getQuizPrep: (skillId: string) =>
    apiFetch<StudyAssistantResponse>(`/api/assistant/quiz-prep/${skillId}`),

  // ==========================================
  // NOTIFICATIONS API
  // ==========================================
  getNotifications: () =>
    apiFetch<AppNotification[]>("/api/notifications"),

  markNotificationAsRead: (id: string) =>
    apiFetch<{ message: string }>(`/api/notifications/${id}/read`, {
      method: "PUT",
    }),

  markAllNotificationsAsRead: () =>
    apiFetch<{ message: string }>("/api/notifications/read-all", {
      method: "PUT",
    }),
};
