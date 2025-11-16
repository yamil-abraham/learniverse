/**
 * Device Detection & Performance Utilities
 * Detects device capabilities for teacher voice feature
 */

/**
 * Check if device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false

  // Check user agent
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera

  // Mobile patterns
  const mobilePatterns = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ]

  return mobilePatterns.some(pattern => userAgent.match(pattern))
}

/**
 * Check if device is tablet
 */
export function isTabletDevice(): boolean {
  if (typeof window === 'undefined') return false

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera

  // Tablet patterns
  const tabletPatterns = [
    /iPad/i,
    /Kindle/i,
    /Silk/i,
    /PlayBook/i,
  ]

  // Special check for Android tablets
  const isAndroidTablet = /Android/i.test(userAgent) && /tablet/i.test(userAgent)

  return isAndroidTablet || tabletPatterns.some(pattern => userAgent.match(pattern))
}

/**
 * Check if device has WebGL support
 */
export function hasWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!gl
  } catch (e) {
    return false
  }
}

/**
 * Check if device has microphone access
 */
export async function hasMicrophoneAccess(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return false
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach(track => track.stop())
    return true
  } catch (error) {
    return false
  }
}

/**
 * Get device performance tier
 */
export function getPerformanceTier(): 'high' | 'medium' | 'low' {
  if (typeof window === 'undefined') return 'medium'

  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 2

  // Check device memory (if available)
  const memory = (navigator as any).deviceMemory || 4

  // Check if mobile
  const isMobile = isMobileDevice()

  // Determine tier
  if (isMobile) {
    // Mobile devices get lower tier by default
    if (cores >= 8 && memory >= 6) return 'high'
    if (cores >= 4 && memory >= 4) return 'medium'
    return 'low'
  } else {
    // Desktop devices
    if (cores >= 8 && memory >= 8) return 'high'
    if (cores >= 4 && memory >= 4) return 'medium'
    return 'low'
  }
}

/**
 * Check if teacher voice feature should be enabled
 */
export function shouldEnableTeacherVoice(): boolean {
  const envEnabled = process.env.NEXT_PUBLIC_ENABLE_TEACHER_VOICE === 'true'
  const mobileEnabled = process.env.NEXT_PUBLIC_TEACHER_MOBILE_ENABLED === 'true'

  if (!envEnabled) return false

  // Disable on mobile if not explicitly enabled
  if (isMobileDevice() && !mobileEnabled) {
    return false
  }

  // Require WebGL support
  if (!hasWebGLSupport()) {
    return false
  }

  return true
}

/**
 * Get recommended quality settings based on device
 */
export function getRecommendedQualitySettings(): {
  enableShadows: boolean
  enableAnimations: boolean
  enableWhiteboard: boolean
  targetFPS: number
  modelQuality: 'high' | 'medium' | 'low'
} {
  const tier = getPerformanceTier()
  const isMobile = isMobileDevice()

  switch (tier) {
    case 'high':
      return {
        enableShadows: true,
        enableAnimations: true,
        enableWhiteboard: true,
        targetFPS: 60,
        modelQuality: 'high',
      }

    case 'medium':
      return {
        enableShadows: !isMobile,
        enableAnimations: true,
        enableWhiteboard: true,
        targetFPS: isMobile ? 30 : 60,
        modelQuality: 'medium',
      }

    case 'low':
      return {
        enableShadows: false,
        enableAnimations: true,
        enableWhiteboard: false,
        targetFPS: 30,
        modelQuality: 'low',
      }
  }
}

/**
 * Monitor FPS performance
 */
export class FPSMonitor {
  private frames: number = 0
  private lastTime: number = performance.now()
  private fps: number = 60
  private callbacks: Set<(fps: number) => void> = new Set()

  constructor() {
    this.tick()
  }

  private tick = () => {
    const now = performance.now()
    this.frames++

    if (now >= this.lastTime + 1000) {
      this.fps = Math.round((this.frames * 1000) / (now - this.lastTime))
      this.frames = 0
      this.lastTime = now

      // Notify callbacks
      this.callbacks.forEach(callback => callback(this.fps))
    }

    requestAnimationFrame(this.tick)
  }

  getFPS(): number {
    return this.fps
  }

  onFPSUpdate(callback: (fps: number) => void): () => void {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }
}

/**
 * Get memory usage (if available)
 */
export function getMemoryUsage(): { used: number; total: number } | null {
  if (typeof window === 'undefined') return null

  const memory = (performance as any).memory

  if (!memory) return null

  return {
    used: memory.usedJSHeapSize / 1048576, // MB
    total: memory.totalJSHeapSize / 1048576, // MB
  }
}
