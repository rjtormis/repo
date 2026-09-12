"use client"

import {
  addExercisesToSession,
  addWorkoutSet,
  createSession,
  deleteSpecificSession,
  updateSpecificSessionName,
  updateWorkoutSessionStart,
  updateWorkoutSet,
} from "@/actions/sessions"
import type { WorkoutSessionDetail } from "@/types/session.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// ===== GET =====

export const useGetSpecificSession = (id: string) => {
  return useQuery({
    queryKey: ["sessions", id],
    enabled: Boolean(id),
    queryFn: async (): Promise<WorkoutSessionDetail> => {
      const res = await fetch(`/api/v1/sessions/${id}`)
      if (!res.ok) throw new Error("Failed to fetch workout session.")
      return res.json()
    },
  })
}

// ===== CREATE =====

export const useCreateWorkoutSessions = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => createSession(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] })
      qc.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

// ===== ADD =====

export const useAddExerciseToWorkout = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      sessionId,
      exerciseId,
    }: {
      sessionId?: string
      exerciseId: string
    }) => {
      const id = sessionId ?? (await createSession()).id
      await addExercisesToSession({ sessionId: id, exerciseIds: [exerciseId] })
      return id
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ["sessions", id] })
      qc.invalidateQueries({ queryKey: ["exercise"] })
      qc.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export const useAddExercisesToSession = (id: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      exerciseIds,
    }: {
      exerciseIds: string[]
    }): ReturnType<typeof addExercisesToSession> =>
      addExercisesToSession({ sessionId: id, exerciseIds }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions", id] })
      qc.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export const useAddWorkoutSet = (sessionId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      workoutExerciseId,
      weightKg,
      reps,
    }: {
      workoutExerciseId: string
      weightKg: number | null
      reps: number
    }) => addWorkoutSet({ sessionId, workoutExerciseId, weightKg, reps }),
    onSuccess: (next) => {
      if (next) qc.setQueryData(["sessions", sessionId], next)
      qc.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

// ===== UPDATE =====

export const useUpdateWorkoutSet = (sessionId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      setId,
      weightKg,
      reps,
    }: {
      setId: string
      weightKg: number | null
      reps: number
    }) => updateWorkoutSet({ sessionId, setId, weightKg, reps }),
    onSuccess: (next) => {
      if (next) qc.setQueryData(["sessions", sessionId], next)
      qc.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export const useUpdateWorkoutStartedAt = (id: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (
      status: "not_started" | "finished" | "in_progress"
    ): ReturnType<typeof updateWorkoutSessionStart> =>
      updateWorkoutSessionStart({ sessionId: id, status: status }),
    onSuccess: (updated) => {
      qc.setQueryData(
        ["sessions", id],
        (old: WorkoutSessionDetail | undefined) =>
          old && updated
            ? {
                ...old,
                startedAt: updated.startedAt
                  ? new Date(updated.startedAt).toISOString()
                  : old.startedAt,
                endedAt: updated.endedAt
                  ? new Date(updated.endedAt).toISOString()
                  : updated.endedAt === null
                    ? null
                    : old.endedAt,
              }
            : old
      )
      qc.invalidateQueries({ queryKey: ["sessions", id] })
      qc.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export const useRenameSession = (id: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      name,
    }: {
      name: string
    }): ReturnType<typeof updateSpecificSessionName> =>
      updateSpecificSessionName({ sessionId: id, name }),
    onSuccess: () => {
      qc.setQueryData(
        ["sessions", id],
        (old: WorkoutSessionDetail | undefined) => (old ? { ...old } : old)
      )
      qc.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

// ===== DELETE =====

export const useDeleteSpecificSession = (id: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (): ReturnType<typeof deleteSpecificSession> =>
      deleteSpecificSession({ sessionId: id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions", id] })
      qc.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}
