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

  if (exerciseIds.length > 0 && session.startedAt !== null) {
    const priors = await prisma.workoutExercise.findMany({
      where: {
        exerciseId: { in: exerciseIds },
        workoutSession: {
          userId,
          id: { not: session.id },
          startedAt: { lt: session.startedAt },
        },
        workoutSets: { some: { completedAt: { not: null } } },
      },
      orderBy: { workoutSession: { startedAt: "desc" } },
      select: {
        exerciseId: true,
        workoutSession: { select: { startedAt: true } },
        workoutSets: {
          where: { completedAt: { not: null } },
          select: { weight: true, reps: true },
        },
      },
    })

    for (const row of priors) {
      if (previousByExercise[row.exerciseId]) continue
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
      previousByExercise[row.exerciseId] = {
        weightKg: best.weightKg,
        achievedAt: row.workoutSession.startedAt
          ? row.workoutSession.startedAt.toISOString()
          : "",
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

  return { ...session, previousByExercise, volumeTrend }
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
      (sum, row) => sum + row.workoutSets.length,
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

export const createSession = async () => {
  const session = await getServerSession()
  if (!session) throw new Error("Sign in to start a workout")
  return await prisma.workoutSession.create({
    data: {
      name: "New workout",
      userId: session.user.id,
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

  const start = workoutSession.exercises.length
  await prisma.workoutExercise.createMany({
    data: ids.map((exerciseId, index) => ({
      workoutSessionId: sessionId,
      exerciseId,
      position: start + index,
    })),
  })

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
}: {
  sessionId: string
  workoutExerciseId: string
  weightKg: number | null
  reps: number
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
      completedAt: new Date(),
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

  switch (status) {
    case "in_progress":
      return await prisma.workoutSession.update({
        where: { id: sessionId },
        data: { endedAt: new Date() },
      })
    case "not_started":
      return await prisma.workoutSession.update({
        where: {
          id: sessionId,
        },
        data: {
          startedAt: new Date(),
        },
      })
  }
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
