"use server"

import { WorkoutSession } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "@/lib/session"

function toKg(weight: unknown): number | null {
  if (weight == null || weight === "") return null
  const n = typeof weight === "number" ? weight : Number(weight)
  return Number.isFinite(n) ? n : null
}

function setsVolume(sets: { weight: unknown; reps: number }[]): number {
  return sets.reduce((sum, set) => sum + (toKg(set.weight) ?? 0) * set.reps, 0)
}

const sessionInclude = {
  exercises: {
    orderBy: { position: "asc" as const },
    select: {
      id: true,
      position: true,
      exercise: {
        select: {
          id: true,
          name: true,
        },
      },
      workoutSets: {
        orderBy: { position: "asc" as const },
        select: {
          id: true,
          position: true,
          weight: true,
          reps: true,
          completedAt: true,
        },
      },
    },
  },
}

async function loadSession({
  userId,
  sessionId,
}: {
  userId: string
  sessionId: string
}) {
  return prisma.workoutSession.findFirst({
    where: { userId, id: sessionId },
    include: sessionInclude,
  })
}

async function lastCompletedSetsByExercise({
  userId,
  exerciseIds,
  before,
  excludeSessionId,
}: {
  userId: string
  exerciseIds: string[]
  before: Date
  excludeSessionId: string
}) {
  if (exerciseIds.length === 0) {
    return new Map<
      string,
      {
        startedAt: Date | null
        workoutSets: { weight: unknown; reps: number }[]
      }
    >()
  }

  const priors = await prisma.workoutExercise.findMany({
    where: {
      exerciseId: { in: exerciseIds },
      workoutSession: {
        userId,
        id: { not: excludeSessionId },
        startedAt: { lt: before },
      },
      workoutSets: { some: { completedAt: { not: null } } },
    },
    orderBy: { workoutSession: { startedAt: "desc" } },
    select: {
      exerciseId: true,
      workoutSession: { select: { startedAt: true } },
      workoutSets: {
        where: { completedAt: { not: null } },
        orderBy: { position: "asc" },
        select: { weight: true, reps: true },
      },
    },
  })

  const firstByExercise = new Map<
    string,
    {
      startedAt: Date | null
      workoutSets: { weight: unknown; reps: number }[]
    }
  >()
  for (const row of priors) {
    if (firstByExercise.has(row.exerciseId)) continue
    firstByExercise.set(row.exerciseId, {
      startedAt: row.workoutSession.startedAt,
      workoutSets: row.workoutSets,
    })
  }
  return firstByExercise
}

function pendingSetSeeds(previous: { weight: unknown; reps: number }[]) {
  if (previous.length === 0) {
    return [0, 1, 2].map((position) => ({
      position,
      weight: null as number | null,
      reps: 8,
      completedAt: null,
    }))
  }
  return previous.map((set, position) => ({
    position,
    weight: toKg(set.weight),
    reps: set.reps,
    completedAt: null,
  }))
}

async function seedPendingSets({
  userId,
  sessionId,
  startedAt,
  rows,
}: {
  userId: string
  sessionId: string
  startedAt: Date
  rows: { id: string; exerciseId: string; setCount: number }[]
}) {
  const empty = rows.filter((row) => row.setCount === 0)
  if (empty.length === 0) return

  const priors = await lastCompletedSetsByExercise({
    userId,
    exerciseIds: empty.map((row) => row.exerciseId),
    before: startedAt,
    excludeSessionId: sessionId,
  })

  await prisma.workoutSet.createMany({
    data: empty.flatMap((row) =>
      pendingSetSeeds(priors.get(row.exerciseId)?.workoutSets ?? []).map(
        (set) => ({
          ...set,
          workoutExerciseId: row.id,
        })
      )
    ),
  })
}

async function attachReview(
  session: NonNullable<Awaited<ReturnType<typeof loadSession>>>,
  userId: string
) {
  const exerciseIds = [
    ...new Set(session.exercises.map((row) => row.exercise.id)),
  ]
  const previousByExercise: Record<
    string,
    { weightKg: number; achievedAt: string } | null
  > = Object.fromEntries(exerciseIds.map((id) => [id, null]))
  const previousSetsByExercise: Record<
    string,
    { weightKg: number | null; reps: number }[]
  > = Object.fromEntries(exerciseIds.map((id) => [id, []]))

  if (exerciseIds.length > 0 && session.startedAt !== null) {
    const priors = await lastCompletedSetsByExercise({
      userId,
      exerciseIds,
      before: session.startedAt,
      excludeSessionId: session.id,
    })

    for (const [exerciseId, row] of priors) {
      previousSetsByExercise[exerciseId] = row.workoutSets.map((set) => ({
        weightKg: toKg(set.weight),
        reps: set.reps,
      }))
      let best: { weightKg: number; reps: number } | null = null
      for (const set of row.workoutSets) {
        const kg = toKg(set.weight)
        if (kg == null) continue
        if (
          !best ||
          kg > best.weightKg ||
          (kg === best.weightKg && set.reps > best.reps)
        ) {
          best = { weightKg: kg, reps: set.reps }
        }
      }
      if (!best) continue
      previousByExercise[exerciseId] = {
        weightKg: best.weightKg,
        achievedAt: row.startedAt ? row.startedAt.toISOString() : "",
      }
    }
  }

  const recent = await prisma.workoutSession.findMany({
    where: {
      userId,
      exercises: {
        some: { workoutSets: { some: { completedAt: { not: null } } } },
      },
    },
    orderBy: { startedAt: "desc" },
    take: 8,
    select: {
      id: true,
      exercises: {
        select: {
          workoutSets: {
            where: { completedAt: { not: null } },
            select: { weight: true, reps: true },
          },
        },
      },
    },
  })

  const volumeTrend = [...recent].reverse().map((row) => ({
    sessionId: row.id,
    volume: row.exercises.reduce(
      (sum, entry) => sum + setsVolume(entry.workoutSets),
      0
    ),
  }))

  return { ...session, previousByExercise, previousSetsByExercise, volumeTrend }
}

// ===== GET =====

export const getSessions = async ({
  userId,
  position,
}: {
  userId: string
  position: "asc" | "desc"
}) => {
  const sessions = await prisma.workoutSession.findMany({
    where: {
      userId: userId,
    },
    include: {
      exercises: {
        orderBy: { position: position },
        select: {
          exercise: {
            select: {
              name: true,
            },
          },
          workoutSets: {
            select: {
              id: true,
              completedAt: true,
            },
          },
        },
      },
    },
  })

  return sessions.map((session) => ({
    id: session.id,
    name: session.name,
    exercises: session.exercises.map((row) => row.exercise.name),
    exerciseCount: session.exercises.length,
    setCount: session.exercises.reduce(
      (sum, row) =>
        sum +
        row.workoutSets.filter((set) => set.completedAt != null).length,
      0
    ),
    lastDoneAt: session.startedAt,
  }))
}

export const getSpecificSession = async ({
  userId,
  sessionId,
}: {
  userId: string
  sessionId: string
}) => {
  const session = await loadSession({ userId, sessionId })
  if (!session) return null
  return attachReview(session, userId)
}

// ===== CREATE =====

export const getActiveSession = async (userId: string) => {
  const row = await prisma.workoutSession.findFirst({
    where: { userId, startedAt: { not: null }, endedAt: null },
    orderBy: { startedAt: "desc" },
    select: { id: true, name: true, startedAt: true },
  })
  if (!row?.startedAt) return null
  return {
    id: row.id,
    name: row.name,
    startedAt: row.startedAt.toISOString(),
  }
}

export const createSession = async () => {
  const session = await getServerSession()
  if (!session) throw new Error("Sign in to start a workout")

  const active = await prisma.workoutSession.findFirst({
    where: {
      userId: session.user.id,
      startedAt: { not: null },
      endedAt: null,
    },
    orderBy: { startedAt: "desc" },
  })
  if (active) return active

  return prisma.workoutSession.create({
    data: {
      name: "New workout",
      userId: session.user.id,
      startedAt: new Date(),
    },
  })
}

// ===== ADD =====

export const addExercisesToSession = async ({
  sessionId,
  exerciseIds,
}: {
  sessionId: string
  exerciseIds: string[]
}) => {
  const session = await getServerSession()
  if (!session) throw new Error("Sign in to start a workout")

  const ids = [...new Set(exerciseIds.filter(Boolean))]
  if (ids.length === 0) throw new Error("Pick at least one exercise.")

  const workoutSession = await getSpecificSession({
    userId: session.user.id,
    sessionId,
  })

  if (!workoutSession) {
    throw new Error("Workout session does not exists.")
  }

  const start =
    workoutSession.exercises.reduce(
      (max, row) => Math.max(max, row.position),
      -1
    ) + 1
  const created = await prisma.$transaction(
    ids.map((exerciseId, index) =>
      prisma.workoutExercise.create({
        data: {
          workoutSessionId: sessionId,
          exerciseId,
          position: start + index,
        },
        select: { id: true, exerciseId: true },
      })
    )
  )

  const startedAt = workoutSession.startedAt
  if (startedAt != null && workoutSession.endedAt == null) {
    await seedPendingSets({
      userId: session.user.id,
      sessionId,
      startedAt: new Date(startedAt),
      rows: created.map((row) => ({
        id: row.id,
        exerciseId: row.exerciseId,
        setCount: 0,
      })),
    })
  }

  return getSpecificSession({
    userId: session.user.id,
    sessionId,
  })
}

export const addWorkoutSet = async ({
  sessionId,
  workoutExerciseId,
  weightKg,
  reps,
  completed = true,
}: {
  sessionId: string
  workoutExerciseId: string
  weightKg: number | null
  reps: number
  completed?: boolean
}) => {
  const session = await getServerSession()
  if (!session) throw new Error("Sign in to edit a set")
  if (!Number.isFinite(reps) || reps < 1) {
    throw new Error("Reps must be at least 1.")
  }

  const row = await prisma.workoutExercise.findFirst({
    where: {
      id: workoutExerciseId,
      workoutSessionId: sessionId,
      workoutSession: { userId: session.user.id },
    },
    select: {
      id: true,
      workoutSets: {
        orderBy: { position: "desc" },
        take: 1,
        select: { position: true },
      },
    },
  })
  if (!row) throw new Error("Exercise not found.")

  const position = (row.workoutSets[0]?.position ?? -1) + 1
  await prisma.workoutSet.create({
    data: {
      workoutExerciseId: row.id,
      position,
      weight: weightKg,
      reps: Math.round(reps),
      completedAt: completed ? new Date() : null,
    },
  })

  return getSpecificSession({
    userId: session.user.id,
    sessionId,
  })
}

// ===== UPDATE =====

export const updateWorkoutSet = async ({
  sessionId,
  setId,
  weightKg,
  reps,
}: {
  sessionId: string
  setId: string
  weightKg: number | null
  reps: number
}) => {
  const session = await getServerSession()
  if (!session) throw new Error("Sign in to edit a set")
  if (!Number.isFinite(reps) || reps < 1) {
    throw new Error("Reps must be at least 1.")
  }

  const owned = await prisma.workoutSet.findFirst({
    where: {
      id: setId,
      workoutExercise: {
        workoutSessionId: sessionId,
        workoutSession: { userId: session.user.id },
      },
    },
    select: { id: true },
  })
  if (!owned) throw new Error("Set not found.")

  await prisma.workoutSet.update({
    where: { id: setId },
    data: {
      weight: weightKg,
      reps: Math.round(reps),
    },
  })

  return getSpecificSession({
    userId: session.user.id,
    sessionId,
  })
}

export const completeWorkoutSet = async ({
  sessionId,
  setId,
}: {
  sessionId: string
  setId: string
}) => {
  const session = await getServerSession()
  if (!session) throw new Error("Sign in to edit a set")

  const owned = await prisma.workoutSet.findFirst({
    where: {
      id: setId,
      workoutExercise: {
        workoutSessionId: sessionId,
        workoutSession: { userId: session.user.id },
      },
    },
    select: { id: true, completedAt: true },
  })
  if (!owned) throw new Error("Set not found.")
  if (owned.completedAt) {
    return getSpecificSession({
      userId: session.user.id,
      sessionId,
    })
  }

  await prisma.workoutSet.update({
    where: { id: setId },
    data: { completedAt: new Date() },
  })

  return getSpecificSession({
    userId: session.user.id,
    sessionId,
  })
}

export const updateWorkingWeight = async ({
  sessionId,
  workoutExerciseId,
  weightKg,
}: {
  sessionId: string
  workoutExerciseId: string
  weightKg: number | null
}) => {
  const session = await getServerSession()
  if (!session) throw new Error("Sign in to edit a set")

  const row = await prisma.workoutExercise.findFirst({
    where: {
      id: workoutExerciseId,
      workoutSessionId: sessionId,
      workoutSession: { userId: session.user.id },
    },
    select: { id: true },
  })
  if (!row) throw new Error("Exercise not found.")

  await prisma.workoutSet.updateMany({
    where: { workoutExerciseId: row.id, completedAt: null },
    data: { weight: weightKg },
  })

  return getSpecificSession({
    userId: session.user.id,
    sessionId,
  })
}

export const updateWorkoutSessionStart = async ({
  sessionId,
  status,
}: {
  status: "in_progress" | "finished" | "not_started"
  sessionId: string
}) => {
  const session = await getServerSession()

  if (!session) throw new Error("Sign in to start a workout")

  const workoutSession = await getSpecificSession({
    userId: session.user.id,
    sessionId,
  })

  if (!workoutSession) {
    throw new Error("Workout session does not exists.")
  }

  if (status === "in_progress") {
    await prisma.$transaction([
      prisma.workoutSet.deleteMany({
        where: {
          completedAt: null,
          workoutExercise: { workoutSessionId: sessionId },
        },
      }),
      prisma.workoutSession.update({
        where: { id: sessionId },
        data: { endedAt: new Date() },
      }),
    ])
  } else if (status === "not_started") {
    const startedAt = new Date()
    await prisma.workoutSession.update({
      where: { id: sessionId },
      data: { startedAt },
    })
    await seedPendingSets({
      userId: session.user.id,
      sessionId,
      startedAt,
      rows: workoutSession.exercises.map((row) => ({
        id: row.id,
        exerciseId: row.exercise.id,
        setCount: row.workoutSets.length,
      })),
    })
  }

  return getSpecificSession({
    userId: session.user.id,
    sessionId,
  })
}

export const updateSpecificSessionName = async ({
  sessionId,
  name,
}: {
  sessionId: string
  name: string
}) => {
  const session = await getServerSession()

  if (!session) throw new Error("Sign in to start a workout")

  const workoutSession = await getSpecificSession({
    userId: session.user.id,
    sessionId,
  })

  if (!workoutSession) {
    throw new Error("Workout session does not exists.")
  }

  return await prisma.workoutSession.update({
    where: {
      id: sessionId,
    },
    data: {
      name,
      updatedAt: new Date(),
    },
  })
}

// ===== DELETE =====

export const deleteSpecificSession = async ({
  sessionId,
}: {
  sessionId: string
}): Promise<WorkoutSession> => {
  const session = await getServerSession()

  if (!session) throw new Error("Sign in to start a workout")

  const workoutSession = await getSpecificSession({
    userId: session.user.id,
    sessionId,
  })

  if (!workoutSession) {
    throw new Error("Workout session does not exists.")
  }

  return await prisma.workoutSession.delete({
    where: {
      id: sessionId,
    },
  })
}

export const deleteWorkoutExercise = async ({
  sessionId,
  workoutExerciseId,
}: {
  sessionId: string
  workoutExerciseId: string
}) => {
  const session = await getServerSession()
  if (!session) throw new Error("Sign in to edit a workout")

  const row = await prisma.workoutExercise.findFirst({
    where: {
      id: workoutExerciseId,
      workoutSessionId: sessionId,
      workoutSession: { userId: session.user.id },
    },
    select: { id: true },
  })
  if (!row) throw new Error("Exercise not found.")

  await prisma.workoutExercise.delete({ where: { id: row.id } })

  return getSpecificSession({
    userId: session.user.id,
    sessionId,
  })
}

export const deleteWorkoutSet = async ({
  sessionId,
  setId,
}: {
  sessionId: string
  setId: string
}) => {
  const session = await getServerSession()
  if (!session) throw new Error("Sign in to edit a set")

  const owned = await prisma.workoutSet.findFirst({
    where: {
      id: setId,
      workoutExercise: {
        workoutSessionId: sessionId,
        workoutSession: { userId: session.user.id },
      },
    },
    select: { id: true },
  })
  if (!owned) throw new Error("Set not found.")

  await prisma.workoutSet.delete({ where: { id: owned.id } })

  return getSpecificSession({
    userId: session.user.id,
    sessionId,
  })
}
