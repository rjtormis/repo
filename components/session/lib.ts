import { MONTHS, WEEKDAYS } from "@/components/session/constants"
import { formatWeight, type WeightUnit } from "@/lib/units"
import type {
  SessionExerciseRow,
  SessionStatus,
  WorkoutSessionDetail,
  WorkoutSetDetail,
} from "@/types/session.types"

export function sessionStatusOf(
  session?: {
    startedAt?: string | Date | null
    endedAt?: string | Date | null
  } | null
): SessionStatus {
  if (!session) return "not_started"
  if (session.startedAt && session.endedAt) return "finished"
  if (session.startedAt) return "in_progress"
  return "not_started"
}

export function weightKg(weight: WorkoutSetDetail["weight"]): number | null {
  if (weight == null || weight === "") return null
  const n = typeof weight === "number" ? weight : Number(weight)
  return Number.isFinite(n) ? n : null
}

export function completedSets(row: SessionExerciseRow): WorkoutSetDetail[] {
  return row.workoutSets.filter((setLog) => setLog.completedAt)
}

export function setSummary(row: SessionExerciseRow, unit: WeightUnit): string {
  const groups: { kg: number | null; reps: number[] }[] = []

  for (const setLog of completedSets(row)) {
    const kg = weightKg(setLog.weight)
    const current = groups[groups.length - 1]
    if (current && current.kg === kg) {
      current.reps.push(setLog.reps)
    } else {
      groups.push({ kg, reps: [setLog.reps] })
    }
  }

  return groups
    .map(({ kg, reps }) => {
      const weight = kg == null ? "BW" : formatWeight(kg, unit)
      return `${weight} × ${reps.join(", ")}`
    })
    .join(" · ")
}

export function entryVolume(row: SessionExerciseRow): number {
  return completedSets(row).reduce(
    (sum, setLog) => sum + (weightKg(setLog.weight) ?? 0) * setLog.reps,
    0
  )
}

export function sessionVolume(session: WorkoutSessionDetail): number {
  return session.exercises.reduce((sum, row) => sum + entryVolume(row), 0)
}

export function sessionSetCount(session: WorkoutSessionDetail): number {
  return session.exercises.reduce(
    (sum, row) => sum + completedSets(row).length,
    0
  )
}

export function formatHeaderDate(session: WorkoutSessionDetail): string {
  const start = new Date(session.startedAt ?? session.createdAt)
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(start)

  const lastCompleted = session.exercises
    .flatMap((row) => completedSets(row))
    .map((setLog) => setLog.completedAt)
    .filter((iso): iso is string => Boolean(iso))
    .sort()
    .at(-1)

  const end = lastCompleted ? new Date(lastCompleted) : null
  const minutes = end
    ? Math.round((end.getTime() - start.getTime()) / 60_000)
    : null
  const recorded =
    minutes != null && minutes >= 1 && minutes <= MAX_SESSION_MINUTES

  return `${WEEKDAYS[start.getDay()]} ${start.getDate()} ${
    MONTHS[start.getMonth()]
  } · ${time}${recorded ? ` · ${minutes} min` : ""}`
}

const MAX_SESSION_MINUTES = 180

export function formatElapsedClock(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }
  return `${m}:${String(s).padStart(2, "0")}`
}

export function formatPriorSet(
  weightKg: number | null,
  reps: number,
  unit: WeightUnit
): string {
  if (weightKg == null) return `BW × ${reps}`
  return `${formatWeight(weightKg, unit, { unit: false })} × ${reps}`
}

export function lastTimeLabel(
  previous: { weightKg: number | null }[] | undefined,
  unit: WeightUnit
): string | null {
  const weight = previous?.[0]?.weightKg
  if (previous == null || previous.length === 0) return null
  return weight == null
    ? "Last time: BW"
    : `Last time: ${formatWeight(weight, unit)}`
}
