/**
 * Consultas reutilizables para la base de datos
 * Funciones para operaciones CRUD en usuarios, estudiantes y profesores
 */

import { executeQuery, executeQuerySingle, executeInsert, executeUpdate, executeTransaction } from './client'
import type { UserRole } from '@/types'

/**
 * Tipos de base de datos
 */
export interface DbUser {
  id: string
  email: string
  password_hash: string
  name: string
  role: UserRole
  created_at: Date
  updated_at: Date
}

export interface DbStudent {
  id: string
  user_id: string
  grade: number
  teacher_id: string | null
  avatar_config: any
  level: number
  experience: number
  created_at: Date
}

export interface DbTeacher {
  id: string
  user_id: string
  school: string | null
  created_at: Date
}

export interface DbStudentProgress {
  id: string
  student_id: string
  completed_activities: any
  current_activity: string | null
  correct_answers: number
  incorrect_answers: number
  total_time_minutes: number
  streak_days: number
  updated_at: Date
}

/**
 * USUARIOS
 */

/**
 * Crea un nuevo usuario en la base de datos
 */
export async function createUser(
  email: string,
  passwordHash: string,
  name: string,
  role: UserRole
): Promise<DbUser> {
  const query = `
    INSERT INTO users (email, password_hash, name, role)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `
  return executeInsert<DbUser>(query, [email, passwordHash, name, role])
}

/**
 * Obtiene un usuario por email
 */
export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const query = `
    SELECT * FROM users WHERE email = $1
  `
  return executeQuerySingle<DbUser>(query, [email])
}

/**
 * Obtiene un usuario por ID
 */
export async function getUserById(id: string): Promise<DbUser | null> {
  const query = `
    SELECT * FROM users WHERE id = $1
  `
  return executeQuerySingle<DbUser>(query, [id])
}

/**
 * Actualiza el nombre de un usuario
 */
export async function updateUserName(id: string, name: string): Promise<DbUser | null> {
  const query = `
    UPDATE users SET name = $1 WHERE id = $2
    RETURNING *
  `
  return executeUpdate<DbUser>(query, [name, id])
}

/**
 * ESTUDIANTES
 */

/**
 * Crea un nuevo estudiante
 */
export async function createStudent(
  userId: string,
  grade: number,
  teacherId?: string
): Promise<DbStudent> {
  const query = `
    INSERT INTO students (user_id, grade, teacher_id)
    VALUES ($1, $2, $3)
    RETURNING *
  `
  return executeInsert<DbStudent>(query, [userId, grade, teacherId || null])
}

/**
 * Obtiene un estudiante por user_id
 */
export async function getStudentByUserId(userId: string): Promise<DbStudent | null> {
  const query = `
    SELECT * FROM students WHERE user_id = $1
  `
  return executeQuerySingle<DbStudent>(query, [userId])
}

/**
 * Obtiene un estudiante por ID
 */
export async function getStudentById(id: string): Promise<DbStudent | null> {
  const query = `
    SELECT * FROM students WHERE id = $1
  `
  return executeQuerySingle<DbStudent>(query, [id])
}

/**
 * Actualiza la configuración del avatar de un estudiante
 */
export async function updateStudentAvatar(
  studentId: string,
  avatarConfig: any
): Promise<DbStudent | null> {
  const query = `
    UPDATE students
    SET avatar_config = $1
    WHERE id = $2
    RETURNING *
  `
  return executeUpdate<DbStudent>(query, [JSON.stringify(avatarConfig), studentId])
}

/**
 * Actualiza el nivel y experiencia de un estudiante
 */
export async function updateStudentLevelAndExperience(
  studentId: string,
  level: number,
  experience: number
): Promise<DbStudent | null> {
  const query = `
    UPDATE students
    SET level = $1, experience = $2
    WHERE id = $3
    RETURNING *
  `
  return executeUpdate<DbStudent>(query, [level, experience, studentId])
}

/**
 * Obtiene todos los estudiantes de un profesor
 */
export async function getStudentsByTeacherId(teacherId: string): Promise<DbStudent[]> {
  const query = `
    SELECT * FROM students WHERE teacher_id = $1
    ORDER BY created_at DESC
  `
  return executeQuery<DbStudent>(query, [teacherId])
}

/**
 * PROFESORES
 */

/**
 * Crea un nuevo profesor
 */
export async function createTeacher(
  userId: string,
  school?: string
): Promise<DbTeacher> {
  const query = `
    INSERT INTO teachers (user_id, school)
    VALUES ($1, $2)
    RETURNING *
  `
  return executeInsert<DbTeacher>(query, [userId, school || null])
}

/**
 * Obtiene un profesor por user_id
 */
export async function getTeacherByUserId(userId: string): Promise<DbTeacher | null> {
  const query = `
    SELECT * FROM teachers WHERE user_id = $1
  `
  return executeQuerySingle<DbTeacher>(query, [userId])
}

/**
 * Obtiene un profesor por ID
 */
export async function getTeacherById(id: string): Promise<DbTeacher | null> {
  const query = `
    SELECT * FROM teachers WHERE id = $1
  `
  return executeQuerySingle<DbTeacher>(query, [id])
}

/**
 * Actualiza la escuela de un profesor
 */
export async function updateTeacherSchool(
  teacherId: string,
  school: string
): Promise<DbTeacher | null> {
  const query = `
    UPDATE teachers
    SET school = $1
    WHERE id = $2
    RETURNING *
  `
  return executeUpdate<DbTeacher>(query, [school, teacherId])
}

/**
 * PROGRESO DE ESTUDIANTES
 */

/**
 * Crea un registro de progreso para un estudiante
 */
export async function createStudentProgress(
  studentId: string
): Promise<DbStudentProgress> {
  const query = `
    INSERT INTO student_progress (student_id)
    VALUES ($1)
    RETURNING *
  `
  return executeInsert<DbStudentProgress>(query, [studentId])
}

/**
 * Obtiene el progreso de un estudiante
 */
export async function getStudentProgress(
  studentId: string
): Promise<DbStudentProgress | null> {
  const query = `
    SELECT * FROM student_progress WHERE student_id = $1
  `
  return executeQuerySingle<DbStudentProgress>(query, [studentId])
}

/**
 * Actualiza el progreso de un estudiante
 */
export async function updateStudentProgress(
  studentId: string,
  progressData: {
    completedActivities?: string[]
    currentActivity?: string | null
    correctAnswers?: number
    incorrectAnswers?: number
    totalTimeMinutes?: number
    streakDays?: number
  }
): Promise<DbStudentProgress | null> {
  // Construir la consulta dinámicamente basándose en los campos proporcionados
  const updates: string[] = []
  const params: any[] = []
  let paramIndex = 1

  if (progressData.completedActivities !== undefined) {
    updates.push(`completed_activities = $${paramIndex}`)
    params.push(JSON.stringify(progressData.completedActivities))
    paramIndex++
  }

  if (progressData.currentActivity !== undefined) {
    updates.push(`current_activity = $${paramIndex}`)
    params.push(progressData.currentActivity)
    paramIndex++
  }

  if (progressData.correctAnswers !== undefined) {
    updates.push(`correct_answers = $${paramIndex}`)
    params.push(progressData.correctAnswers)
    paramIndex++
  }

  if (progressData.incorrectAnswers !== undefined) {
    updates.push(`incorrect_answers = $${paramIndex}`)
    params.push(progressData.incorrectAnswers)
    paramIndex++
  }

  if (progressData.totalTimeMinutes !== undefined) {
    updates.push(`total_time_minutes = $${paramIndex}`)
    params.push(progressData.totalTimeMinutes)
    paramIndex++
  }

  if (progressData.streakDays !== undefined) {
    updates.push(`streak_days = $${paramIndex}`)
    params.push(progressData.streakDays)
    paramIndex++
  }

  if (updates.length === 0) {
    // No hay nada que actualizar
    return getStudentProgress(studentId)
  }

  params.push(studentId)

  const query = `
    UPDATE student_progress
    SET ${updates.join(', ')}
    WHERE student_id = $${paramIndex}
    RETURNING *
  `

  return executeUpdate<DbStudentProgress>(query, params)
}

/**
 * OPERACIONES COMPUESTAS
 */

/**
 * Crea un usuario completo con su registro de estudiante o profesor
 */
export async function createUserWithProfile(
  email: string,
  passwordHash: string,
  name: string,
  role: UserRole,
  additionalData?: {
    grade?: number
    teacherId?: string
    school?: string
  }
): Promise<{ user: DbUser; student?: DbStudent; teacher?: DbTeacher; progress?: DbStudentProgress }> {
  try {
    // Crear usuario
    const user = await createUser(email, passwordHash, name, role)

    // Crear perfil según el rol
    if (role === 'student') {
      if (!additionalData?.grade) {
        throw new Error('Grade is required for students')
      }
      const student = await createStudent(user.id, additionalData.grade, additionalData.teacherId)
      const progress = await createStudentProgress(student.id)
      return { user, student, progress }
    } else if (role === 'teacher') {
      const teacher = await createTeacher(user.id, additionalData?.school)
      return { user, teacher }
    }

    return { user }
  } catch (error) {
    console.error('Error creating user with profile:', error)
    throw error
  }
}

/**
 * Obtiene el perfil completo de un usuario (user + student/teacher + progress si es estudiante)
 */
export async function getUserProfile(userId: string): Promise<{
  user: DbUser | null
  student?: DbStudent | null
  teacher?: DbTeacher | null
  progress?: DbStudentProgress | null
}> {
  const user = await getUserById(userId)
  if (!user) {
    return { user: null }
  }

  if (user.role === 'student') {
    const student = await getStudentByUserId(userId)
    const progress = student ? await getStudentProgress(student.id) : null
    return { user, student, progress }
  } else if (user.role === 'teacher') {
    const teacher = await getTeacherByUserId(userId)
    return { user, teacher }
  }

  return { user }
}

/**
 * PHASE 3: MATH ACTIVITIES
 */

export interface DbMathActivity {
  id: string
  type: string
  difficulty: string
  question: string
  correct_answer: string
  options: any
  explanation: string | null
  hints: any
  points: number
  time_limit_seconds: number
  created_at: Date
}

export interface DbStudentAttempt {
  id: string
  student_id: string
  activity_id: string
  answer_given: string
  is_correct: boolean
  time_taken_seconds: number
  hints_used: number
  points_earned: number
  attempted_at: Date
}

export interface DbStudentBadge {
  id: string
  student_id: string
  badge_type: string
  badge_name: string
  badge_description: string | null
  earned_at: Date
}

/**
 * Create a new activity
 */
export async function createActivity(
  type: string,
  difficulty: string,
  question: string,
  correctAnswer: string,
  points: number,
  timeLimitSeconds: number,
  options?: string[],
  explanation?: string,
  hints?: string[]
): Promise<DbMathActivity> {
  const query = `
    INSERT INTO activities (type, difficulty, question, correct_answer, options, explanation, hints, points, time_limit_seconds)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `
  return executeInsert<DbMathActivity>(query, [
    type,
    difficulty,
    question,
    correctAnswer,
    options ? JSON.stringify(options) : null,
    explanation || null,
    hints ? JSON.stringify(hints) : null,
    points,
    timeLimitSeconds
  ])
}

/**
 * Get a random activity by type and difficulty
 */
export async function getRandomActivity(
  type: string,
  difficulty: string
): Promise<DbMathActivity | null> {
  const query = `
    SELECT * FROM activities
    WHERE type = $1 AND difficulty = $2
    ORDER BY RANDOM()
    LIMIT 1
  `
  return executeQuerySingle<DbMathActivity>(query, [type, difficulty])
}

/**
 * Get activity by ID
 */
export async function getActivityById(id: string): Promise<DbMathActivity | null> {
  const query = `
    SELECT * FROM activities WHERE id = $1
  `
  return executeQuerySingle<DbMathActivity>(query, [id])
}

/**
 * Get activities by type
 */
export async function getActivitiesByType(
  type: string,
  limit: number = 10
): Promise<DbMathActivity[]> {
  const query = `
    SELECT * FROM activities
    WHERE type = $1
    ORDER BY created_at DESC
    LIMIT $2
  `
  return executeQuery<DbMathActivity>(query, [type, limit])
}

/**
 * Save a student attempt
 */
export async function saveStudentAttempt(
  studentId: string,
  activityId: string,
  answerGiven: string,
  isCorrect: boolean,
  timeTakenSeconds: number,
  hintsUsed: number,
  pointsEarned: number
): Promise<DbStudentAttempt> {
  const query = `
    INSERT INTO student_attempts (student_id, activity_id, answer_given, is_correct, time_taken_seconds, hints_used, points_earned)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `
  return executeInsert<DbStudentAttempt>(query, [
    studentId,
    activityId,
    answerGiven,
    isCorrect,
    timeTakenSeconds,
    hintsUsed,
    pointsEarned
  ])
}

/**
 * Get student attempts
 */
export async function getStudentAttempts(
  studentId: string,
  limit: number = 50
): Promise<DbStudentAttempt[]> {
  const query = `
    SELECT * FROM student_attempts
    WHERE student_id = $1
    ORDER BY attempted_at DESC
    LIMIT $2
  `
  return executeQuery<DbStudentAttempt>(query, [studentId, limit])
}

/**
 * Get student attempts with activity details
 */
export async function getStudentAttemptsWithActivities(
  studentId: string,
  limit: number = 50
): Promise<any[]> {
  const query = `
    SELECT sa.*, a.type, a.difficulty, a.question
    FROM student_attempts sa
    JOIN activities a ON sa.activity_id = a.id
    WHERE sa.student_id = $1
    ORDER BY sa.attempted_at DESC
    LIMIT $2
  `
  return executeQuery<any>(query, [studentId, limit])
}

/**
 * Award a badge to a student
 */
export async function awardBadge(
  studentId: string,
  badgeType: string,
  badgeName: string,
  badgeDescription: string
): Promise<DbStudentBadge | null> {
  try {
    const query = `
      INSERT INTO student_badges (student_id, badge_type, badge_name, badge_description)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (student_id, badge_type) DO NOTHING
      RETURNING *
    `
    return await executeInsert<DbStudentBadge>(query, [
      studentId,
      badgeType,
      badgeName,
      badgeDescription
    ])
  } catch (error) {
    // Badge already exists
    return null
  }
}

/**
 * Get student badges
 */
export async function getStudentBadges(studentId: string): Promise<DbStudentBadge[]> {
  const query = `
    SELECT * FROM student_badges
    WHERE student_id = $1
    ORDER BY earned_at DESC
  `
  return executeQuery<DbStudentBadge>(query, [studentId])
}

/**
 * Get student game statistics
 */
export async function getStudentGameStats(studentId: string): Promise<any> {
  const query = `
    WITH attempt_stats AS (
      SELECT
        COUNT(*) as total_attempts,
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
        SUM(CASE WHEN NOT is_correct THEN 1 ELSE 0 END) as incorrect_answers,
        SUM(points_earned) as total_points,
        AVG(CASE WHEN is_correct THEN time_taken_seconds ELSE NULL END) as avg_time_seconds
      FROM student_attempts
      WHERE student_id = $1
    ),
    activity_type_stats AS (
      SELECT
        a.type,
        COUNT(*) as count
      FROM student_attempts sa
      JOIN activities a ON sa.activity_id = a.id
      WHERE sa.student_id = $1 AND sa.is_correct = true
      GROUP BY a.type
    ),
    badge_count AS (
      SELECT COUNT(*) as badges_earned
      FROM student_badges
      WHERE student_id = $1
    ),
    student_info AS (
      SELECT level, experience
      FROM students
      WHERE id = $1
    )
    SELECT
      si.level,
      si.experience,
      COALESCE(ast.total_points, 0) as total_points,
      COALESCE(ast.correct_answers, 0) as correct_answers,
      COALESCE(ast.incorrect_answers, 0) as incorrect_answers,
      COALESCE(ast.total_attempts, 0) as total_attempts,
      COALESCE(ast.avg_time_seconds, 0) as average_time_seconds,
      COALESCE(bc.badges_earned, 0) as badges_earned
    FROM student_info si
    CROSS JOIN attempt_stats ast
    CROSS JOIN badge_count bc
  `
  return executeQuerySingle<any>(query, [studentId])
}
