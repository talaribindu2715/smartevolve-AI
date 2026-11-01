-- ==============================================================================
-- SmartEvolve AI: Notifications & Study Planner Migration
-- Version: 20261101000005_notifications_and_study_planner.sql
-- Description: Adds notifications table, streak tracking, and user credentials.
-- ==============================================================================

-- 1. ADD STREAK & CREDENTIAL COLUMNS TO PROFILES
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_date DATE DEFAULT CURRENT_DATE;

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 2. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'SYSTEM' CHECK (type IN ('ACHIEVEMENT', 'MILESTONE', 'FEEDBACK', 'SYSTEM', 'ASSESSMENT')),
    read BOOLEAN NOT NULL DEFAULT FALSE,
    action_url VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;
CREATE POLICY "Admins can manage all notifications" ON notifications
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- 4. SEED SAMPLE NOTIFICATIONS FOR STUDENT (Alex Chen)
INSERT INTO notifications (user_id, title, message, type, read, action_url)
VALUES 
    (
        '00000000-0000-0000-0000-000000000001',
        '🚀 Welcome to SmartEvolve AI',
        'Your adaptive student profile and career readiness roadmap have been initialized.',
        'SYSTEM',
        false,
        '/(tabs)'
    ),
    (
        '00000000-0000-0000-0000-000000000001',
        '🎓 Blockchain Credential Opportunity',
        'Score 80% or above on Python Mastery to anchor your tamper-evident credential on Ethereum.',
        'MILESTONE',
        false,
        '/credentials'
    ),
    (
        '00000000-0000-0000-0000-000000000001',
        '👨‍🏫 Guidance From Dr. Elena Rostova',
        'Your mentor has reviewed your progress and added customized roadmap recommendations.',
        'FEEDBACK',
        false,
        '/(tabs)/learn'
    )
ON CONFLICT DO NOTHING;
