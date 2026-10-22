-- ==============================================================================
-- SmartEvolve AI: Supabase PostgreSQL Initial Database Migration
-- Version: V1__initial_schema.sql
-- Description: Complete schema for Student Profiling, Adaptive AI Recommendations,
--              Learning Progress, Assessments, and Blockchain Credential Records.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    education_level VARCHAR(100),
    institution VARCHAR(255),
    branch VARCHAR(150),
    graduation_year INTEGER,
    interests JSONB DEFAULT '[]'::jsonb,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SKILLS
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STUDENT_SKILLS
CREATE TABLE IF NOT EXISTS student_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (proficiency >= 0 AND proficiency <= 100),
    confidence NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (confidence >= 0 AND confidence <= 1.00),
    evidence_type VARCHAR(50) NOT NULL DEFAULT 'SELF_REPORTED',
    last_assessed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_student_skill UNIQUE (student_id, skill_id)
);

-- 4. CAREERS
CREATE TABLE IF NOT EXISTS careers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CAREER_SKILLS
CREATE TABLE IF NOT EXISTS career_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_id UUID NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    required_proficiency NUMERIC(5, 2) NOT NULL CHECK (required_proficiency >= 0 AND required_proficiency <= 100),
    importance_weight NUMERIC(5, 2) NOT NULL DEFAULT 1.0 CHECK (importance_weight > 0),
    prerequisite_skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
    CONSTRAINT uq_career_skill UNIQUE (career_id, skill_id)
);

-- 6. LEARNING_RESOURCES
CREATE TABLE IF NOT EXISTS learning_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    difficulty VARCHAR(50) NOT NULL DEFAULT 'BEGINNER',
    content_type VARCHAR(50) NOT NULL DEFAULT 'ARTICLE',
    content_body TEXT,
    external_url VARCHAR(500),
    estimated_minutes INTEGER NOT NULL DEFAULT 30,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. LEARNING_PREREQUISITES
CREATE TABLE IF NOT EXISTS learning_prerequisites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
    prerequisite_resource_id UUID NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
    CONSTRAINT uq_resource_prereq UNIQUE (resource_id, prerequisite_resource_id),
    CONSTRAINT chk_no_self_prereq CHECK (resource_id <> prerequisite_resource_id)
);

-- 8. ASSESSMENTS
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    difficulty VARCHAR(50) NOT NULL DEFAULT 'INTERMEDIATE',
    assessment_type VARCHAR(50) NOT NULL DEFAULT 'QUIZ',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ASSESSMENT_QUESTIONS
CREATE TABLE IF NOT EXISTS assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_answer VARCHAR(255) NOT NULL,
    explanation TEXT,
    marks INTEGER NOT NULL DEFAULT 1,
    order_index INTEGER NOT NULL DEFAULT 0
);

-- 10. ASSESSMENT_ATTEMPTS
CREATE TABLE IF NOT EXISTS assessment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    maximum_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    time_taken_seconds INTEGER NOT NULL DEFAULT 0,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ASSESSMENT_RESPONSES
CREATE TABLE IF NOT EXISTS assessment_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
    submitted_answer VARCHAR(255) NOT NULL,
    awarded_marks NUMERIC(5, 2) NOT NULL DEFAULT 0.00
);

-- 12. LEARNING_PROGRESS
CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED',
    progress_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_student_resource_progress UNIQUE (student_id, resource_id)
);

-- 13. LEARNING_ROADMAPS
CREATE TABLE IF NOT EXISTS learning_roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    career_id UUID NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ROADMAP_STEPS
CREATE TABLE IF NOT EXISTS roadmap_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID NOT NULL REFERENCES learning_roadmaps(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL DEFAULT 1,
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'LOCKED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES learning_resources(id) ON DELETE CASCADE,
    career_id UUID REFERENCES careers(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL DEFAULT 'SKILL_GAP',
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    profile_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. SKILL_EVOLUTION_HISTORY
CREATE TABLE IF NOT EXISTS skill_evolution_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    previous_proficiency NUMERIC(5, 2) NOT NULL,
    new_proficiency NUMERIC(5, 2) NOT NULL,
    change_reason TEXT NOT NULL,
    evidence_type VARCHAR(50) NOT NULL,
    evidence_reference VARCHAR(255),
    profile_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. CREDENTIALS
CREATE TABLE IF NOT EXISTS credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    credential_type VARCHAR(100) NOT NULL,
    skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
    achievement_title VARCHAR(255) NOT NULL,
    achievement_data_hash VARCHAR(66) NOT NULL,
    issuer_address VARCHAR(42) NOT NULL,
    network_id VARCHAR(50) NOT NULL DEFAULT 'hardhat-local',
    contract_address VARCHAR(42) NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL,
    block_number BIGINT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ
);

-- 18. STUDENT_CAREER_PREFERENCES
CREATE TABLE IF NOT EXISTS student_career_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    career_id UUID NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
    preference_rank INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_student_career UNIQUE (student_id, career_id)
);

-- 19. AUDIT_EVENTS
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR HIGH QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_student_skills_student ON student_skills(student_id);
CREATE INDEX IF NOT EXISTS idx_student_skills_skill ON student_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_career_skills_career ON career_skills(career_id);
CREATE INDEX IF NOT EXISTS idx_learning_resources_skill ON learning_resources(skill_id);
CREATE INDEX IF NOT EXISTS idx_assessments_skill ON assessments(skill_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_student ON assessment_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_student ON learning_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_roadmaps_student ON learning_roadmaps(student_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_steps_roadmap ON roadmap_steps(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_student ON recommendations(student_id);
CREATE INDEX IF NOT EXISTS idx_evolution_history_student ON skill_evolution_history(student_id);
CREATE INDEX IF NOT EXISTS idx_credentials_student ON credentials(student_id);
CREATE INDEX IF NOT EXISTS idx_credentials_hash ON credentials(achievement_data_hash);
CREATE INDEX IF NOT EXISTS idx_career_preferences_student ON student_career_preferences(student_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_evolution_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_career_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Catalog tables are public read-only
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;

-- Public Read Catalog Policies
CREATE POLICY "Public skills are viewable by all" ON skills FOR SELECT USING (true);
CREATE POLICY "Public careers are viewable by all" ON careers FOR SELECT USING (active = true);
CREATE POLICY "Career skills are viewable by all" ON career_skills FOR SELECT USING (true);
CREATE POLICY "Learning resources are viewable by all" ON learning_resources FOR SELECT USING (active = true);
CREATE POLICY "Learning prerequisites are viewable by all" ON learning_prerequisites FOR SELECT USING (true);
CREATE POLICY "Assessments are viewable by all" ON assessments FOR SELECT USING (active = true);
CREATE POLICY "Assessment questions viewable by authenticated" ON assessment_questions FOR SELECT TO authenticated USING (true);

-- Student Self Data Policies
CREATE POLICY "Students can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Students can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Students can view own skills" ON student_skills FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can insert own skills" ON student_skills FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update own skills" ON student_skills FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Students can view own learning progress" ON learning_progress FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can update own learning progress" ON learning_progress FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Students can view own roadmaps" ON learning_roadmaps FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can view roadmap steps" ON roadmap_steps FOR SELECT USING (
    EXISTS (SELECT 1 FROM learning_roadmaps lr WHERE lr.id = roadmap_steps.roadmap_id AND lr.student_id = auth.uid())
);

CREATE POLICY "Students can view own recommendations" ON recommendations FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can view own evolution history" ON skill_evolution_history FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can view own credentials" ON credentials FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can view own assessment attempts" ON assessment_attempts FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can view own career preferences" ON student_career_preferences FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can manage own career preferences" ON student_career_preferences FOR ALL USING (auth.uid() = student_id);
