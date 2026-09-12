import {
  MUSCLE_GROUP_FILTERS,
  type MuscleGroupFilter,
} from "@/lib/muscle-groups"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "@/lib/session"
import { estimated1rmKg } from "@/lib/units"
import type {
  ActiveWorkout,
  CatalogExercise,
  ExerciseHistoryEntry,
  ExerciseRecord,
  ExerciseRecordLift,
} from "@/types/exercise.types"

const PAGE_SIZE = 20

function weightKg(weight: unknown): number | null {
  if (weight == null || weight === "") return null
  const n = typeof weight === "number" ? weight : Number(weight)
  return Number.isFinite(n) ? n : null
}

const catalogSelect = {
  id: true,
  name: true,
  muscleGroups: true,
} as const

function searchTokens(query?: string) {
  return query?.trim().split(/\s+/).filter(Boolean) ?? []
}

function searchWhere(query?: string) {
  const tokens = searchTokens(query)
  if (tokens.length === 0) return undefined
  return {
    AND: tokens.map((token) => ({
      name: { contains: token, mode: "insensitive" as const },
    })),
  }
}

function parseMuscleGroup(
  value?: string | null
): MuscleGroupFilter | undefined {
  if (!value) return undefined
  return MUSCLE_GROUP_FILTERS.includes(value as MuscleGroupFilter)
    ? (value as MuscleGroupFilter)
    : undefined
}

async function getRecentExercises({
  userId,
  query,
  muscleGroup,
}: {
  userId: string
  query?: string
  muscleGroup?: MuscleGroupFilter
}): Promise<CatalogExercise[]> {
  const rows = await prisma.workoutExercise.findMany({
    where: {
      workoutSession: { userId },
      exercise: {
        ...(searchWhere(query) ?? {}),
        ...(muscleGroup ? { muscleGroups: muscleGroup } : {}),
      },
    },
    orderBy: { workoutSession: { startedAt: "desc" } },
    take: 48,
    select: { exercise: { select: catalogSelect } },
  })

  const seen = new Set<string>()
  const recents: CatalogExercise[] = []
  for (const row of rows) {
    if (seen.has(row.exercise.id)) continue
    seen.add(row.exercise.id)
    recents.push(row.exercise)
    if (recents.length >= 8) break
  }
  return recents
}

function compareLifts(a: ExerciseRecordLift, b: ExerciseRecordLift) {
  if (b.e1rmKg !== a.e1rmKg) return b.e1rmKg - a.e1rmKg
  if (b.weightKg !== a.weightKg) return b.weightKg - a.weightKg
  return b.achievedAt.localeCompare(a.achievedAt)
}

async function getActiveWorkout(
  userId: string,
  exerciseId: string
): Promise<ActiveWorkout | null> {
  const latest = await prisma.workoutSession.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      startedAt: true,
      updatedAt: true,
      exercises: {
        select: {
          exerciseId: true,
          workoutSets: { select: { completedAt: true } },
        },
      },
    },
  })
  if (!latest) return null

  const hasCompleted = latest.exercises.some((row) =>
    row.workoutSets.some((set) => set.completedAt)
  )
  const cutoff = Date.now() - 18 * 60 * 60 * 1000
  const fresh =
    latest.updatedAt.getTime() >= cutoff ||
    (latest.startedAt?.getTime() ?? 0) >= cutoff
  if (hasCompleted && !fresh) return null

  return {
    id: latest.id,
    name: latest.name,
    alreadyAdded: latest.exercises.some((row) => row.exerciseId === exerciseId),
  }
}

// ===== GET =====

export const getAllExercises = async ({
  query,
  cursor,
  muscleGroup,
  commonOnly,
}: {
  query?: string
  cursor?: string
  muscleGroup?: string | null
  commonOnly?: boolean
}) => {
  const session = await getServerSession()
  if (!session) throw new Error("Sign in to browse exercises")

  const muscle = parseMuscleGroup(muscleGroup)
  const searching = searchTokens(query).length > 0
  const restrictCommon = Boolean(commonOnly) && !searching

  const recents = cursor
    ? []
    : await getRecentExercises({
        userId: session.user.id,
        query,
        muscleGroup: muscle,
      })
  const recentIds = recents.map((exercise) => exercise.id)

  const items = await prisma.exercise.findMany({
    where: {
      ...(searchWhere(query) ?? {}),
      ...(muscle ? { muscleGroups: muscle } : {}),
      ...(restrictCommon ? { isCommon: true } : {}),
      ...(recentIds.length > 0 ? { id: { notIn: recentIds } } : {}),
    },
    orderBy: restrictCommon
      ? [{ name: "asc" }, { id: "asc" }]
      : [{ isCommon: "desc" }, { name: "asc" }, { id: "asc" }],
    take: PAGE_SIZE + 1,
    select: catalogSelect,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  })

  const hasMore = items.length > PAGE_SIZE
  const page = hasMore ? items.slice(0, PAGE_SIZE) : items

  return {
    recents,
    items: page,
    nextCursor: hasMore ? page[page.length - 1]?.id : null,
  }
}

export const getExerciseDetail = async (id: string) => {
  const session = await getServerSession()
  if (!session) throw new Error("Sign in to view exercises")

  const exercise = await prisma.exercise.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      shortDemo: true,
      inDepthDemo: true,
      difficulty: true,
      muscleGroups: true,
      primeMoverMuscle: true,
      equipments: true,
      bodyRegion: true,
      mechanics: true,
    },
  })

  if (!exercise) return null

  const rows = await prisma.workoutExercise.findMany({
    where: {
      exerciseId: id,
      workoutSession: { userId: session.user.id },
    },
    orderBy: { workoutSession: { startedAt: "desc" } },
    take: 16,
    select: {
      workoutSessionId: true,
      workoutSession: { select: { name: true, startedAt: true } },
      workoutSets: {
        orderBy: { position: "asc" },
        select: {
          position: true,
          weight: true,
          reps: true,
          completedAt: true,
        },
      },
    },
  })

  const history: ExerciseHistoryEntry[] = []
  for (const row of rows) {
    const sets = row.workoutSets
      .filter((set) => set.completedAt)
      .map((set) => ({
        position: set.position,
        weightKg: weightKg(set.weight),
        reps: set.reps,
      }))
    if (sets.length === 0 || !row.workoutSession.startedAt) continue
    history.push({
      sessionId: row.workoutSessionId,
      sessionName: row.workoutSession.name,
      startedAt: row.workoutSession.startedAt.toISOString(),
      sets,
    })
    if (history.length >= 5) break
  }

  const lifts = await prisma.workoutSet.findMany({
    where: {
      completedAt: { not: null },
      weight: { not: null },
      workoutExercise: {
        exerciseId: id,
        workoutSession: { userId: session.user.id },
      },
    },
    select: {
      weight: true,
      reps: true,
      completedAt: true,
      workoutExercise: { select: { workoutSessionId: true } },
    },
  })

  const candidates: ExerciseRecordLift[] = []
  for (const set of lifts) {
    const kg = weightKg(set.weight)
    if (kg == null || !set.completedAt) continue
    candidates.push({
      sessionId: set.workoutExercise.workoutSessionId,
      weightKg: kg,
      reps: set.reps,
      achievedAt: set.completedAt.toISOString(),
      e1rmKg: estimated1rmKg(kg, set.reps),
    })
  }

  candidates.sort(compareLifts)
  const best = candidates[0] ?? null
  const previous = best
    ? candidates
        .filter((lift) => lift.achievedAt < best.achievedAt)
        .sort(compareLifts)[0] ?? null
    : null

  const record: ExerciseRecord | null = best ? { ...best, previous } : null
  const activeSession = await getActiveWorkout(session.user.id, id)

  return { exercise, history, record, activeSession }
}
