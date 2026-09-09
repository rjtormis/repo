"use client"

import { SubpageHeader } from "@/components/subpage-header"
import { exerciseById, pastSessions } from "@/lib/demo-data"
import { formatWeight, type WeightUnit } from "@/lib/units"
import { useUserPrefs } from "@/lib/user-prefs"

type RankedLift = {
  exerciseId: string
  name: string
  weightKg: number | null
  reps: number
}

function bestLifts(): RankedLift[] {
  const best = new Map<string, RankedLift>()

  for (const session of pastSessions) {
    for (const entry of session.entries) {
      const exercise = exerciseById(entry.exerciseId)
      if (!exercise) continue

      for (const setLog of entry.sets) {
        if (!setLog.completedAt) continue
        const current = best.get(entry.exerciseId)
        const beats =
          !current ||
          (setLog.weightKg ?? 0) > (current.weightKg ?? 0) ||
          ((setLog.weightKg ?? 0) === (current.weightKg ?? 0) &&
            setLog.reps > current.reps)

        if (beats) {
          best.set(entry.exerciseId, {
            exerciseId: entry.exerciseId,
            name: exercise.name,
            weightKg: setLog.weightKg,
            reps: setLog.reps,
          })
        }
      }
    }
  }

  return [...best.values()].sort((a, b) => {
    const weight = (b.weightKg ?? 0) - (a.weightKg ?? 0)
    if (weight !== 0) return weight
    return b.reps - a.reps
  })
}

function formatLift(lift: RankedLift, unit: WeightUnit): string {
  if (lift.weightKg == null) return `${lift.reps} reps`
  return `${formatWeight(lift.weightKg, unit)} × ${lift.reps}`
}

export function LeaderboardScreen() {
  const { weightUnit } = useUserPrefs()
  const lifts = bestLifts()

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
      <SubpageHeader title="Leaderboard" />

      <p className="mb-4 text-sm text-muted-foreground">
        Heaviest logged set on each movement — from your history, not a program.
      </p>

      {lifts.length === 0 ? (
        <p className="px-1 py-8 text-sm text-muted-foreground">
          Log a set and it will rank here.
        </p>
      ) : (
        <ol className="divide-y divide-border">
          {lifts.map((lift, index) => (
            <li
              key={lift.exerciseId}
              className="flex min-h-12 items-baseline gap-3 py-3"
            >
              <span className="w-6 shrink-0 font-mono text-sm text-muted-foreground tabular-nums">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-[15px]">
                {lift.name}
              </span>
              <span className="shrink-0 font-mono text-sm tabular-nums">
                {formatLift(lift, weightUnit)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
