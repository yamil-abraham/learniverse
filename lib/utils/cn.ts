import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utilidad para combinar clases de CSS con Tailwind
 * Usa clsx para manejar clases condicionales y twMerge para resolver conflictos de Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
