/**
 * SceneSettings Component
 * Adapted from r3f-ai-language-teacher/src/components/BoardSettings.jsx
 *
 * UI controls for switching teacher and classroom
 */

'use client'

import { useTeacherStore, TEACHERS, CLASSROOMS } from '@/stores/teacherStore'

export function SceneSettings() {
  const teacher = useTeacherStore((state) => state.teacher)
  const setTeacher = useTeacherStore((state) => state.setTeacher)

  const classroom = useTeacherStore((state) => state.classroom)
  const setClassroom = useTeacherStore((state) => state.setClassroom)

  return (
    <>
      {/* Teacher Selection (positioned above blackboard) */}
      <div className="absolute right-0 bottom-full flex flex-row gap-10 mb-20">
        {TEACHERS.map((teacherName, idx) => (
          <div
            key={idx}
            className={`p-3 transition-colors duration-500 cursor-pointer rounded-lg ${
              teacher === teacherName ? 'bg-white/80' : 'bg-white/40 hover:bg-white/60'
            }`}
            onClick={() => setTeacher(teacherName)}
          >
            <div className="w-40 h-40 rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/images/${teacherName}.jpg`}
                alt={teacherName}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-3xl font-bold mt-3 text-center text-white">
              {teacherName}
            </h2>
          </div>
        ))}
      </div>

      {/* Classroom Selection (positioned below blackboard) */}
      <div className="absolute left-0 bottom-full flex flex-row gap-2 mb-20">
        <button
          className={`${
            classroom === 'default'
              ? 'text-white bg-slate-900/40'
              : 'text-white/45 bg-slate-700/20 hover:bg-slate-700/40'
          } py-4 px-10 text-4xl rounded-full transition-colors duration-500 backdrop-blur-md`}
          onClick={() => setClassroom('default')}
        >
          Aula Predeterminada
        </button>
        <button
          className={`${
            classroom === 'alternative'
              ? 'text-white bg-slate-900/40'
              : 'text-white/45 bg-slate-700/20 hover:bg-slate-700/40'
          } py-4 px-10 text-4xl rounded-full transition-colors duration-500 backdrop-blur-md`}
          onClick={() => setClassroom('alternative')}
        >
          Aula Alternativa
        </button>
      </div>
    </>
  )
}
