-- ============================================
-- Phase 4: AI-Powered Adaptive Learning System
-- Database Schema
-- ============================================

-- ============================================
-- Table: student_learning_profile
-- Purpose: Track student performance and learning patterns
-- ============================================
CREATE TABLE IF NOT EXISTS student_learning_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE UNIQUE,

  -- Performance by activity type (success rate 0.00 to 100.00)
  addition_success_rate DECIMAL(5,2) DEFAULT 0.00 CHECK (addition_success_rate >= 0 AND addition_success_rate <= 100),
  subtraction_success_rate DECIMAL(5,2) DEFAULT 0.00 CHECK (subtraction_success_rate >= 0 AND subtraction_success_rate <= 100),
  multiplication_success_rate DECIMAL(5,2) DEFAULT 0.00 CHECK (multiplication_success_rate >= 0 AND multiplication_success_rate <= 100),
  division_success_rate DECIMAL(5,2) DEFAULT 0.00 CHECK (division_success_rate >= 0 AND division_success_rate <= 100),
  fractions_success_rate DECIMAL(5,2) DEFAULT 0.00 CHECK (fractions_success_rate >= 0 AND fractions_success_rate <= 100),

  -- Current difficulty preference per type
  addition_difficulty VARCHAR(20) DEFAULT 'easy' CHECK (addition_difficulty IN ('easy', 'medium', 'hard')),
  subtraction_difficulty VARCHAR(20) DEFAULT 'easy' CHECK (subtraction_difficulty IN ('easy', 'medium', 'hard')),
  multiplication_difficulty VARCHAR(20) DEFAULT 'easy' CHECK (multiplication_difficulty IN ('easy', 'medium', 'hard')),
  division_difficulty VARCHAR(20) DEFAULT 'easy' CHECK (division_difficulty IN ('easy', 'medium', 'hard')),
  fractions_difficulty VARCHAR(20) DEFAULT 'easy' CHECK (fractions_difficulty IN ('easy', 'medium', 'hard')),

  -- Attempt counts per type
  addition_attempts INTEGER DEFAULT 0 CHECK (addition_attempts >= 0),
  subtraction_attempts INTEGER DEFAULT 0 CHECK (subtraction_attempts >= 0),
  multiplication_attempts INTEGER DEFAULT 0 CHECK (multiplication_attempts >= 0),
  division_attempts INTEGER DEFAULT 0 CHECK (division_attempts >= 0),
  fractions_attempts INTEGER DEFAULT 0 CHECK (fractions_attempts >= 0),

  -- Learning patterns
  average_time_per_question INTEGER DEFAULT 45 CHECK (average_time_per_question > 0),
  hints_usage_rate DECIMAL(5,2) DEFAULT 0.00 CHECK (hints_usage_rate >= 0 AND hints_usage_rate <= 100),
  common_mistake_patterns JSONB DEFAULT '[]',
  learning_speed VARCHAR(20) DEFAULT 'normal' CHECK (learning_speed IN ('slow', 'normal', 'fast')),

  -- Engagement metrics
  consecutive_correct INTEGER DEFAULT 0 CHECK (consecutive_correct >= 0),
  consecutive_incorrect INTEGER DEFAULT 0 CHECK (consecutive_incorrect >= 0),
  session_count INTEGER DEFAULT 0 CHECK (session_count >= 0),
  total_questions_attempted INTEGER DEFAULT 0 CHECK (total_questions_attempted >= 0),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Table: ai_feedback_history
-- Purpose: Store AI-generated feedback for student answers
-- ============================================
CREATE TABLE IF NOT EXISTS ai_feedback_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  attempt_id UUID REFERENCES student_attempts(id) ON DELETE CASCADE,

  feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('explanation', 'hint', 'encouragement', 'correction')),
  user_answer VARCHAR(100),
  feedback_text TEXT NOT NULL,
  was_helpful BOOLEAN DEFAULT NULL, -- Can be rated by student later

  -- AI metadata
  ai_model VARCHAR(50) DEFAULT 'gpt-4o-mini',
  tokens_used INTEGER,
  generation_time_ms INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Table: adaptive_recommendations
-- Purpose: Track AI recommendations for next activities
-- ============================================
CREATE TABLE IF NOT EXISTS adaptive_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  recommended_activity_type VARCHAR(50) NOT NULL CHECK (recommended_activity_type IN ('addition', 'subtraction', 'multiplication', 'division', 'fractions')),
  recommended_difficulty VARCHAR(20) NOT NULL CHECK (recommended_difficulty IN ('easy', 'medium', 'hard')),
  reason TEXT,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1), -- 0.00 to 1.00

  -- Tracking
  was_used BOOLEAN DEFAULT false,
  was_successful BOOLEAN DEFAULT NULL, -- Set after activity completion

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- ============================================
-- Indexes for Performance
-- ============================================

-- Learning profile indexes
CREATE INDEX IF NOT EXISTS idx_learning_profile_student
  ON student_learning_profile(student_id);

-- Feedback history indexes
CREATE INDEX IF NOT EXISTS idx_feedback_history_student
  ON ai_feedback_history(student_id);

CREATE INDEX IF NOT EXISTS idx_feedback_history_activity
  ON ai_feedback_history(activity_id);

CREATE INDEX IF NOT EXISTS idx_feedback_history_attempt
  ON ai_feedback_history(attempt_id);

CREATE INDEX IF NOT EXISTS idx_feedback_history_type
  ON ai_feedback_history(feedback_type);

CREATE INDEX IF NOT EXISTS idx_feedback_history_created
  ON ai_feedback_history(created_at DESC);

-- Recommendations indexes
CREATE INDEX IF NOT EXISTS idx_recommendations_student
  ON adaptive_recommendations(student_id);

CREATE INDEX IF NOT EXISTS idx_recommendations_created
  ON adaptive_recommendations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recommendations_used
  ON adaptive_recommendations(was_used, student_id);

-- ============================================
-- Trigger: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_learning_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_learning_profile_timestamp
  BEFORE UPDATE ON student_learning_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_learning_profile_timestamp();

-- ============================================
-- Comments for Documentation
-- ============================================

COMMENT ON TABLE student_learning_profile IS 'Tracks individual student performance, learning patterns, and adaptive difficulty settings';
COMMENT ON TABLE ai_feedback_history IS 'Stores all AI-generated feedback including explanations, hints, and encouragement';
COMMENT ON TABLE adaptive_recommendations IS 'Records AI recommendations for next activities based on student performance';

COMMENT ON COLUMN student_learning_profile.learning_speed IS 'Calculated based on how quickly student progresses through difficulty levels';
COMMENT ON COLUMN student_learning_profile.common_mistake_patterns IS 'JSON array of common mistake types detected by AI analysis';
COMMENT ON COLUMN ai_feedback_history.was_helpful IS 'Student can rate feedback as helpful/not helpful for AI improvement';
COMMENT ON COLUMN adaptive_recommendations.confidence_score IS 'AI confidence in recommendation quality (0-1)';
