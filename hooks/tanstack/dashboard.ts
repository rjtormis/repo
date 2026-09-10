"use client"
import { HeatmapDatum } from "@/components/heatmap-calendar"
import { useQuery } from "@tanstack/react-query"

type DashboardStats = {
  motivation: { lead: string; accent: string; author: string | null }
  sessions: { total: number; thisWeek: number; weeklyTarget: number }
  streak: { unit: "day" | "week"; count: number }
  level: { current: number; xpIntoLevel: number; xpForNextLevel: number }
  recentSessions: {
    id: string
    name: string
    exercises: string[]
    exerciseCount: number
    setCount: number
    lastDoneAt: string
  }[]
  heatmap: HeatmapDatum[]
}

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
