/**
 * Teacher 3D Component Types
 * TypeScript definitions for 3D teacher system
 */

export interface TeacherModel {
  id: string
  name: string
  modelPath: string
  voiceId: string
  description: string
}

export interface LipsyncData {
  metadata: {
    soundFile: string
    duration: number
  }
  mouthCues: Array<{
    start: number
    end: number
    value: string // Viseme code (A, B, C, D, E, F, G, H, X)
  }>
}

export interface TeacherAnimation {
  name: string
  duration: number
  loop: boolean
}

export interface VoiceResponse {
  text: string
  audio: string // base64 encoded
  lipsync: LipsyncData
  animation: string
  expression: string
  duration: number
  // Phase 2: Whiteboard support
  showWhiteboard?: boolean
  mathProblem?: {
    operation: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'fractions'
    operand1: number
    operand2: number
  } | null
}

export interface ConversationMessage {
  role: 'student' | 'teacher'
  content: string
  timestamp: number
}

export interface TeacherSettings {
  teacherId: string
  visible: boolean
  volume: number
  speed: number
  autoResponse: boolean
}

export type TeacherExpression = 'default' | 'smile' | 'sad' | 'surprised' | 'thinking' | 'happy'

export type TeacherAnimationType =
  | 'Idle'
  | 'TalkingOne'
  | 'TalkingThree'
  | 'Happy'
  | 'Sad'
  | 'Thinking'
  | 'Surprised'
  | 'Explaining'
  | 'Pointing'

export interface Teacher3DProps {
  modelPath: string
  position?: [number, number, number]
  scale?: number
  animation?: TeacherAnimationType
  expression?: TeacherExpression
  isAnimated?: boolean
  lipsyncData?: LipsyncData | null
  onLoadComplete?: () => void
  onAnimationComplete?: () => void
}

export interface TeacherSceneProps {
  children: React.ReactNode
  cameraPosition?: [number, number, number]
  cameraFov?: number
  enableShadows?: boolean
  backgroundColor?: string
}

export interface VoiceInputProps {
  onTranscription: (text: string) => void
  onError: (error: string) => void
  isProcessing?: boolean
  disabled?: boolean
}

export interface TeacherOverlayProps {
  teacherName: string
  currentMessage: string | null
  isListening: boolean
  isSpeaking: boolean
  onToggleVisibility: () => void
  onToggleMute: () => void
  onStartVoiceInput: () => void
  onStopVoiceInput: () => void
  conversationHistory: ConversationMessage[]
  settings: TeacherSettings
}

// Available teacher models
export const AVAILABLE_TEACHERS: TeacherModel[] = [
  {
    id: 'teacher1',
    name: 'Profesora Nanami',
    modelPath: '/models/teachers/teacher1.glb',
    voiceId: 'nova',
    description: 'Profesora alegre y motivadora',
  },
  {
    id: 'teacher2',
    name: 'Profesor Naoki',
    modelPath: '/models/teachers/teacher2.glb',
    voiceId: 'onyx',
    description: 'Profesor paciente y didáctico',
  },
]

// Viseme to morph target mapping
export const VISEME_MAPPING: Record<string, string> = {
  A: 'viseme_PP', // P, B, M sounds
  B: 'viseme_kk', // K, G sounds
  C: 'viseme_I',  // I sounds
  D: 'viseme_AA', // A sounds
  E: 'viseme_O',  // O sounds
  F: 'viseme_U',  // U sounds
  G: 'viseme_FF', // F, V sounds
  H: 'viseme_TH', // TH sounds
  X: 'viseme_PP', // Silence
}
