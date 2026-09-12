"use client"

import type { DashboardStats } from "@/types/dashboard.types"
import { useQuery } from "@tanstack/react-query"

// ===== GET =====

export const useGetDashboardStats = (date: string) => {
  return useQuery({
    queryKey: ["dashboard", date],
    enabled: Boolean(date),
    queryFn: async (): Promise<DashboardStats> => {
      const res = await fetch(`/api/v1/dashboard?date=${date}`)
      if (!res.ok) throw new Error("Failed to load dashboard")
      return res.json()
    },
  })
}
