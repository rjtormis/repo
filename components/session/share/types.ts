import type { HeatmapDatum } from "@/types/dashboard.types"

/** Instagram story. Capture at 3× → 1080×1920 with 250px safe zones. */
export const SHARE_STORY_WIDTH = 360
export const SHARE_STORY_HEIGHT = 640
export const SHARE_STORY_SAFE_Y = (250 / 1920) * SHARE_STORY_HEIGHT

/** Session + PR now. Grid waits on profiles; 1:1 feed if stories crop badly. */
export const SHARE_VARIANTS = ["session", "pr"] as const
export type ShareVariant = (typeof SHARE_VARIANTS)[number]

/** Photo stories — four different compositions, not one overlay in four places. */
export const SHARE_PHOTO_LAYOUTS = [
  "dock",
  "split",
  "stamp",
  "billboard",
] as const
export type SharePhotoLayout = (typeof SHARE_PHOTO_LAYOUTS)[number]

export const SHARE_PHOTO_LAYOUT_LABEL: Record<SharePhotoLayout, string> = {
  dock: "Dock",
  split: "Split",
  stamp: "Stamp",
  billboard: "Billboard",
}

/** Sparse heatmaps read as “barely trains.” Hero volume until this many sessions. */
export const SHARE_HEATMAP_MIN_SESSIONS = 10

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
  /** Logged sessions (setCount > 0). Grid shows at SHARE_HEATMAP_MIN_SESSIONS. */
  sessionCount: number
}

export type ShareCardExtras = {
  heatmap?: HeatmapDatum[]
  streakCount?: number
  streakUnit?: "day" | "week"
  handle?: string | null
  sessionCount?: number
}
