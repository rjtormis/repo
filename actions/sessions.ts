"use server"
import { prisma } from "@/lib/prisma"
import { WorkoutSession } from "@/generated/prisma/client"
import { getServerSession } from "@/lib/session"

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

export const getUserSessions = async ({
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

  // recentSessions: [
  //   {
  //     id: "...",
  //     name: "Upper Body Hypertrophy — Week 3 Deload",
  //     exercises: ["Bench Press", "Overhead Press", "Barbell Row"],
  //     exerciseCount: 8,
  //     setCount: 24,
  //     lastDoneAt: "2026-08-31",
  //   },
  return sessions.map((session) => ({
    id: session.id,
    name: session.name,
    exercises: session.exercises.map((row) => row.exercise.name),
    exerciseCount: session.exercises.length,
    setCount: session.exercises.reduce(
      (sum, row) => sum + row.workoutSets.length,
      0
    ),
    lastDoneAt: session.updatedAt,
  }))
}

export const getSpecificUserSession = async ({
  userId,
  sessionId,
}: {
  userId: string
  sessionId: string
}) => {
  const workouts = await prisma.workoutSession.findFirst({
    where: {
      userId,
      id: sessionId,
    },
    include: {
      exercises: {
        select: {
          exercise: true,
          workoutSets: true,
        },
      },
    },
  })

  return workouts
}
