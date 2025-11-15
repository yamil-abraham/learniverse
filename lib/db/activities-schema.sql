-- Activities Database Schema for Phase 3
-- Math Activities and Gamification System

-- Activities table: stores all math activities/questions
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('addition', 'subtraction', 'multiplication', 'division', 'fractions')),
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question TEXT NOT NULL,
  correct_answer VARCHAR(100) NOT NULL,
  options JSONB, -- For multiple choice questions (optional)
  explanation TEXT,
  hints JSONB, -- Array of hint strings
  points INTEGER DEFAULT 10 CHECK (points > 0),
  time_limit_seconds INTEGER DEFAULT 60 CHECK (time_limit_seconds > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student attempts table: tracks all student answers
CREATE TABLE IF NOT EXISTS student_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  answer_given VARCHAR(100) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken_seconds INTEGER CHECK (time_taken_seconds >= 0),
  hints_used INTEGER DEFAULT 0 CHECK (hints_used >= 0),
  points_earned INTEGER DEFAULT 0 CHECK (points_earned >= 0),
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student badges/achievements table
CREATE TABLE IF NOT EXISTS student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL CHECK (badge_type IN ('first_correct', 'speed_demon', 'persistent', 'perfect_score', 'level_up', 'master_addition', 'master_subtraction', 'master_multiplication', 'master_division', 'master_fractions')),
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, badge_type)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_activities_type_difficulty ON activities(type, difficulty);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_attempts_student ON student_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_student_attempts_activity ON student_attempts(activity_id);
CREATE INDEX IF NOT EXISTS idx_student_attempts_attempted ON student_attempts(attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_badges_student ON student_badges(student_id);
CREATE INDEX IF NOT EXISTS idx_student_badges_type ON student_badges(badge_type);
