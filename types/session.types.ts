export type WorkoutSetDetail = {
  id: string
  position: number
  weight: string | number | null
  reps: number
  completedAt: string | null
}

export type SessionExerciseRow = {
  id: string
  position: number
  exercise: {
    id: string
    name: string
    muscleGroup: string
  }
  workoutSets: WorkoutSetDetail[]
}

export type ExercisePrevious = {
  weightKg: number
  achievedAt: string
}

export type PreviousSet = {
  weightKg: number | null
  reps: number
}

export type VolumePoint = {
  sessionId: string
  volume: number
}

export type SessionStatus = "not_started" | "in_progress" | "finished"

export type WorkoutSessionDetail = {
  id: string
  name: string
  startedAt: string | null
  endedAt: string | null
  createdAt: string
  updatedAt: string
  userId: string
  exercises: SessionExerciseRow[]
  previousByExercise?: Record<string, ExercisePrevious | null>
  previousSetsByExercise?: Record<string, PreviousSet[]>
  volumeTrend?: VolumePoint[]
}
