export type SessionCard = {
  id: string
  name: string
  exercises: string[]
  exerciseCount: number
  setCount: number
  lastDoneAt: string | Date | null
}

export type ActiveSession = {
  id: string
  name: string
  startedAt: number
}

export type WeeklyTarget = {
  done: number
  goal: number
  daysLeft: number
}

export type PersonalRecord = {
  exerciseId: string
  exerciseName: string
  weightKg: number
  reps: number
  sessionId: string
  achievedAt: string
  previous: {
    sessionId: string
    weightKg: number
    reps: number
    achievedAt: string
  } | null
}
