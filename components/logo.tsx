import { cn } from "@/lib/utils"

/**
 * Logomark: a compact contribution heatmap.
 * Product truth — consistency-as-history is the share hook and differentiator
 * vs program-based trackers. Not gym hardware, not isometric SaaS cubes.
 *
 * Grid is column-major (weeks →, weekdays ↓), older → newer left → right.
 * Intensity uses the app heat ramp. Empty cells stay visible (never guilt-red).
 */

const CELL = 3.2
const GAP = 1.2
const COLS = 5
const ROWS = 7
const RADIUS = 0.7

/** 0 empty … 3 densest — organic streak, denser toward recent weeks */
const PATTERN: number[][] = [
  // week 0 (oldest)
  [0, 1, 0, 1, 0, 0, 1],
  [0, 0, 2, 1, 0, 1, 0],
  [1, 2, 1, 0, 2, 1, 0],
  [0, 2, 3, 2, 1, 0, 2],
  [1, 3, 2, 3, 2, 1, 2], // newest
]

/** Light UI mark */
const FILL_LIGHT = [
  "currentColor", // empty — muted via opacity
  "#73CCCC",
  "#39B3B3",
  "#008080",
] as const

/** Mark on #0A192F */
const FILL_NAVY = [
  "#153048",
  "#39B3B3",
  "#73CCCC",
  "#E0FFFF",
] as const

const VIEW_W = COLS * CELL + (COLS - 1) * GAP
const VIEW_H = ROWS * CELL + (ROWS - 1) * GAP
const VIEW = `0 0 ${VIEW_W} ${VIEW_H}`

export function LogoMark({
  className,
  title = "Repo",
  onNavy = false,
}: {
  className?: string
  title?: string
  onNavy?: boolean
}) {
  const fills = onNavy ? FILL_NAVY : FILL_LIGHT

  return (
    <svg
      viewBox={VIEW}
      className={cn("size-8 shrink-0 text-muted", className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      {PATTERN.map((week, c) =>
        week.map((level, r) => {
          const x = c * (CELL + GAP)
          const y = r * (CELL + GAP)
          const empty = level === 0
          return (
            <rect
              key={`${c}-${r}`}
              x={x}
              y={y}
              width={CELL}
              height={CELL}
              rx={RADIUS}
              fill={fills[level]}
              opacity={empty && !onNavy ? 0.35 : 1}
            />
          )
        })
      )}
    </svg>
  )
}

/** Mark + geometric mono wordmark */
export function Logo({
  className,
  markClassName,
  wordmark = true,
  onNavy = false,
}: {
  className?: string
  markClassName?: string
  wordmark?: boolean
  onNavy?: boolean
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5",
        onNavy && "rounded-md bg-[#0A192F] px-3 py-2",
        className
      )}
    >
      <LogoMark className={markClassName} onNavy={onNavy} />
      {wordmark ? (
        <span
          className={cn(
            "font-mono text-lg font-bold tracking-tight",
            onNavy ? "text-white" : "text-foreground"
          )}
        >
          Repo
        </span>
      ) : null}
    </div>
  )
}
