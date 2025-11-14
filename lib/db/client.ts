/**
 * Cliente de base de datos para Vercel Postgres
 * Proporciona funciones de conexión y helpers para consultas
 */

import { sql } from '@vercel/postgres'

/**
 * Clase de errores personalizados para base de datos
 */
export class DatabaseError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message)
    this.name = 'DatabaseError'
  }
}

/**
 * Ejecuta una consulta SELECT y retorna los resultados
 * @param query - Consulta SQL
 * @param params - Parámetros de la consulta
 * @returns Array de filas
 */
export async function executeQuery<T = any>(
  query: string,
  params?: any[]
): Promise<T[]> {
  try {
    const result = await sql.query(query, params)
    return result.rows as T[]
  } catch (error) {
    console.error('Error executing query:', error)
    throw new DatabaseError(
      `Error executing query: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error
    )
  }
}

/**
 * Ejecuta una consulta SELECT y retorna una sola fila
 * @param query - Consulta SQL
 * @param params - Parámetros de la consulta
 * @returns Una fila o null
 */
export async function executeQuerySingle<T = any>(
  query: string,
  params?: any[]
): Promise<T | null> {
  try {
    const result = await sql.query(query, params)
    return (result.rows[0] as T) || null
  } catch (error) {
    console.error('Error executing single query:', error)
    throw new DatabaseError(
      `Error executing single query: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error
    )
  }
}

/**
 * Ejecuta una consulta INSERT y retorna la fila insertada
 * @param query - Consulta SQL
 * @param params - Parámetros de la consulta
 * @returns La fila insertada
 */
export async function executeInsert<T = any>(
  query: string,
  params?: any[]
): Promise<T> {
  try {
    const result = await sql.query(query, params)
    if (!result.rows[0]) {
      throw new Error('Insert query did not return a row')
    }
    return result.rows[0] as T
  } catch (error) {
    console.error('Error executing insert:', error)
    throw new DatabaseError(
      `Error executing insert: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error
    )
  }
}

/**
 * Ejecuta una consulta UPDATE y retorna la fila actualizada
 * @param query - Consulta SQL
 * @param params - Parámetros de la consulta
 * @returns La fila actualizada o null
 */
export async function executeUpdate<T = any>(
  query: string,
  params?: any[]
): Promise<T | null> {
  try {
    const result = await sql.query(query, params)
    return (result.rows[0] as T) || null
  } catch (error) {
    console.error('Error executing update:', error)
    throw new DatabaseError(
      `Error executing update: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error
    )
  }
}

/**
 * Ejecuta una consulta DELETE
 * @param query - Consulta SQL
 * @param params - Parámetros de la consulta
 * @returns Número de filas eliminadas
 */
export async function executeDelete(
  query: string,
  params?: any[]
): Promise<number> {
  try {
    const result = await sql.query(query, params)
    return result.rowCount || 0
  } catch (error) {
    console.error('Error executing delete:', error)
    throw new DatabaseError(
      `Error executing delete: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error
    )
  }
}

/**
 * Ejecuta múltiples consultas en una transacción
 * @param queries - Array de objetos {query, params}
 * @returns true si la transacción fue exitosa
 */
export async function executeTransaction(
  queries: Array<{ query: string; params?: any[] }>
): Promise<boolean> {
  try {
    await sql.query('BEGIN')

    for (const { query, params } of queries) {
      await sql.query(query, params)
    }

    await sql.query('COMMIT')
    return true
  } catch (error) {
    await sql.query('ROLLBACK')
    console.error('Error executing transaction:', error)
    throw new DatabaseError(
      `Error executing transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error
    )
  }
}

/**
 * Verifica la conexión con la base de datos
 * @returns true si la conexión es exitosa
 */
export async function testConnection(): Promise<boolean> {
  try {
    await sql.query('SELECT 1')
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}
