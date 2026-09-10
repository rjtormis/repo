"use client"
import { createSession } from "@/actions/sessions"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useGetWorkoutSessions = () => {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: () => {},
  })
}

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

export const useGetSpecificUserSession = (id: string) => {
  return useQuery({
    queryKey: ["sessions", id],
    enabled: Boolean(id),
    queryFn: async (): Promise<any> => {
      const res = await fetch(`/api/v1/sessions/${id}`)
      if (!res.ok) throw new Error("Failed to fetch workout session.")
      return res.json()
    },
  })
}
