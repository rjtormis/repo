import type { CSSProperties } from "react"

export const TARGET_DAYS = 183
export const MIN_DAYS = 90
export const CELL_GAP = 3
export const MIN_CELL = 8
export const MAX_CELL = 16
export const WEEK_STARTS_ON = 0 as const
export const PAGE_PAD_X = 24

export const HEAT_LEVELS = [
  "bg-heat-empty",
  "bg-heat-1",
  "bg-heat-2",
  "bg-heat-3",
]

export const HEAT_SWATCH = [
  "var(--heat-empty)",
  "var(--heat-1)",
  "var(--heat-2)",
  "var(--heat-3)",
] as const

export const PAGE_PAD_STYLE: CSSProperties = {
  paddingTop: "max(1.25rem, env(safe-area-inset-top, 0px))",
  paddingInlineStart: `max(${PAGE_PAD_X}px, env(safe-area-inset-inline-start, 0px))`,
  paddingInlineEnd: `max(${PAGE_PAD_X}px, env(safe-area-inset-inline-end, 0px))`,
}
