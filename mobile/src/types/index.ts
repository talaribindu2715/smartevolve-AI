export interface Profile {
  id: string;
  fullName: string;
  educationLevel: string;
  institution: string;
  branch: string;
  graduationYear: number;
  interests: string[];
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
