export type HeatmapDatum = {
  date: string | Date
  value: number
  meta?: unknown
}

export type DashboardMotivation = {
  lead: string
  accent: string
  author: string | null
}

export type DashboardSessions = {
  total: number
  thisWeek: number
  weeklyTarget: number
}

export type DashboardStreak = {
  unit: "day" | "week"
  count: number
}

export type DashboardLevel = {
  current: number
  xpIntoLevel: number
  xpForNextLevel: number
}

export type DashboardRecentSession = {
  id: string
  name: string
  exercises: string[]
  exerciseCount: number
  setCount: number
  lastDoneAt: string | Date | null
}

export type DashboardRecord = {
  exerciseId: string
  exerciseName: string
  weightKg: number
  reps: number
  sessionId: string
  achievedAt: string
  previous: {
    sessionId: string
    weightKg: number
    reps: number
    achievedAt: string
  } | null
}

export type DashboardActiveSession = {
  id: string
  name: string
  startedAt: string
}

export type DashboardStats = {
  motivation: DashboardMotivation
  sessions: DashboardSessions
  streak: DashboardStreak
  level: DashboardLevel
  recentSessions: DashboardRecentSession[]
  heatmap: HeatmapDatum[]
  records: DashboardRecord[]
  activeSession: DashboardActiveSession | null
}
