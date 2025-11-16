/**
 * Math Animation Utilities
 * Animated step-by-step math problem solving
 */

import * as THREE from 'three'
import { createLine, createCircle, createRectangle, createArrow, WHITEBOARD_COLORS } from './drawing'

/**
 * Math operation types
 */
export type MathOperationType = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'fractions'

/**
 * Animation step
 */
export interface AnimationStep {
  type: 'draw' | 'write' | 'highlight' | 'pause' | 'clear'
  duration: number
  object?: THREE.Object3D
  text?: string
  position?: THREE.Vector3
  color?: THREE.Color
}

/**
 * Math problem visualization
 */
export interface MathProblemVisualization {
  steps: AnimationStep[]
  totalDuration: number
}

/**
 * Generate visualization for addition
 */
export function generateAdditionVisualization(
  a: number,
  b: number,
  whiteboardPosition: THREE.Vector3
): MathProblemVisualization {
  const steps: AnimationStep[] = []
  const baseY = whiteboardPosition.y + 0.5

  // Step 1: Draw first number with objects
  for (let i = 0; i < a; i++) {
    const x = whiteboardPosition.x - 1 + (i * 0.3)
    const circle = createCircle(
      new THREE.Vector3(x, baseY, whiteboardPosition.z + 0.01),
      0.1,
      WHITEBOARD_COLORS.BLUE
    )
    steps.push({
      type: 'draw',
      duration: 300,
      object: circle
    })
  }

  // Step 2: Pause
  steps.push({
    type: 'pause',
    duration: 500
  })

  // Step 3: Draw + sign
  steps.push({
    type: 'write',
    duration: 300,
    text: '+',
    position: new THREE.Vector3(whiteboardPosition.x, baseY, whiteboardPosition.z + 0.01),
    color: WHITEBOARD_COLORS.BLACK
  })

  // Step 4: Draw second number with objects
  for (let i = 0; i < b; i++) {
    const x = whiteboardPosition.x + 0.5 + (i * 0.3)
    const circle = createCircle(
      new THREE.Vector3(x, baseY, whiteboardPosition.z + 0.01),
      0.1,
      WHITEBOARD_COLORS.RED
    )
    steps.push({
      type: 'draw',
      duration: 300,
      object: circle
    })
  }

  // Step 5: Pause
  steps.push({
    type: 'pause',
    duration: 500
  })

  // Step 6: Draw equals sign
  steps.push({
    type: 'write',
    duration: 300,
    text: '=',
    position: new THREE.Vector3(whiteboardPosition.x, baseY - 0.5, whiteboardPosition.z + 0.01),
    color: WHITEBOARD_COLORS.BLACK
  })

  // Step 7: Highlight result
  const result = a + b
  const resultCircle = createCircle(
    new THREE.Vector3(whiteboardPosition.x + 0.5, baseY - 0.5, whiteboardPosition.z + 0.01),
    0.3,
    WHITEBOARD_COLORS.GREEN
  )
  steps.push({
    type: 'draw',
    duration: 500,
    object: resultCircle
  })

  // Step 8: Write result number
  steps.push({
    type: 'write',
    duration: 500,
    text: result.toString(),
    position: new THREE.Vector3(whiteboardPosition.x + 0.5, baseY - 0.5, whiteboardPosition.z + 0.01),
    color: WHITEBOARD_COLORS.GREEN
  })

  const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0)

  return { steps, totalDuration }
}

/**
 * Generate visualization for subtraction
 */
export function generateSubtractionVisualization(
  a: number,
  b: number,
  whiteboardPosition: THREE.Vector3
): MathProblemVisualization {
  const steps: AnimationStep[] = []
  const baseY = whiteboardPosition.y + 0.5

  // Step 1: Draw all objects for first number
  const objects: THREE.Line[] = []
  for (let i = 0; i < a; i++) {
    const x = whiteboardPosition.x - 1 + (i * 0.3)
    const circle = createCircle(
      new THREE.Vector3(x, baseY, whiteboardPosition.z + 0.01),
      0.1,
      WHITEBOARD_COLORS.BLUE
    )
    objects.push(circle)
    steps.push({
      type: 'draw',
      duration: 300,
      object: circle
    })
  }

  // Step 2: Pause
  steps.push({
    type: 'pause',
    duration: 500
  })

  // Step 3: Draw - sign
  steps.push({
    type: 'write',
    duration: 300,
    text: '-',
    position: new THREE.Vector3(whiteboardPosition.x, baseY, whiteboardPosition.z + 0.01),
    color: WHITEBOARD_COLORS.BLACK
  })

  // Step 4: Cross out b objects
  for (let i = 0; i < b; i++) {
    const x = whiteboardPosition.x - 1 + (i * 0.3)
    const crossLine1 = createLine([
      new THREE.Vector3(x - 0.15, baseY - 0.15, whiteboardPosition.z + 0.02),
      new THREE.Vector3(x + 0.15, baseY + 0.15, whiteboardPosition.z + 0.02)
    ], WHITEBOARD_COLORS.RED, 0.03)

    const crossLine2 = createLine([
      new THREE.Vector3(x - 0.15, baseY + 0.15, whiteboardPosition.z + 0.02),
      new THREE.Vector3(x + 0.15, baseY - 0.15, whiteboardPosition.z + 0.02)
    ], WHITEBOARD_COLORS.RED, 0.03)

    steps.push({
      type: 'draw',
      duration: 400,
      object: crossLine1
    })
    steps.push({
      type: 'draw',
      duration: 400,
      object: crossLine2
    })
  }

  // Step 5: Pause
  steps.push({
    type: 'pause',
    duration: 500
  })

  // Step 6: Write result
  const result = a - b
  steps.push({
    type: 'write',
    duration: 500,
    text: `= ${result}`,
    position: new THREE.Vector3(whiteboardPosition.x, baseY - 0.7, whiteboardPosition.z + 0.01),
    color: WHITEBOARD_COLORS.GREEN
  })

  const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0)

  return { steps, totalDuration }
}

/**
 * Generate visualization for multiplication
 */
export function generateMultiplicationVisualization(
  a: number,
  b: number,
  whiteboardPosition: THREE.Vector3
): MathProblemVisualization {
  const steps: AnimationStep[] = []
  const baseY = whiteboardPosition.y + 0.5

  // Draw array of objects (rows x columns)
  for (let row = 0; row < a; row++) {
    for (let col = 0; col < b; col++) {
      const x = whiteboardPosition.x - 1 + (col * 0.3)
      const y = baseY - (row * 0.3)
      const circle = createCircle(
        new THREE.Vector3(x, y, whiteboardPosition.z + 0.01),
        0.1,
        WHITEBOARD_COLORS.BLUE
      )
      steps.push({
        type: 'draw',
        duration: 200,
        object: circle
      })
    }

    // Pause after each row
    steps.push({
      type: 'pause',
      duration: 300
    })
  }

  // Draw multiplication symbol
  steps.push({
    type: 'write',
    duration: 300,
    text: `${a} × ${b}`,
    position: new THREE.Vector3(whiteboardPosition.x + 1, baseY, whiteboardPosition.z + 0.01),
    color: WHITEBOARD_COLORS.BLACK
  })

  // Draw result
  const result = a * b
  steps.push({
    type: 'write',
    duration: 500,
    text: `= ${result}`,
    position: new THREE.Vector3(whiteboardPosition.x + 1, baseY - 0.5, whiteboardPosition.z + 0.01),
    color: WHITEBOARD_COLORS.GREEN
  })

  const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0)

  return { steps, totalDuration }
}

/**
 * Generate visualization for division
 */
export function generateDivisionVisualization(
  a: number,
  b: number,
  whiteboardPosition: THREE.Vector3
): MathProblemVisualization {
  const steps: AnimationStep[] = []
  const baseY = whiteboardPosition.y + 0.5
  const result = Math.floor(a / b)

  // Draw all objects
  for (let i = 0; i < a; i++) {
    const x = whiteboardPosition.x - 1 + ((i % 8) * 0.3)
    const y = baseY - (Math.floor(i / 8) * 0.3)
    const circle = createCircle(
      new THREE.Vector3(x, y, whiteboardPosition.z + 0.01),
      0.1,
      WHITEBOARD_COLORS.BLUE
    )
    steps.push({
      type: 'draw',
      duration: 200,
      object: circle
    })
  }

  // Pause
  steps.push({
    type: 'pause',
    duration: 500
  })

  // Group objects into b groups
  for (let group = 0; group < result; group++) {
    const groupX = whiteboardPosition.x - 1 + (group * 1.5)
    const groupY = baseY - 1.5

    // Draw rectangle around group
    const rect = createRectangle(
      new THREE.Vector3(groupX - 0.2, groupY + 0.5, whiteboardPosition.z + 0.01),
      0.4 + (b * 0.3),
      0.5,
      WHITEBOARD_COLORS.GREEN
    )
    steps.push({
      type: 'draw',
      duration: 400,
      object: rect
    })
  }

  // Write result
  steps.push({
    type: 'write',
    duration: 500,
    text: `${a} ÷ ${b} = ${result}`,
    position: new THREE.Vector3(whiteboardPosition.x, baseY - 2.5, whiteboardPosition.z + 0.01),
    color: WHITEBOARD_COLORS.GREEN
  })

  const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0)

  return { steps, totalDuration }
}

/**
 * Generate visualization for fractions
 */
export function generateFractionVisualization(
  numerator: number,
  denominator: number,
  whiteboardPosition: THREE.Vector3
): MathProblemVisualization {
  const steps: AnimationStep[] = []
  const baseY = whiteboardPosition.y + 0.5

  // Draw circle for whole
  const wholeCircle = createCircle(
    new THREE.Vector3(whiteboardPosition.x, baseY, whiteboardPosition.z + 0.01),
    0.8,
    WHITEBOARD_COLORS.BLACK
  )
  steps.push({
    type: 'draw',
    duration: 500,
    object: wholeCircle
  })

  // Divide into sections
  for (let i = 0; i < denominator; i++) {
    const angle = (i / denominator) * Math.PI * 2
    const endX = whiteboardPosition.x + Math.cos(angle) * 0.8
    const endY = baseY + Math.sin(angle) * 0.8
    const line = createLine([
      new THREE.Vector3(whiteboardPosition.x, baseY, whiteboardPosition.z + 0.01),
      new THREE.Vector3(endX, endY, whiteboardPosition.z + 0.01)
    ], WHITEBOARD_COLORS.BLACK, 0.02)
    steps.push({
      type: 'draw',
      duration: 300,
      object: line
    })
  }

  // Highlight numerator sections
  for (let i = 0; i < numerator; i++) {
    const angle = (i / denominator) * Math.PI * 2
    const midAngle = angle + (Math.PI / denominator)
    const highlightX = whiteboardPosition.x + Math.cos(midAngle) * 0.4
    const highlightY = baseY + Math.sin(midAngle) * 0.4
    const highlightCircle = createCircle(
      new THREE.Vector3(highlightX, highlightY, whiteboardPosition.z + 0.02),
      0.1,
      WHITEBOARD_COLORS.GREEN
    )
    steps.push({
      type: 'draw',
      duration: 400,
      object: highlightCircle
    })
  }

  // Write fraction
  steps.push({
    type: 'write',
    duration: 500,
    text: `${numerator}/${denominator}`,
    position: new THREE.Vector3(whiteboardPosition.x + 1.5, baseY, whiteboardPosition.z + 0.01),
    color: WHITEBOARD_COLORS.BLACK
  })

  const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0)

  return { steps, totalDuration }
}

/**
 * Generate visualization based on operation type
 */
export function generateMathVisualization(
  operation: MathOperationType,
  operand1: number,
  operand2: number,
  whiteboardPosition: THREE.Vector3
): MathProblemVisualization {
  switch (operation) {
    case 'addition':
      return generateAdditionVisualization(operand1, operand2, whiteboardPosition)
    case 'subtraction':
      return generateSubtractionVisualization(operand1, operand2, whiteboardPosition)
    case 'multiplication':
      return generateMultiplicationVisualization(operand1, operand2, whiteboardPosition)
    case 'division':
      return generateDivisionVisualization(operand1, operand2, whiteboardPosition)
    case 'fractions':
      return generateFractionVisualization(operand1, operand2, whiteboardPosition)
    default:
      return { steps: [], totalDuration: 0 }
  }
}

export default {
  generateAdditionVisualization,
  generateSubtractionVisualization,
  generateMultiplicationVisualization,
  generateDivisionVisualization,
  generateFractionVisualization,
  generateMathVisualization,
}
