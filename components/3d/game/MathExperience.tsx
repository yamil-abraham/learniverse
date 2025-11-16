/**
 * MathExperience Component
 * Adapted from r3f-ai-language-teacher/src/components/Experience.jsx
 *
 * Main 3D scene for immersive math teacher
 */

'use client'

import { Suspense, useEffect, useRef } from 'react'
import { CameraControls, Environment, Float, Html, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useSession } from 'next-auth/react'
import { useTeacherStore } from '@/stores/teacherStore'
import { MathTeacher } from './MathTeacher'
import { MathBlackboard } from './MathBlackboard'
import { SceneSettings } from './SceneSettings'

// Helper to convert degrees to radians
const degToRad = (degrees: number) => degrees * (Math.PI / 180)

/**
 * Item placement configuration (copied from reference Experience.jsx)
 * Positions for classroom, teacher, and blackboard
 */
const itemPlacement = {
  default: {
    classroom: {
      position: [0.2, -1.7, -2] as [number, number, number],
    },
    teacher: {
      position: [-1, -1.7, -3] as [number, number, number],
    },
    board: {
      position: [0.45, 0.382, -6] as [number, number, number],
    },
  },
  alternative: {
    classroom: {
      position: [0.3, -1.7, -1.5] as [number, number, number],
      rotation: [0, degToRad(-90), 0] as [number, number, number],
      scale: 0.4,
    },
    teacher: {
      position: [-1, -1.7, -3] as [number, number, number],
    },
    board: {
      position: [1.4, 0.84, -8] as [number, number, number],
    },
  },
}

/**
 * Camera positions and zoom levels (copied from reference Experience.jsx)
 */
const CAMERA_POSITIONS = {
  default: [0, 0, 0.0001] as [number, number, number],
  loading: [0.00002621880610890309, 0.00000515037441056466, 0.00009636414192870058] as [number, number, number],
  speaking: [0, -1.6481333940859815e-7, 0.00009999846226827279] as [number, number, number],
}

const CAMERA_ZOOMS = {
  default: 1,
  loading: 1.3,
  speaking: 2.1204819420055387,
}

/**
 * Camera Manager Component (copied from reference Experience.jsx)
 */
function CameraManager() {
  const controls = useRef<CameraControls>(null!)
  const loading = useTeacherStore((state) => state.loading)
  const currentMessage = useTeacherStore((state) => state.currentMessage)

  useEffect(() => {
    if (loading) {
      // Zoom in slightly when thinking
      controls.current?.setPosition(...CAMERA_POSITIONS.loading, true)
      controls.current?.zoomTo(CAMERA_ZOOMS.loading, true)
    } else if (currentMessage) {
      // Zoom to blackboard when teacher speaks
      controls.current?.setPosition(...CAMERA_POSITIONS.speaking, true)
      controls.current?.zoomTo(CAMERA_ZOOMS.speaking, true)
    }
    // Note: Camera returns to default when currentMessage = null
  }, [loading, currentMessage])

  return (
    <CameraControls
      ref={controls}
      minZoom={1}
      maxZoom={3}
      polarRotateSpeed={-0.3} // Reverse for natural effect
      azimuthRotateSpeed={-0.3} // Reverse for natural effect
    />
  )
}

/**
 * Main Experience Component
 */
export function MathExperience() {
  const { data: session } = useSession()
  const teacher = useTeacherStore((state) => state.teacher)
  const classroom = useTeacherStore((state) => state.classroom)

  return (
    <Suspense fallback={null}>
      <CameraManager />

      <Float speed={0.5} floatIntensity={0.2} rotationIntensity={0.1}>
        {/* Blackboard (HTML in 3D space) */}
        <Html
          transform
          {...itemPlacement[classroom].board}
          distanceFactor={1}
        >
          <MathBlackboard
            classroom={classroom}
            studentName={session?.user?.name}
          />
          <SceneSettings />
        </Html>

        {/* Environment Lighting */}
        <Environment preset="sunset" />
        {/* @ts-expect-error - R3F JSX element */}
        <ambientLight intensity={0.8} color="pink" />

        {/* Classroom Model */}
        {/* @ts-expect-error - R3F JSX element */}
        <primitive
          object={useGLTF(`/models/environments/classroom${classroom === 'default' ? '1' : '2'}.glb`).scene}
          {...itemPlacement[classroom].classroom}
        />

        {/* Teacher Model */}
        <MathTeacher
          teacher={teacher}
          key={teacher}
          {...itemPlacement[classroom].teacher}
          scale={1.5}
          rotation-y={degToRad(20)}
        />
      </Float>
    </Suspense>
  )
}

// Preload classroom models
useGLTF.preload('/models/environments/classroom1.glb')
useGLTF.preload('/models/environments/classroom2.glb')
