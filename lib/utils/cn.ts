import { clsx, type ClassValue } from 'clsx'

/**
 * Utilidad para combinar clases de CSS con Tailwind
 * Usa clsx para manejar clases condicionales
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
