import type { HeatmapDatum } from "@/types/dashboard.types"

/** Instagram story. Capture at 3× → 1080×1920 with 250px safe zones. */
export const SHARE_STORY_WIDTH = 360
export const SHARE_STORY_HEIGHT = 640
export const SHARE_STORY_SAFE_Y = (250 / 1920) * SHARE_STORY_HEIGHT

/** Session + PR now. Grid waits on profiles; 1:1 feed if stories crop badly. */
export const SHARE_VARIANTS = ["session", "pr"] as const
export type ShareVariant = (typeof SHARE_VARIANTS)[number]

export type ShareCardRecord = {
  exerciseName: string
  detail: string
  weightAmount: string
  weightUnit: "kg" | "lb"
  reps: number
  previous: {
    amount: string
    unit: "kg" | "lb"
    reps: number | null
    dateLabel: string | null
  } | null
}

export type ShareCardData = {
  name: string
  dateLabel: string
  durationLabel: string | null
  exerciseCount: number
  setCount: number
  volumeAmount: string
  volumeUnit: "kg" | "lb"
  record: ShareCardRecord | null
  /** 26 weeks × 7 days, column-major (week →, weekday ↓), oldest first. 0–3. */
  heatmap: number[]
  monthsLabel: string
  streakCount: number | null
  streakUnit: "day" | "week" | null
  handle: string | null
}

export type ShareCardExtras = {
  heatmap?: HeatmapDatum[]
  streakCount?: number
  streakUnit?: "day" | "week"
  handle?: string | null
}
