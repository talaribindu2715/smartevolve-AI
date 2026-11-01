-- ==============================================================================
-- SmartEvolve AI: Supabase PostgreSQL RBAC Migration
-- Version: V4__role_based_access_control.sql
-- Description: Implements comprehensive Role-Based Access Control (RBAC):
--   1. Four User Roles: STUDENT, MENTOR, ADMIN, RECRUITER
--   2. mentor_student_assignments table
--   3. recruiter_profile_shares table
--   4. Trigger to prevent privilege self-escalation
--   5. Real-world Row-Level Security (RLS) policies for each role
--   6. Deterministic demo seed data for each role
-- ==============================================================================

-- 1. ADD ROLE COLUMN TO PROFILES TABLE
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'STUDENT';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_profile_role'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT chk_profile_role
            CHECK (role IN ('STUDENT', 'MENTOR', 'FACULTY', 'ADMIN', 'RECRUITER', 'EMPLOYER'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 2. MENTOR - STUDENT ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS mentor_student_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING', 'INACTIVE', 'ARCHIVED')),
    notes TEXT,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_mentor_student UNIQUE (mentor_id, student_id),
    CONSTRAINT chk_mentor_not_same_as_student CHECK (mentor_id <> student_id)
);

CREATE INDEX IF NOT EXISTS idx_mentor_student_mentor ON mentor_student_assignments(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_student_student ON mentor_student_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_student_status ON mentor_student_assignments(status);

-- 3. RECRUITER - STUDENT PROFILE SHARES TABLE
CREATE TABLE IF NOT EXISTS recruiter_profile_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    access_token VARCHAR(255),
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED', 'EXPIRED')),
    shared_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    CONSTRAINT uq_recruiter_student_share UNIQUE (recruiter_id, student_id),
    CONSTRAINT chk_recruiter_not_same_as_student CHECK (recruiter_id <> student_id)
);

CREATE INDEX IF NOT EXISTS idx_recruiter_shares_recruiter ON recruiter_profile_shares(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_shares_student ON recruiter_profile_shares(student_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_shares_status ON recruiter_profile_shares(status);

-- 4. PREVENT PRIVILEGE SELF-ESCALATION TRIGGER
-- Normal users cannot change their own or other users' role unless they have ADMIN role!
CREATE OR REPLACE FUNCTION prevent_role_self_escalation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        -- Allow system operations / migrations where auth.uid() is null, or verify ADMIN role
        IF auth.uid() IS NOT NULL THEN
            IF NOT EXISTS (
                SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
            ) THEN
                RAISE EXCEPTION 'Privilege Escalation Forbidden: Only verified ADMIN users can assign or change roles.';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_self_escalation ON profiles;
CREATE TRIGGER trg_prevent_role_self_escalation
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_role_self_escalation();

-- 5. ENABLE ROW LEVEL SECURITY ON NEW TABLES
ALTER TABLE mentor_student_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_profile_shares ENABLE ROW LEVEL SECURITY;

-- 6. MENTOR ASSIGNMENT POLICIES
DROP POLICY IF EXISTS "Mentors can view their student assignments" ON mentor_student_assignments;
CREATE POLICY "Mentors can view their student assignments" ON mentor_student_assignments
    FOR SELECT USING (mentor_id = auth.uid());

DROP POLICY IF EXISTS "Students can view their mentors" ON mentor_student_assignments;
CREATE POLICY "Students can view their mentors" ON mentor_student_assignments
    FOR SELECT USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all mentor assignments" ON mentor_student_assignments;
CREATE POLICY "Admins can manage all mentor assignments" ON mentor_student_assignments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- 7. RECRUITER SHARES POLICIES
DROP POLICY IF EXISTS "Recruiters can view their shared profiles" ON recruiter_profile_shares;
CREATE POLICY "Recruiters can view their shared profiles" ON recruiter_profile_shares
    FOR SELECT USING (recruiter_id = auth.uid());

DROP POLICY IF EXISTS "Students can view and manage their shares" ON recruiter_profile_shares;
CREATE POLICY "Students can view and manage their shares" ON recruiter_profile_shares
    FOR ALL USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all recruiter shares" ON recruiter_profile_shares;
CREATE POLICY "Admins can manage all recruiter shares" ON recruiter_profile_shares
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- 8. EXTEND RLS ON PROFILES FOR RBAC
DROP POLICY IF EXISTS "Mentors can view assigned student profiles" ON profiles;
CREATE POLICY "Mentors can view assigned student profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mentor_student_assignments msa
            WHERE msa.mentor_id = auth.uid()
              AND msa.student_id = profiles.id
              AND msa.status = 'ACTIVE'
        )
    );

DROP POLICY IF EXISTS "Recruiters can view shared student profiles" ON profiles;
CREATE POLICY "Recruiters can view shared student profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM recruiter_profile_shares rps
            WHERE rps.recruiter_id = auth.uid()
              AND rps.student_id = profiles.id
              AND rps.status = 'ACTIVE'
        )
    );

DROP POLICY IF EXISTS "Admins can view and manage all profiles" ON profiles;
CREATE POLICY "Admins can view and manage all profiles" ON profiles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN')
    );

-- 9. EXTEND RLS ON STUDENT DATA FOR MENTORS AND RECRUITERS
-- Student Skills
DROP POLICY IF EXISTS "Mentors can view assigned student skills" ON student_skills;
CREATE POLICY "Mentors can view assigned student skills" ON student_skills
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mentor_student_assignments msa
            WHERE msa.mentor_id = auth.uid()
              AND msa.student_id = student_skills.student_id
              AND msa.status = 'ACTIVE'
        )
    );

DROP POLICY IF EXISTS "Recruiters can view shared student skills" ON student_skills;
CREATE POLICY "Recruiters can view shared student skills" ON student_skills
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM recruiter_profile_shares rps
            WHERE rps.recruiter_id = auth.uid()
              AND rps.student_id = student_skills.student_id
              AND rps.status = 'ACTIVE'
        )
    );

DROP POLICY IF EXISTS "Admins can view all student skills" ON student_skills;
CREATE POLICY "Admins can view all student skills" ON student_skills
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- Learning Progress
DROP POLICY IF EXISTS "Mentors can view assigned student learning progress" ON learning_progress;
CREATE POLICY "Mentors can view assigned student learning progress" ON learning_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mentor_student_assignments msa
            WHERE msa.mentor_id = auth.uid()
              AND msa.student_id = learning_progress.student_id
              AND msa.status = 'ACTIVE'
        )
    );

DROP POLICY IF EXISTS "Admins can view all learning progress" ON learning_progress;
CREATE POLICY "Admins can view all learning progress" ON learning_progress
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- Roadmaps
DROP POLICY IF EXISTS "Mentors can view assigned student roadmaps" ON learning_roadmaps;
CREATE POLICY "Mentors can view assigned student roadmaps" ON learning_roadmaps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mentor_student_assignments msa
            WHERE msa.mentor_id = auth.uid()
              AND msa.student_id = learning_roadmaps.student_id
              AND msa.status = 'ACTIVE'
        )
    );

DROP POLICY IF EXISTS "Recruiters can view shared student roadmaps" ON learning_roadmaps;
CREATE POLICY "Recruiters can view shared student roadmaps" ON learning_roadmaps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM recruiter_profile_shares rps
            WHERE rps.recruiter_id = auth.uid()
              AND rps.student_id = learning_roadmaps.student_id
              AND rps.status = 'ACTIVE'
        )
    );

DROP POLICY IF EXISTS "Admins can manage all roadmaps" ON learning_roadmaps;
CREATE POLICY "Admins can manage all roadmaps" ON learning_roadmaps
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- Credentials (Certificates)
DROP POLICY IF EXISTS "Mentors can view assigned student credentials" ON credentials;
CREATE POLICY "Mentors can view assigned student credentials" ON credentials
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mentor_student_assignments msa
            WHERE msa.mentor_id = auth.uid()
              AND msa.student_id = credentials.student_id
              AND msa.status = 'ACTIVE'
        )
    );

DROP POLICY IF EXISTS "Recruiters can view shared student credentials" ON credentials;
CREATE POLICY "Recruiters can view shared student credentials" ON credentials
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM recruiter_profile_shares rps
            WHERE rps.recruiter_id = auth.uid()
              AND rps.student_id = credentials.student_id
              AND rps.status = 'ACTIVE'
        )
    );

DROP POLICY IF EXISTS "Admins can manage all credentials" ON credentials;
CREATE POLICY "Admins can manage all credentials" ON credentials
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- 10. ADMIN MANAGEMENT POLICIES FOR BENCHMARKS & CATALOGS
DROP POLICY IF EXISTS "Admins can insert skills" ON skills;
CREATE POLICY "Admins can insert skills" ON skills FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

DROP POLICY IF EXISTS "Admins can update skills" ON skills FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

DROP POLICY IF EXISTS "Admins can delete skills" ON skills FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

DROP POLICY IF EXISTS "Admins can insert careers" ON careers;
CREATE POLICY "Admins can insert careers" ON careers FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

DROP POLICY IF EXISTS "Admins can update careers" ON careers FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

DROP POLICY IF EXISTS "Admins can delete careers" ON careers FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- 11. DETERMINISTIC SEED DATA FOR ALL 4 ROLES
-- Role 1: STUDENT (Alex Chen)
INSERT INTO profiles (id, full_name, education_level, institution, branch, graduation_year, interests, onboarding_completed, role)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Alex Chen',
    'Undergraduate B.Tech',
    'MIT Engineering',
    'Computer Science',
    2027,
    '["AI & Machine Learning", "Web Development", "Cloud Systems"]'::jsonb,
    true,
    'STUDENT'
)
ON CONFLICT (id) DO UPDATE SET
    role = 'STUDENT',
    full_name = 'Alex Chen';

-- Role 2: MENTOR / FACULTY (Dr. Elena Rostova)
INSERT INTO profiles (id, full_name, education_level, institution, branch, graduation_year, interests, onboarding_completed, role)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'Dr. Elena Rostova',
    'Ph.D. Computer Science',
    'MIT Engineering',
    'Computer Science & AI Faculty',
    2015,
    '["Academic Mentorship", "Distributed Systems", "AI Curriculum Design"]'::jsonb,
    true,
    'MENTOR'
)
ON CONFLICT (id) DO UPDATE SET
    role = 'MENTOR',
    full_name = 'Dr. Elena Rostova';

-- Role 3: ADMIN (Sarah Connor)
INSERT INTO profiles (id, full_name, education_level, institution, branch, graduation_year, interests, onboarding_completed, role)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    'Sarah Connor',
    'Master of Engineering',
    'SmartEvolve Operations',
    'Platform Administration & Governance',
    2018,
    '["System Administration", "Career Benchmarks", "Security Auditing"]'::jsonb,
    true,
    'ADMIN'
)
ON CONFLICT (id) DO UPDATE SET
    role = 'ADMIN',
    full_name = 'Sarah Connor';

-- Role 4: RECRUITER / EMPLOYER (Marcus Vance)
INSERT INTO profiles (id, full_name, education_level, institution, branch, graduation_year, interests, onboarding_completed, role)
VALUES (
    '00000000-0000-0000-0000-000000000004',
    'Marcus Vance',
    'MBA & Talent Strategy',
    'Apex Talent Cloud & Google Partner',
    'Technical Recruitment & University Relations',
    2019,
    '["Talent Acquisition", "Credential Verification", "Tech Hiring"]'::jsonb,
    true,
    'RECRUITER'
)
ON CONFLICT (id) DO UPDATE SET
    role = 'RECRUITER',
    full_name = 'Marcus Vance';

-- Assign Student Alex Chen to Mentor Dr. Elena Rostova
INSERT INTO mentor_student_assignments (mentor_id, student_id, status, notes)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'ACTIVE',
    'Mentoring for Full-Stack AI Engineer career transition.'
)
ON CONFLICT (mentor_id, student_id) DO NOTHING;

-- Share Student Alex Chen profile with Recruiter Marcus Vance
INSERT INTO recruiter_profile_shares (recruiter_id, student_id, status, notes)
VALUES (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'ACTIVE',
    'Candidate portfolio and verified credentials shared for 2027 Staff AI Engineer role.'
)
ON CONFLICT (recruiter_id, student_id) DO NOTHING;
