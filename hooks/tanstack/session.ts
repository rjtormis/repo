"use client"

import {
  addExercisesToSession,
  addWorkoutSet,
  completeWorkoutSet,
  createSession,
  deleteSpecificSession,
  deleteWorkoutExercise,
  deleteWorkoutSet,
  restoreWorkoutExercise,
  updateSpecificSessionName,
  updateWorkingWeight,
  updateWorkoutSessionStart,
  updateWorkoutSet,
} from "@/actions/sessions"
import type { SessionCard } from "@/components/home/types"
import type { WorkoutSessionDetail } from "@/types/session.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// ===== GET =====

export const useGetSessions = () => {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: async (): Promise<SessionCard[]> => {
      const res = await fetch("/api/v1/sessions")
      if (!res.ok) throw new Error("Failed to fetch sessions.")
      return res.json()
    },
  })
}

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
      exercises,
    }: {
      exercises: { id: string; name: string }[]
    }): ReturnType<typeof addExercisesToSession> =>
      addExercisesToSession({
        sessionId: id,
        exerciseIds: exercises.map((e) => e.id),
      }),
    onSuccess: (next) => {
      if (next) qc.setQueryData(["sessions", id], next)
      qc.invalidateQueries({ queryKey: ["sessions", id] })
      qc.invalidateQueries({ queryKey: ["dashboard"] })
    },
    onSettled: (next) => {
      if (next) qc.setQueryData(["sessions", id], next)

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
      completed,
    }: {
      workoutExerciseId: string
      weightKg: number | null
      reps: number
      completed?: boolean
    }) =>
      addWorkoutSet({
        sessionId,
        workoutExerciseId,
        weightKg,
        reps,
        completed,
      }),
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
    onSuccess: (next) => {
      if (next) qc.setQueryData(["sessions", id], next)
      qc.invalidateQueries({ queryKey: ["sessions", id] })
      qc.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export const useCompleteWorkoutSet = (sessionId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ setId }: { setId: string }) =>
      completeWorkoutSet({ sessionId, setId }),
    onSuccess: (next) => {
      if (next) qc.setQueryData(["sessions", sessionId], next)
      qc.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export const useUpdateWorkingWeight = (sessionId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      workoutExerciseId,
      weightKg,
    }: {
      workoutExerciseId: string
      weightKg: number | null
    }) => updateWorkingWeight({ sessionId, workoutExerciseId, weightKg }),
    onSuccess: (next) => {
      if (next) qc.setQueryData(["sessions", sessionId], next)
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

export const useDeleteWorkoutExercise = (sessionId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ workoutExerciseId }: { workoutExerciseId: string }) =>
      deleteWorkoutExercise({ sessionId, workoutExerciseId }),
    onSuccess: (next) => {
      if (next) qc.setQueryData(["sessions", sessionId], next)
      qc.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export const useDeleteWorkoutSet = (sessionId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ setId }: { setId: string }) =>
      deleteWorkoutSet({ sessionId, setId }),
    onSuccess: (next) => {
      if (next) qc.setQueryData(["sessions", sessionId], next)
      qc.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export const useRestoreWorkoutExercise = (sessionId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      exerciseId,
      sets,
    }: {
      exerciseId: string
      sets: { weightKg: number | null; reps: number; completed: boolean }[]
    }) => restoreWorkoutExercise({ sessionId, exerciseId, sets }),
    onSuccess: (next) => {
      if (next) qc.setQueryData(["sessions", sessionId], next)
      qc.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

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
