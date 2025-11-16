/**
 * Whiteboard Drawing Utilities
 * Tools for drawing on 3D whiteboard
 */

import * as THREE from 'three'

/**
 * Drawing types
 */
export type DrawingType = 'line' | 'arrow' | 'circle' | 'rectangle' | 'text' | 'equation'

/**
 * Drawing stroke
 */
export interface DrawingStroke {
  type: DrawingType
  points: THREE.Vector3[]
  color: THREE.Color
  width: number
  timestamp: number
}

/**
 * Whiteboard state
 */
export interface WhiteboardState {
  strokes: DrawingStroke[]
  currentColor: THREE.Color
  currentWidth: number
  isDrawing: boolean
}

/**
 * Create a line from points
 */
export function createLine(
  points: THREE.Vector3[],
  color: THREE.Color = new THREE.Color(0x000000),
  width: number = 0.02
): THREE.Line {
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({
    color: color,
    linewidth: width * 100 // Scale up for visibility
  })
  return new THREE.Line(geometry, material)
}

/**
 * Create an arrow
 */
export function createArrow(
  start: THREE.Vector3,
  end: THREE.Vector3,
  color: THREE.Color = new THREE.Color(0x000000),
  headLength: number = 0.2,
  headWidth: number = 0.1
): THREE.ArrowHelper {
  const direction = new THREE.Vector3().subVectors(end, start)
  const length = direction.length()
  direction.normalize()

  return new THREE.ArrowHelper(direction, start, length, color.getHex(), headLength, headWidth)
}

/**
 * Create a circle
 */
export function createCircle(
  center: THREE.Vector3,
  radius: number,
  color: THREE.Color = new THREE.Color(0x000000),
  segments: number = 32
): THREE.Line {
  const points: THREE.Vector3[] = []

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    const x = center.x + Math.cos(angle) * radius
    const y = center.y + Math.sin(angle) * radius
    points.push(new THREE.Vector3(x, y, center.z))
  }

  return createLine(points, color)
}

/**
 * Create a rectangle
 */
export function createRectangle(
  topLeft: THREE.Vector3,
  width: number,
  height: number,
  color: THREE.Color = new THREE.Color(0x000000)
): THREE.Line {
  const points = [
    topLeft,
    new THREE.Vector3(topLeft.x + width, topLeft.y, topLeft.z),
    new THREE.Vector3(topLeft.x + width, topLeft.y - height, topLeft.z),
    new THREE.Vector3(topLeft.x, topLeft.y - height, topLeft.z),
    topLeft // Close the rectangle
  ]

  return createLine(points, color)
}

/**
 * Smooth a curve using Catmull-Rom spline
 */
export function smoothCurve(points: THREE.Vector3[], tension: number = 0.5): THREE.Vector3[] {
  if (points.length < 3) return points

  const curve = new THREE.CatmullRomCurve3(points)
  curve.tension = tension

  return curve.getPoints(points.length * 10)
}

/**
 * Animate drawing a stroke
 */
export function* animateStroke(
  stroke: DrawingStroke,
  duration: number = 1000
): Generator<THREE.Vector3[], void, unknown> {
  const steps = 30
  const pointsPerStep = Math.ceil(stroke.points.length / steps)

  for (let i = 0; i < steps; i++) {
    const endIndex = Math.min((i + 1) * pointsPerStep, stroke.points.length)
    yield stroke.points.slice(0, endIndex)
  }
}

/**
 * Clear whiteboard
 */
export function clearWhiteboard(scene: THREE.Scene, whiteboardGroup: THREE.Group): void {
  // Remove all children from whiteboard group
  while (whiteboardGroup.children.length > 0) {
    const child = whiteboardGroup.children[0]
    whiteboardGroup.remove(child)

    // Dispose geometry and material to free memory
    if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
      child.geometry.dispose()
      if (Array.isArray(child.material)) {
        child.material.forEach(mat => mat.dispose())
      } else {
        child.material.dispose()
      }
    }
  }
}

/**
 * Convert 2D screen coordinates to 3D whiteboard coordinates
 */
export function screenToWhiteboard(
  screenX: number,
  screenY: number,
  whiteboardWidth: number,
  whiteboardHeight: number,
  whiteboardPosition: THREE.Vector3
): THREE.Vector3 {
  // Normalize screen coordinates to -1 to 1
  const normalizedX = (screenX / window.innerWidth) * 2 - 1
  const normalizedY = -(screenY / window.innerHeight) * 2 + 1

  // Map to whiteboard space
  const x = whiteboardPosition.x + (normalizedX * whiteboardWidth / 2)
  const y = whiteboardPosition.y + (normalizedY * whiteboardHeight / 2)
  const z = whiteboardPosition.z + 0.01 // Slightly in front of whiteboard

  return new THREE.Vector3(x, y, z)
}

/**
 * Predefined colors for whiteboard
 */
export const WHITEBOARD_COLORS = {
  BLACK: new THREE.Color(0x000000),
  RED: new THREE.Color(0xff0000),
  BLUE: new THREE.Color(0x0000ff),
  GREEN: new THREE.Color(0x00ff00),
  ORANGE: new THREE.Color(0xff8800),
  PURPLE: new THREE.Color(0x8800ff),
}

/**
 * Export whiteboard as image (for saving)
 */
export function exportWhiteboardAsImage(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera
): string {
  renderer.render(scene, camera)
  return renderer.domElement.toDataURL('image/png')
}

export default {
  createLine,
  createArrow,
  createCircle,
  createRectangle,
  smoothCurve,
  animateStroke,
  clearWhiteboard,
  screenToWhiteboard,
  exportWhiteboardAsImage,
  WHITEBOARD_COLORS,
}
