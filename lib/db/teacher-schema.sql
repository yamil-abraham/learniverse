-- =====================================================
-- PHASE 5: TEACHER DASHBOARD DATABASE SCHEMA
-- =====================================================
-- Tables for:
-- - Teacher-Student relationships
-- - Class/Group management
-- - Teacher alerts and notifications
-- - Activity assignments
-- =====================================================

-- =====================================================
-- 1. TEACHER-STUDENT RELATIONSHIP
-- =====================================================
-- Note: teacher_id column already exists in students table (from Phase 1)
-- Just ensuring the index exists
CREATE INDEX IF NOT EXISTS idx_students_teacher ON students(teacher_id);

-- =====================================================
-- 2. CLASSES/GROUPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  grade INTEGER CHECK (grade IN (4, 5)), -- Grade 4 or 5 (ages 9-11)
  school_year VARCHAR(20), -- e.g., "2024-2025"
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for teacher's classes lookup
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_active ON classes(teacher_id, is_active);

-- =====================================================
-- 3. CLASS-STUDENT ASSIGNMENTS (Many-to-Many)
-- =====================================================
CREATE TABLE IF NOT EXISTS class_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(class_id, student_id) -- Prevent duplicate assignments
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_class_students_class ON class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_students_student ON class_students(student_id);

-- =====================================================
-- 4. TEACHER ALERTS/NOTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS teacher_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'struggling', 'inactive', 'achievement', 'milestone'
  title VARCHAR(200) NOT NULL,
  message TEXT,
  severity VARCHAR(20) DEFAULT 'info', -- 'info', 'warning', 'success'
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for alert queries
CREATE INDEX IF NOT EXISTS idx_teacher_alerts_teacher ON teacher_alerts(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_alerts_unread ON teacher_alerts(teacher_id, is_read);
CREATE INDEX IF NOT EXISTS idx_teacher_alerts_student ON teacher_alerts(student_id);
CREATE INDEX IF NOT EXISTS idx_teacher_alerts_type ON teacher_alerts(teacher_id, alert_type);

-- =====================================================
-- 5. ACTIVITY ASSIGNMENTS (Optional - for homework)
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'addition', 'subtraction', etc.
  difficulty VARCHAR(20) NOT NULL, -- 'easy', 'medium', 'hard'
  quantity INTEGER DEFAULT 5, -- Number of activities to complete
  due_date TIMESTAMP,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  CHECK (student_id IS NOT NULL OR class_id IS NOT NULL) -- Must assign to student OR class
);

-- Indexes for assignment queries
CREATE INDEX IF NOT EXISTS idx_activity_assignments_teacher ON activity_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_activity_assignments_student ON activity_assignments(student_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_activity_assignments_class ON activity_assignments(class_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_activity_assignments_due ON activity_assignments(due_date) WHERE is_completed = false;

-- =====================================================
-- 6. TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- =====================================================

-- Trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to classes table
DROP TRIGGER IF EXISTS trigger_update_classes_timestamp ON classes;
CREATE TRIGGER trigger_update_classes_timestamp
BEFORE UPDATE ON classes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. ANALYTICS VIEWS (For faster queries)
-- =====================================================

-- View: Student performance summary
CREATE OR REPLACE VIEW student_performance_summary AS
SELECT
  s.id AS student_id,
  s.user_id,
  u.name AS student_name,
  s.level,
  s.experience AS total_points,
  s.teacher_id,
  COUNT(DISTINCT sa.id) AS total_attempts,
  COUNT(DISTINCT sa.id) FILTER (WHERE sa.is_correct = true) AS correct_answers,
  COUNT(DISTINCT sa.id) FILTER (WHERE sa.is_correct = false) AS incorrect_answers,
  CASE
    WHEN COUNT(DISTINCT sa.id) > 0 THEN
      ROUND((COUNT(DISTINCT sa.id) FILTER (WHERE sa.is_correct = true)::DECIMAL / COUNT(DISTINCT sa.id)) * 100, 2)
    ELSE 0
  END AS success_rate,
  COALESCE(AVG(sa.time_taken_seconds), 0) AS average_time_seconds,
  MAX(sa.attempted_at) AS last_active,
  COUNT(DISTINCT sb.id) AS badges_earned
FROM students s
LEFT JOIN users u ON s.user_id = u.id
LEFT JOIN student_attempts sa ON s.id = sa.student_id
LEFT JOIN student_badges sb ON s.id = sb.student_id
GROUP BY s.id, s.user_id, u.name, s.level, s.experience, s.teacher_id;

-- View: Class performance summary
CREATE OR REPLACE VIEW class_performance_summary AS
SELECT
  c.id AS class_id,
  c.name AS class_name,
  c.teacher_id,
  COUNT(DISTINCT cs.student_id) AS total_students,
  COUNT(DISTINCT cs.student_id) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM student_attempts sa
      WHERE sa.student_id = cs.student_id
      AND sa.attempted_at >= NOW() - INTERVAL '7 days'
    )
  ) AS active_students_last_7_days,
  ROUND(AVG(s.level), 2) AS average_level,
  ROUND(AVG(
    CASE
      WHEN sa_count.total > 0 THEN (sa_count.correct::DECIMAL / sa_count.total) * 100
      ELSE 0
    END
  ), 2) AS average_success_rate,
  SUM(sa_count.total) AS total_activities_completed
FROM classes c
LEFT JOIN class_students cs ON c.id = cs.class_id
LEFT JOIN students s ON cs.student_id = s.id
LEFT JOIN (
  SELECT
    student_id,
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE is_correct = true) AS correct
  FROM student_attempts
  GROUP BY student_id
) sa_count ON s.id = sa_count.student_id
GROUP BY c.id, c.name, c.teacher_id;

-- =====================================================
-- 8. SAMPLE DATA FUNCTIONS (For development/testing)
-- =====================================================

-- Function to create sample class for teacher
CREATE OR REPLACE FUNCTION create_sample_class(p_teacher_id UUID)
RETURNS UUID AS $$
DECLARE
  v_class_id UUID;
BEGIN
  INSERT INTO classes (teacher_id, name, description, grade, school_year, is_active)
  VALUES (
    p_teacher_id,
    'Matemáticas 4º A',
    'Clase de matemáticas para cuarto grado',
    4,
    '2024-2025',
    true
  )
  RETURNING id INTO v_class_id;

  RETURN v_class_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. HELPER FUNCTIONS FOR ANALYTICS
-- =====================================================

-- Function to calculate student success rate for activity type
CREATE OR REPLACE FUNCTION get_student_activity_type_stats(
  p_student_id UUID,
  p_activity_type VARCHAR
)
RETURNS TABLE (
  attempted INTEGER,
  correct INTEGER,
  success_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER AS attempted,
    COUNT(*) FILTER (WHERE is_correct = true)::INTEGER AS correct,
    CASE
      WHEN COUNT(*) > 0 THEN
        ROUND((COUNT(*) FILTER (WHERE is_correct = true)::DECIMAL / COUNT(*)) * 100, 2)
      ELSE 0
    END AS success_rate
  FROM activity_results ar
  JOIN activities a ON ar.activity_id = a.id
  WHERE ar.student_id = p_student_id
  AND a.type = p_activity_type;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================
