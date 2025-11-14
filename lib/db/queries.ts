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
