import type { Exercise, Session } from "@/lib/types"

/** Synthetic demo content — not real user history. */
export const DEMO_NOTE = "Synthetic demo data"

export const exercises: Exercise[] = [
  { id: "ex-squat", name: "Back Squat" },
  { id: "ex-bench", name: "Bench Press" },
  { id: "ex-row", name: "Barbell Row" },
  { id: "ex-ohp", name: "Overhead Press" },
  { id: "ex-rdl", name: "Romanian Deadlift" },
  { id: "ex-pullup", name: "Pull-Up" },
  { id: "ex-curl", name: "Barbell Curl" },
  { id: "ex-lat", name: "Lat Pulldown" },
]

function daysAgo(n: number, hour = 18): string {
  const d = new Date()
  d.setHours(hour, 12, 0, 0)
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function set(
  id: string,
  weightKg: number | null,
  reps: number,
  completedAt: string
) {
  return { id, weightKg, reps, completedAt }
}

/** Finished sessions only — active workouts are created at /workout. */
export const pastSessions: Session[] = [
  {
    id: "ses-1",
    name: "Push",
    startedAt: daysAgo(1, 17),
    finishedAt: daysAgo(1, 18),
    entries: [
      {
        id: "e1",
        exerciseId: "ex-bench",
        sets: [
          set("s1", 80, 8, daysAgo(1, 17)),
          set("s2", 80, 8, daysAgo(1, 17)),
          set("s3", 80, 6, daysAgo(1, 17)),
        ],
      },
      {
        id: "e2",
        exerciseId: "ex-ohp",
        sets: [
          set("s4", 50, 8, daysAgo(1, 17)),
          set("s5", 50, 7, daysAgo(1, 18)),
          set("s6", 47.5, 8, daysAgo(1, 18)),
        ],
      },
    ],
  },
  {
    id: "ses-2",
    name: "Pull",
    startedAt: daysAgo(3, 17),
    finishedAt: daysAgo(3, 18),
    entries: [
      {
        id: "e3",
        exerciseId: "ex-row",
        sets: [
          set("s7", 70, 8, daysAgo(3, 17)),
          set("s8", 70, 8, daysAgo(3, 17)),
          set("s9", 70, 8, daysAgo(3, 18)),
        ],
      },
      {
        id: "e4",
        exerciseId: "ex-pullup",
        sets: [
          set("s10", null, 8, daysAgo(3, 18)),
          set("s11", null, 7, daysAgo(3, 18)),
          set("s12", null, 6, daysAgo(3, 18)),
        ],
      },
      {
        id: "e5",
        exerciseId: "ex-curl",
        sets: [
          set("s13", 35, 10, daysAgo(3, 18)),
          set("s14", 35, 8, daysAgo(3, 18)),
        ],
      },
    ],
  },
  {
    id: "ses-3",
    name: "Legs",
    startedAt: daysAgo(5, 16),
    finishedAt: daysAgo(5, 17),
    entries: [
      {
        id: "e6",
        exerciseId: "ex-squat",
        sets: [
          set("s15", 100, 5, daysAgo(5, 16)),
          set("s16", 100, 5, daysAgo(5, 16)),
          set("s17", 100, 5, daysAgo(5, 17)),
          set("s18", 90, 8, daysAgo(5, 17)),
        ],
      },
      {
        id: "e7",
        exerciseId: "ex-rdl",
        sets: [
          set("s19", 90, 8, daysAgo(5, 17)),
          set("s20", 90, 8, daysAgo(5, 17)),
          set("s21", 90, 8, daysAgo(5, 17)),
        ],
      },
    ],
  },
]

/** Extra activity days for heatmap density (set-count based; intensity metric open). */
export const activityByDay: Record<string, number> = (() => {
  const map: Record<string, number> = {}
  for (const s of pastSessions) {
    for (const entry of s.entries) {
      for (const setLog of entry.sets) {
        if (!setLog.completedAt) continue
        const key = setLog.completedAt.slice(0, 10)
        map[key] = (map[key] ?? 0) + 1
      }
    }
  }
  // Sparse older activity so the year graph isn't empty
  for (let i = 8; i < 120; i += 2 + (i % 5)) {
    const key = daysAgo(i).slice(0, 10)
    map[key] = (map[key] ?? 0) + (1 + (i % 4))
  }
  return map
})()

export function exerciseById(id: string): Exercise | undefined {
  return exercises.find((e) => e.id === id)
}

export function sessionById(id: string): Session | undefined {
  return pastSessions.find((s) => s.id === id)
}

/** Last completed sets for an exercise, newest session first. Names ignored. */
export function lastSetsForExercise(exerciseId: string): {
  weightKg: number | null
  reps: number
}[] {
  for (const session of pastSessions) {
    const entry = session.entries.find((e) => e.exerciseId === exerciseId)
    if (!entry) continue
    const done = entry.sets.filter((s) => s.completedAt)
    if (done.length) {
      return done.map((s) => ({ weightKg: s.weightKg, reps: s.reps }))
    }
  }
  return []
}
