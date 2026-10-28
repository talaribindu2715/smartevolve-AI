-- ============================================================================
-- V3: YOUTUBE EDUCATIONAL VIDEO PIPELINE & WATCH PROGRESS SCHEMA
-- ============================================================================

CREATE TABLE IF NOT EXISTS youtube_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id VARCHAR(64) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    channel_title VARCHAR(255),
    duration VARCHAR(32) DEFAULT '15:00',
    estimated_minutes INTEGER NOT NULL DEFAULT 15,
    difficulty VARCHAR(32) NOT NULL DEFAULT 'BEGINNER',
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    category VARCHAR(100),
    view_count VARCHAR(64),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS video_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES youtube_videos(id) ON DELETE CASCADE,
    watched_seconds INTEGER NOT NULL DEFAULT 0,
    total_seconds INTEGER NOT NULL DEFAULT 0,
    completion_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(32) NOT NULL DEFAULT 'NOT_STARTED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_watched_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    CONSTRAINT uq_student_video UNIQUE (student_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_youtube_videos_skill ON youtube_videos(skill_id);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_active ON youtube_videos(active);
CREATE INDEX IF NOT EXISTS idx_video_progress_student ON video_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_video ON video_progress(video_id);

ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "YouTube videos are viewable by all" ON youtube_videos FOR SELECT USING (active = true);
CREATE POLICY "Learners can view their own video progress" ON video_progress FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Learners can update their own video progress" ON video_progress FOR ALL USING (student_id = auth.uid());
