"use server"
import { prisma } from "@/lib/prisma"

export type PersonalRecordLift = {
  sessionId: string
  weightKg: number
  reps: number
  achievedAt: string
}

export type PersonalRecord = {
  exerciseId: string
  exerciseName: string
  weightKg: number
  reps: number
  sessionId: string
  achievedAt: string
  previous: PersonalRecordLift | null
}

function weightKg(weight: unknown): number | null {
  if (weight == null || weight === "") return null
  const n = typeof weight === "number" ? weight : Number(weight)
  return Number.isFinite(n) ? n : null
}

function isBetter(next: PersonalRecordLift, prev: PersonalRecordLift) {
  if (next.weightKg !== prev.weightKg) return next.weightKg > prev.weightKg
  if (next.reps !== prev.reps) return next.reps > prev.reps
  return next.achievedAt > prev.achievedAt
}

// ===== GET =====

export async function getPersonalRecords({
  userId,
}: {
  userId: string
}): Promise<PersonalRecord[]> {
  const sets = await prisma.workoutSet.findMany({
    where: {
      completedAt: { not: null },
      weight: { not: null },
      workoutExercise: {
        workoutSession: { userId },
      },
    },
    select: {
      weight: true,
      reps: true,
      completedAt: true,
      workoutExercise: {
        select: {
          exerciseId: true,
          workoutSessionId: true,
          exercise: { select: { name: true } },
        },
      },
    },
  })

  const byExercise = new Map<
    string,
    { name: string; lifts: PersonalRecordLift[] }
  >()

  for (const set of sets) {
    const kg = weightKg(set.weight)
    const at = set.completedAt
    if (kg == null || !at) continue

    const exerciseId = set.workoutExercise.exerciseId
    const lift: PersonalRecordLift = {
      sessionId: set.workoutExercise.workoutSessionId,
      weightKg: kg,
      reps: set.reps,
      achievedAt: at.toISOString(),
    }
    const current = byExercise.get(exerciseId)
    if (!current) {
      byExercise.set(exerciseId, {
        name: set.workoutExercise.exercise.name,
        lifts: [lift],
      })
      continue
    }
    current.lifts.push(lift)
  }

  const records: PersonalRecord[] = []
  for (const [exerciseId, { name, lifts }] of byExercise) {
    const ranked = [...lifts].sort((a, b) => (isBetter(a, b) ? -1 : 1))
    const best = ranked[0]
    if (!best) continue
    const previous =
      ranked
        .filter((lift) => lift.achievedAt < best.achievedAt)
        .sort((a, b) => (isBetter(a, b) ? -1 : 1))[0] ?? null

    records.push({
      exerciseId,
      exerciseName: name,
      weightKg: best.weightKg,
      reps: best.reps,
      sessionId: best.sessionId,
      achievedAt: best.achievedAt,
      previous,
    })
  }

  return records
    .sort((a, b) => b.achievedAt.localeCompare(a.achievedAt))
    .slice(0, 12)
}
