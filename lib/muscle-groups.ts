export const MUSCLE_GROUP_FILTERS = [
  "CHEST",
  "BACK",
  "SHOULDERS",
  "QUADRICEPS",
  "HAMSTRINGS",
  "GLUTES",
  "BICEPS",
  "TRICEPS",
  "ABDOMINALS",
  "TRAPEZIUS",
  "FOREARMS",
  "CALVES",
  "HIP_FLEXORS",
  "ADDUCTORS",
  "ABDUCTORS",
  "SHINS",
] as const

export type MuscleGroupFilter = (typeof MUSCLE_GROUP_FILTERS)[number]

export function muscleGroupLabel(group: string) {
  return group
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
