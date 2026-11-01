export type UserRole = "STUDENT" | "MENTOR" | "ADMIN" | "RECRUITER" | "FACULTY" | "EMPLOYER";

export interface Profile {
  id: string;
  fullName: string;
  role?: UserRole;
  educationLevel: string;
  institution: string;
  branch: string;
  graduationYear: number;
  interests: string[];
  preferredLearningStyle?: string;
  academicGoals?: string;
  targetCareerId?: string;
  targetCareerName?: string;
  onboardingCompleted: boolean;
  createdAt?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface StudentSkill {
  id: string;
  skillId: string;
  skillName: string;
  category: string;
  proficiency: number;
  confidence: number;
  evidenceType: string;
  lastAssessedAt?: string;
}

export interface Career {
  id: string;
  name: string;
  description: string;
  category: string;
  compatibilityScore: number;
  readinessLevel: "READY" | "HIGH_POTENTIAL" | "DEVELOPING" | "EARLY_STAGE";
  requiredSkillsCount: number;
  difficulty?: "BEGINNER_FRIENDLY" | "INTERMEDIATE" | "ADVANCED";
  estimatedPreparationWeeks?: number;
}

export interface SkillMatchDetail {
  skillId: string;
  skillName: string;
  category: string;
  currentProficiency: number;
  requiredProficiency: number;
  fulfillmentPercentage: number;
  importanceWeight: number;
  status: "MATCHED" | "PARTIAL" | "MISSING";
}

export interface SkillGapItem {
  skillId: string;
  skillName: string;
  category: string;
  currentProficiency: number;
  requiredProficiency: number;
  gap: number;
  importanceWeight: number;
  weightedDeficit: number;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "MASTERED";
  isMet: boolean;
}

export interface CareerDetail {
  id: string;
  name: string;
  description: string;
  category: string;
  isCurrentGoal: boolean;
  compatibilityScore: number;
  readinessLevel: string;
  difficulty?: "BEGINNER_FRIENDLY" | "INTERMEDIATE" | "ADVANCED";
  estimatedPreparationWeeks?: number;
  explanation: string;
  matchedSkills: SkillMatchDetail[];
  partiallyMatchedSkills: SkillMatchDetail[];
  missingSkills: SkillMatchDetail[];
  skillGaps: SkillGapItem[];
}

export interface LearningResource {
  id: string;
  title: string;
  description: string;
  skillId: string;
  skillName: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  contentType: string;
  contentBody: string;
  externalUrl?: string;
  estimatedMinutes: number;
  prerequisiteResourceIds: string[];
  progressStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  progressPercentage: number;
  isUnlocked: boolean;
}

export interface Question {
  id: string;
  questionText: string;
  questionType: string;
  options: string; // JSON string: [{"id":"A","text":"..."}, ...]
  marks: number;
  orderIndex: number;
}

export interface Assessment {
  id: string;
  title: string;
  skillId: string;
  skillName: string;
  difficulty: string;
  assessmentType: string;
  totalQuestions: number;
  latestScorePercentage?: number;
  totalAttempts: number;
  questions?: Question[];
}

export interface QuestionReviewItem {
  questionId: string;
  questionText: string;
  submittedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  awardedMarks: number;
  explanation: string;
}

export interface AssessmentResult {
  attemptId: string;
  assessmentId: string;
  assessmentTitle: string;
  skillId: string;
  skillName: string;
  score: number;
  maximumScore: number;
  percentage: number;
  attemptNumber: number;
  timeTakenSeconds: number;
  submittedAt: string;
  previousProficiency: number;
  newProficiency: number;
  proficiencyDelta: number;
  updatedConfidence: number;
  evolutionReason: string;
  questionReviews: QuestionReviewItem[];
}

export interface RoadmapStep {
  id: string;
  resourceId: string;
  resourceTitle: string;
  difficulty: string;
  phase?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  contentType?: string;
  externalUrl?: string;
  progressPercentage?: number;
  estimatedMinutes: number;
  skillId: string;
  skillName: string;
  sequenceNumber: number;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  reason: string;
  status: "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED";
  prerequisiteResourceIds: string[];
}

export interface Roadmap {
  id: string;
  careerId: string;
  careerName: string;
  version: number;
  status: string;
  totalSteps: number;
  completedSteps: number;
  progressPercentage: number;
  generatedAt: string;
  steps: RoadmapStep[];
}

export interface Recommendation {
  id: string;
  skillId?: string;
  skillName?: string;
  resourceId?: string;
  resourceTitle?: string;
  difficulty?: string;
  estimatedMinutes?: number;
  careerId?: string;
  careerName?: string;
  recommendationType: string;
  priority: string;
  reason: string;
  status: string;
  createdAt: string;
}

export interface Credential {
  id: string;
  credentialType: string;
  skillId?: string;
  skillName?: string;
  achievementTitle: string;
  achievementDataHash: string;
  issuerAddress: string;
  networkId: string;
  contractAddress: string;
  transactionHash: string;
  blockNumber?: number;
  status: "PENDING" | "CONFIRMED" | "FAILED" | "REVOKED";
  issuedAt: string;
  verifiedAt?: string;
}

export interface VerifyCredentialResponse {
  credentialId: string;
  achievementTitle: string;
  valid: boolean;
  status: string;
  transactionHash: string;
  contractAddress: string;
  issuerAddress: string;
  networkId?: string;
  achievementDataHash?: string;
  blockNumber?: number;
  onChainTimestamp?: string;
  verificationMessage: string;
}

export interface EvolutionHistory {
  id: string;
  skillId: string;
  skillName: string;
  category: string;
  previousProficiency: number;
  newProficiency: number;
  delta: number;
  changeReason: string;
  evidenceType: string;
  evidenceReference: string;
  profileVersion: number;
  createdAt: string;
}

export interface DashboardSummary {
  studentName: string;
  onboardingCompleted: boolean;
  targetCareerId?: string;
  targetCareerName: string;
  overallProficiency: number;
  careerReadinessScore: number;
  readinessLevel: string;
  totalSkillsAssessed: number;
  completedActivitiesCount: number;
  pendingAssessmentsCount: number;
  topSkills: StudentSkill[];
  recentlyImprovedSkills: StudentSkill[];
  activeRoadmap?: Roadmap;
  recommendations: Recommendation[];
  verifiedCredentials: Credential[];
  weeklyActivity: {
    day: string;
    minutesSpent: number;
    lessonsCompleted: number;
    assessmentsTaken: number;
  }[];
}

export interface Analytics {
  overallProficiency: number;
  totalGain: number;
  growthRatePerAttempt: number;
  trajectory: string;
  totalLessonsCompleted: number;
  totalAssessmentsTaken: number;
  totalCredentialsEarned: number;
  categoryProficiencies: Record<string, number>;
  proficiencyTimeline: {
    date: string;
    averageProficiency: number;
  }[];
}

export interface YouTubeVideo {
  id: string;
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  duration: string;
  estimatedMinutes: number;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  skillId?: string;
  skillName?: string;
  category?: string;
  viewCount?: string;
  videoUrl: string;
  embedUrl: string;
  watchStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  progressPercentage: number;
  watchedSeconds: number;
  totalSeconds: number;
  lastWatchedAt?: string;
  recommendationReason?: string;
  isSavedForLater?: boolean;
}

export interface YouTubeSkillSummary {
  skillId: string;
  skillName: string;
  category: string;
  videoCount: number;
}

export interface UpdateVideoProgressRequest {
  videoId?: string;
  youtubeVideoId?: string;
  watchedSeconds: number;
  totalSeconds?: number;
  status?: "IN_PROGRESS" | "COMPLETED";
}

export interface EligibleCredential {
  milestoneId: string;
  title: string;
  description: string;
  credentialType: string;
  skillId?: string;
  skillName?: string;
  achievementHash: string;
  eligibleSince: string;
}

export interface ClaimCredentialRequest {
  milestoneId: string;
  credentialType: string;
  title: string;
  skillId?: string;
  skillName?: string;
  achievementDataHash?: string;
}

export interface TrendAnalysisSummary {
  growthTrajectory: string;
  totalEvolutionEventsCount: number;
  strongestSkills: string[];
  weakestSkills: string[];
  recommendedNextActions: string[];
}

// ==========================================
// RBAC: MENTOR / FACULTY TYPES
// ==========================================
export interface AssignedStudent {
  studentId: string;
  fullName: string;
  branch: string;
  institution: string;
  graduationYear?: number;
  targetCareerName?: string;
  overallProficiency?: number;
  careerReadiness?: number;
  readinessLevel?: string;
  completedModulesCount: number;
  assignmentStatus: string;
  mentorNotes?: string;
  topSkills?: StudentSkill[];
  assignedAt?: string;
}

export interface MentorDashboardSummary {
  mentorId: string;
  mentorName: string;
  institution?: string;
  branch?: string;
  totalAssignedStudents: number;
  averageCohortProficiency: number;
  activeRoadmapsCount: number;
  students: AssignedStudent[];
}

export interface MentorFeedbackRequest {
  feedbackText: string;
  suggestedSkillId?: string;
  priority?: "HIGH" | "MEDIUM" | "LOW";
}

// ==========================================
// RBAC: ADMIN TYPES
// ==========================================
export interface AdminUser {
  id: string;
  fullName: string;
  role: UserRole;
  institution?: string;
  branch?: string;
  educationLevel?: string;
  graduationYear?: number;
  onboardingCompleted?: boolean;
  createdAt?: string;
}

export interface PlatformSettings {
  aiModel: string;
  recommendationEngineVersion: string;
  blockchainNetwork: string;
  smartContractAddress: string;
  rlsEnforced: boolean;
  strictModeEnabled: boolean;
  allowStudentRegistration: boolean;
}

export interface AdminDashboardSummary {
  totalUsers: number;
  studentCount: number;
  mentorCount: number;
  adminCount: number;
  recruiterCount: number;
  totalSkills: number;
  totalCareers: number;
  totalLearningResources: number;
  totalCredentialsIssued: number;
  systemHealthStatus: string;
  activeNetwork: string;
  recommendationEngine: string;
  recentUsers: AdminUser[];
}

// ==========================================
// RBAC: RECRUITER / EMPLOYER TYPES
// ==========================================
export interface CandidateSummary {
  studentId: string;
  fullName: string;
  educationLevel?: string;
  institution?: string;
  branch?: string;
  graduationYear?: number;
  targetCareerName?: string;
  readinessLevel?: string;
  careerReadiness?: number;
  overallProficiency?: number;
  verifiedCredentialsCount: number;
  topSkills?: StudentSkill[];
  sharedAt?: string;
  shareNotes?: string;
}

export interface CandidateDossier {
  studentId: string;
  fullName: string;
  educationLevel?: string;
  institution?: string;
  branch?: string;
  graduationYear?: number;
  interests?: string[];
  academicGoals?: string;
  targetCareerName?: string;
  careerReadiness?: number;
  readinessLevel?: string;
  overallProficiency?: number;
  skills: StudentSkill[];
  verifiedCredentials: Credential[];
  roadmapMilestones: RoadmapStep[];
  sharedAt?: string;
}

export interface RecruiterDashboardSummary {
  recruiterId: string;
  recruiterName: string;
  organization?: string;
  sharedCandidatesCount: number;
  verifiedCredentialsCount: number;
  candidates: CandidateSummary[];
}

// ==========================================
// RBAC: STUDENT PROFILE SHARING TYPES
// ==========================================
export interface ProfileShare {
  id: string;
  recruiterId: string;
  recruiterName: string;
  recruiterCompany?: string;
  status: string;
  notes?: string;
  sharedAt: string;
}

export interface ShareProfileRequest {
  recruiterId: string;
  notes?: string;
}

// ==========================================
// NOTIFICATIONS & STUDY PLANNER TYPES
// ==========================================
export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "ACHIEVEMENT" | "MILESTONE" | "FEEDBACK" | "SYSTEM" | "ASSESSMENT";
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface StudyPlanGoal {
  id: string;
  title: string;
  skillName: string;
  estimatedMinutes: number;
  completed: boolean;
  dueDate?: string;
}

// ==========================================
// AI STUDY ASSISTANT TYPES
// ==========================================
export interface StudyAssistantRequest {
  question: string;
  skillId?: string;
  topicTitle?: string;
  targetCareerId?: string;
  contextMode?: "EXPLANATION" | "QUIZ_PREP" | "STUDY_PLAN" | "GENERAL";
}

export interface StudyAssistantResponse {
  answer: string;
  keyConcepts: string[];
  recommendedTopics: string[];
  practiceQuestion?: {
    questionText: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
  };
  sourcesOrReferences?: string[];
}


