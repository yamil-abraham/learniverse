-- Learniverse Database Schema
-- PostgreSQL Database for Learniverse educational platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla: users
-- Almacena información básica de todos los usuarios (estudiantes y profesores)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas por email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Tabla: teachers
-- Información específica de profesores
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice en user_id para joins eficientes
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);

-- Tabla: students
-- Información específica de estudiantes
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  grade INTEGER NOT NULL CHECK (grade IN (4, 5)),
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  avatar_config JSONB DEFAULT '{}',
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_teacher_id ON students(teacher_id);

-- Tabla: student_progress
-- Seguimiento del progreso de cada estudiante
CREATE TABLE IF NOT EXISTS student_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID UNIQUE NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  completed_activities JSONB DEFAULT '[]',
  current_activity VARCHAR(255),
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  total_time_minutes INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice en student_id para joins eficientes
CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON student_progress(student_id);

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en users
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en student_progress
CREATE TRIGGER update_student_progress_updated_at BEFORE UPDATE ON student_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentarios sobre las tablas
COMMENT ON TABLE users IS 'Tabla principal de usuarios del sistema';
COMMENT ON TABLE teachers IS 'Información adicional de profesores';
COMMENT ON TABLE students IS 'Información adicional de estudiantes';
COMMENT ON TABLE student_progress IS 'Seguimiento del progreso de aprendizaje de estudiantes';

COMMENT ON COLUMN students.avatar_config IS 'Configuración del avatar 3D en formato JSON';
COMMENT ON COLUMN student_progress.completed_activities IS 'Array de IDs de actividades completadas en formato JSON';
