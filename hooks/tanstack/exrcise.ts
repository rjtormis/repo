"use client"

import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query"
import type {
  ExerciseDetailPayload,
  ExercisePage,
} from "@/types/exercise.types"

// ===== GET =====

export const useGetExercises = ({
  query,
  muscleGroup,
  commonOnly,
  enabled = true,
}: {
  query: string
  muscleGroup: string
  commonOnly: boolean
  enabled?: boolean
}) => {
  return useInfiniteQuery({
    queryKey: ["exercises", query, muscleGroup, commonOnly],
    enabled,
    queryFn: async ({ pageParam }): Promise<ExercisePage> => {
      const params = new URLSearchParams()
      if (query) params.set("query", query)
      if (muscleGroup) params.set("muscleGroup", muscleGroup)
      if (!commonOnly) params.set("commonOnly", "0")
      if (pageParam) params.set("cursor", pageParam)

      const res = await fetch(`/api/v1/exercises?${params}`)
      if (!res.ok) throw new Error("Failed to fetch exercises.")
      return res.json()
    },
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
    placeholderData: keepPreviousData,
  })
}

export const useGetExercise = (id: string) => {
  return useQuery({
    queryKey: ["exercise", id],
    enabled: Boolean(id),
    queryFn: async (): Promise<ExerciseDetailPayload> => {
      const res = await fetch(`/api/v1/exercises/${id}`)
      if (res.status === 404) throw new Error("Exercise not found.")
      if (!res.ok) throw new Error("Failed to fetch exercise.")
      return res.json()
    },
  })
}
