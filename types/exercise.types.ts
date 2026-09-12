export type CatalogExercise = {
  id: string
  name: string
  muscleGroups: string
}

export type ExercisePage = {
  recents: CatalogExercise[]
  items: CatalogExercise[]
  nextCursor: string | null
}

export type ExerciseDetail = {
  id: string
  name: string
  shortDemo: string | null
  inDepthDemo: string | null
  difficulty: string
  muscleGroups: string
  primeMoverMuscle: string
  equipments: string[]
  bodyRegion: string
  mechanics: string
}

export type ExerciseHistorySet = {
  position: number
  weightKg: number | null
  reps: number
}

export type ExerciseHistoryEntry = {
  sessionId: string
  sessionName: string
  startedAt: string
  sets: ExerciseHistorySet[]
}

export type ExerciseRecordLift = {
  sessionId: string
  weightKg: number
  reps: number
  achievedAt: string
  e1rmKg: number
}

export type ExerciseRecord = ExerciseRecordLift & {
  previous: ExerciseRecordLift | null
}

export type ActiveWorkout = {
  id: string
  name: string
  alreadyAdded: boolean
}

export type ExerciseDetailPayload = {
  exercise: ExerciseDetail
  history: ExerciseHistoryEntry[]
  record: ExerciseRecord | null
  activeSession: ActiveWorkout | null
}
