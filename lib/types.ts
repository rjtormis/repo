/** Per-set storage — never collapse to {weight, reps, sets}. */
export type SetLog = {
  id: string
  weightKg: number | null
  reps: number
  completedAt: string | null
}

export type ExerciseEntry = {
  id: string
  exerciseId: string
  sets: SetLog[]
}

export type Session = {
  id: string
  /** Recognition only — never used for counts, streaks, or heatmap. */
  name: string
  startedAt: string
  finishedAt: string | null
  entries: ExerciseEntry[]
}

export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Legs"
  | "Shoulders"
  | "Arms"
  | "Core"

export type Exercise = {
  id: string
  name: string
  muscleGroup: MuscleGroup
}

export const MUSCLE_GROUP_ORDER: MuscleGroup[] = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
]
