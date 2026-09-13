import type { HeatmapDatum } from "@/types/dashboard.types"

export type ShareCardRecord = {
  exerciseName: string
  detail: string
}

export type ShareCardData = {
  name: string
  dateLabel: string
  durationLabel: string | null
  exerciseCount: number
  setCount: number
  volumeLabel: string
  record: ShareCardRecord | null
  /** 26 weeks × 7 days, column-major (week →, weekday ↓), oldest first. 0–3. */
  heatmap: number[]
  monthsLabel: string
  streakLabel: string | null
  handle: string | null
}

export type ShareCardExtras = {
  heatmap?: HeatmapDatum[]
  streakCount?: number
  streakUnit?: "day" | "week"
  handle?: string | null
}
