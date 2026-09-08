"use client"

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  IconChevronRight,
  IconFlame,
  IconPlus,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  HeatmapCalendar,
  type HeatmapCell,
  type HeatmapDatum,
} from "@/components/heatmap-calendar"
import { NavigationMenu } from "@/components/navigation-menu"
import { cn } from "@/lib/utils"

type SessionCard = {
  id: string
  name: string
  exerciseLabels: string[]
  setCount: number
  daysSinceLast: number
  lastSessionId: string
}

type ActiveSession = {
  id: string
  name: string
  startedAt: number
}

type WeeklyTarget = {
  done: number
  goal: number
  daysLeft: number
}

const TARGET_DAYS = 183 // ~6 months — primary window
const MIN_DAYS = 90
const CELL_GAP = 3
const MIN_CELL = 8
const MAX_CELL = 16
const WEEK_STARTS_ON = 0 as const

const HEAT_LEVELS = ["bg-heat-empty", "bg-heat-1", "bg-heat-2", "bg-heat-3"]

const HEAT_SWATCH = [
  "var(--heat-empty)",
  "var(--heat-1)",
  "var(--heat-2)",
  "var(--heat-3)",
] as const

const PAGE_PAD_X = 24

function addDays(base: Date, n: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}

function startOfDayLocal(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function startOfWeekLocal(d: Date, weekStartsOn: 0 | 1): Date {
  const x = startOfDayLocal(d)
  const day = x.getDay()
  const diff = (day - weekStartsOn + 7) % 7
  x.setDate(x.getDate() - diff)
  return x
}

/** Same week-column count HeatmapCalendar paints for a range. */
function exactWeekColumns(
  end: Date,
  rangeDays: number,
  weekStartsOn: 0 | 1 = WEEK_STARTS_ON
): number {
  const endDay = startOfDayLocal(end)
  const start = addDays(endDay, -(rangeDays - 1))
  const firstWeek = startOfWeekLocal(start, weekStartsOn)
  const totalDays =
    Math.ceil((endDay.getTime() - firstWeek.getTime()) / 86400000) + 1
  return Math.ceil(totalDays / 7)
}

/**
 * Pick a day window that fits at readable cell size.
 * Actual cell pixels come from `fillWidth` flex layout (flush to padding).
 */
function fitHeatmap(
  widthPx: number,
  end: Date | null
): { rangeDays: number; cellSize: number } {
  if (widthPx <= 0) {
    return { rangeDays: TARGET_DAYS, cellSize: 11 }
  }

  let rangeDays = TARGET_DAYS
  const weeksFor = (days: number) =>
    end ? exactWeekColumns(end, days) : Math.ceil(days / 7)

  while (rangeDays > MIN_DAYS) {
    const weeks = Math.max(1, weeksFor(rangeDays))
    const cell = (widthPx - (weeks - 1) * CELL_GAP) / weeks
    if (cell >= MIN_CELL) {
      return {
        rangeDays,
        // Legend swatch size only — grid columns flex to fill
        cellSize: Math.min(MAX_CELL, Math.max(MIN_CELL, Math.round(cell))),
      }
    }
    rangeDays = Math.max(MIN_DAYS, rangeDays - 7)
  }

  const weeks = Math.max(1, weeksFor(rangeDays))
  const cell = (widthPx - (weeks - 1) * CELL_GAP) / weeks
  return {
    rangeDays,
    cellSize: Math.min(MAX_CELL, Math.max(MIN_CELL, Math.round(cell))),
  }
}

function monthsFromDays(days: number): number {
  return Math.max(1, Math.round(days / 30.44))
}

function toDateKey(d: Date): string {
  // Local Y-M-D — matches how the heatmap builds columns
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function formatElapsed(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60_000))
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m}m`
  return `${h}h ${String(m).padStart(2, "0")}m`
}

function formatAgo(days: number): string {
  if (days === 0) return "today"
  if (days === 1) return "1 day ago"
  return `${days} days ago`
}

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function formatHomeDate(d: Date): string {
  const weekday = d.toLocaleDateString(undefined, { weekday: "long" })
  const month = d.toLocaleDateString(undefined, { month: "long" })
  return `${weekday}, ${month} ${d.getDate()}`.toUpperCase()
}

function formatXp(n: number): string {
  return n.toLocaleString() + " XP"
}

const XP_PER_SESSION = 40
const XP_PER_LEVEL = 160

function progressFromSessions(sessions: number) {
  const xp = Math.max(0, sessions) * XP_PER_SESSION
  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  const xpIntoLevel = xp % XP_PER_LEVEL
  return {
    level,
    xpIntoLevel,
    xpToNext: XP_PER_LEVEL - xpIntoLevel,
    nextLevel: level + 1,
    fill: xpIntoLevel / XP_PER_LEVEL,
  }
}

function WeekRing({ done, goal }: { done: number; goal: number }) {
  const size = 108
  const stroke = 7
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = goal <= 0 ? 0 : Math.min(1, done / goal)
  const offset = c * (1 - pct)

  return (
    <div className="flex shrink-0 flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          role="img"
          aria-hidden
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--heat-empty)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--success)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-[1.65rem] leading-none font-semibold tracking-tight tabular-nums">
            {done}
            <span className="text-base font-medium text-muted-foreground">
              /{goal}
            </span>
          </span>
          <span className="mt-1 text-[11px] leading-none text-muted-foreground">
            this week
          </span>
        </div>
      </div>
      <span className="sr-only">{`${done} of ${goal} sessions this week`}</span>
    </div>
  )
}

function exercisePreview(labels: string[]): string {
  const shown = labels.slice(0, 3).join(" · ")
  const remaining = labels.length - 3
  return remaining > 0 ? `${shown}  +${remaining}` : shown
}

function sessionSize(card: SessionCard): string {
  const exerciseLabel =
    card.exerciseLabels.length === 1 ? "exercise" : "exercises"
  const setLabel = card.setCount === 1 ? "set" : "sets"
  return `${card.exerciseLabels.length} ${exerciseLabel} · ${card.setCount} ${setLabel}`
}

/**
 * Rolling activity for `rangeDays`. Sparse (~2×/week with gaps).
 * Count must match the headline number.
 */
function buildRollingActivity(
  today: Date,
  rangeDays: number
): Map<string, number> {
  const map = new Map<string, number>()
  const start = addDays(today, -(rangeDays - 1))

  for (let i = 0; i < rangeDays; i++) {
    const day = addDays(start, i)
    const dow = day.getDay()
    const week = Math.floor(i / 7)

    if (week % 5 === 2) continue

    const trains =
      dow === 1 ||
      dow === 4 ||
      (dow === 3 && week % 3 === 0) ||
      (dow === 6 && week % 4 === 0)
    if (!trains) continue

    const intensity = (1 + ((week + dow) % 3)) as 1 | 2 | 3
    map.set(toDateKey(day), intensity)
  }

  const gapStart = addDays(today, -28)
  for (let i = 0; i < 10; i++) {
    map.delete(toDateKey(addDays(gapStart, i)))
  }

  return map
}

function weekStreakFromActivity(
  today: Date,
  activity: Map<string, number>
): number {
  let streak = 0
  const cursor = new Date(today)
  cursor.setHours(12, 0, 0, 0)

  for (let w = 0; w < 52; w++) {
    let hit = false
    for (let d = 0; d < 7; d++) {
      if ((activity.get(toDateKey(addDays(cursor, -d - w * 7))) ?? 0) > 0) {
        hit = true
        break
      }
    }
    if (!hit) break
    streak += 1
  }
  return streak
}

function orderPickupCards(cards: SessionCard[]): SessionCard[] {
  if (cards.length === 0) return []
  const sorted = [...cards].sort((a, b) => b.daysSinceLast - a.daysSinceLast)
  const [suggested, ...rest] = sorted
  rest.sort((a, b) => a.daysSinceLast - b.daysSinceLast)
  return [suggested, ...rest].slice(0, 3)
}

const MOCK_CARDS: SessionCard[] = [
  {
    id: "card-legs",
    name: "Upper Body Hypertrophy — Week 3 Deload",
    exerciseLabels: [
      "Bench Press",
      "Overhead Press",
      "Barbell Row",
      "Pull-Up",
      "Incline Dumbbell Press",
      "Lateral Raise",
      "Barbell Curl",
      "Tricep Pushdown",
    ],
    setCount: 24,
    daysSinceLast: 9,
    lastSessionId: "ses-3",
  },
  {
    id: "card-push",
    name: "Push",
    exerciseLabels: ["Bench Press", "Overhead Press", "Dips"],
    setCount: 12,
    daysSinceLast: 1,
    lastSessionId: "ses-1",
  },
  {
    id: "card-pull",
    name: "Pull",
    exerciseLabels: ["Barbell Row", "Pull-Up", "Barbell Curl"],
    setCount: 11,
    daysSinceLast: 3,
    lastSessionId: "ses-2",
  },
]

const pagePadStyle: CSSProperties = {
  paddingTop: "max(1.25rem, env(safe-area-inset-top, 0px))",
  paddingInlineStart: `max(${PAGE_PAD_X}px, env(safe-area-inset-inline-start, 0px))`,
  paddingInlineEnd: `max(${PAGE_PAD_X}px, env(safe-area-inset-inline-end, 0px))`,
}

export function HomeScreen() {
  const router = useRouter()
  const heatMeasureRef = useRef<HTMLDivElement>(null)
  const [now] = useState(() => Date.now())
  // Defer calendar math until mount so SSR HTML matches the client clock/locale
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [clock, setClock] = useState<Date | null>(null)
  const [fit, setFit] = useState({ rangeDays: TARGET_DAYS, cellSize: 11 })
  const [activeSession] = useState<ActiveSession | null>(null)
  const [cards] = useState<SessionCard[]>(MOCK_CARDS)
  const [weekly] = useState<WeeklyTarget>({ done: 3, goal: 5, daysLeft: 4 })

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const nowLocal = new Date()
      setClock(nowLocal)
      const today = new Date(nowLocal)
      today.setHours(12, 0, 0, 0)
      setEndDate(today)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  useLayoutEffect(() => {
    const el = heatMeasureRef.current
    if (!el) return
    const update = () => {
      const next = fitHeatmap(el.clientWidth, endDate)
      setFit((prev) =>
        prev.rangeDays === next.rangeDays && prev.cellSize === next.cellSize
          ? prev
          : next
      )
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [endDate])

  const { heatData, sessionCount, weekStreak } = useMemo(() => {
    if (!endDate) {
      return { heatData: [] as HeatmapDatum[], sessionCount: 0, weekStreak: 0 }
    }
    const activity = buildRollingActivity(endDate, fit.rangeDays)
    const heatData: HeatmapDatum[] = [...activity.entries()].map(
      ([date, intensity]) => ({ date, value: intensity })
    )
    return {
      heatData,
      sessionCount: activity.size,
      weekStreak: weekStreakFromActivity(endDate, activity),
    }
  }, [endDate, fit.rangeDays])

  const emptyMode = cards.length === 0
  const pickupCards = useMemo(() => orderPickupCards(cards), [cards])
  const displayData = useMemo(
    () => (emptyMode ? [] : heatData),
    [emptyMode, heatData]
  )
  const displaySessions = emptyMode || !endDate ? 0 : sessionCount
  const displayStreak = emptyMode || !endDate ? 0 : weekStreak
  const heatReady = endDate !== null
  const monthsShown = monthsFromDays(fit.rangeDays)
  const weekDone = emptyMode ? 0 : weekly.done
  const weekGoal = weekly.goal
  const level = progressFromSessions(displaySessions)
  const greeting = clock ? greetingForHour(clock.getHours()) : null
  const dateLabel = clock ? formatHomeDate(clock) : null

  function startWorkout() {
    router.push(`/workout/live-${Date.now().toString(36)}`)
  }

  function resumeWorkout() {
    if (!activeSession) return
    router.push(`/workout/${activeSession.id}`)
  }

  function onCellClick(cell: HeatmapCell) {
    if (cell.value <= 0 || cell.disabled || cell.future) return
    const ids = ["ses-1", "ses-2", "ses-3"] as const
    router.push(`/session/${ids[cell.date.getDate() % ids.length]}`)
  }

  const cta = activeSession ? (
    <Button
      size="lg"
      className="h-12 min-h-11 w-full flex-col gap-0.5 py-2 text-base"
      onClick={resumeWorkout}
    >
      <span>Resume workout</span>
      <span className="font-mono text-xs font-normal tabular-nums opacity-90">
        {activeSession.name}
        {" · "}
        {formatElapsed(now - activeSession.startedAt)}
      </span>
    </Button>
  ) : (
    <Button
      size="lg"
      className="h-12 min-h-11 w-full text-base"
      onClick={startWorkout}
    >
      <IconPlus data-icon="inline-start" className="size-5" stroke={1.5} />
      Start workout
    </Button>
  )

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-lg min-w-0 bg-background">
      <div
        className={cn(
          "flex min-w-0 flex-col overflow-x-hidden",
          !emptyMode && "pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))]"
        )}
        style={pagePadStyle}
      >
        <header className="mb-5">
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            {dateLabel ?? "\u00a0"}
          </p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <h1 className="min-w-0 text-[1.75rem] leading-tight font-semibold tracking-tight">
              {greeting ?? "\u00a0"}
            </h1>
            <NavigationMenu />
          </div>
        </header>

        <section className="mb-6 rounded-3xl bg-surface-1 p-5">
          {displayStreak > 0 ? (
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-bg-success px-2.5 py-1 text-[12px] font-medium text-text-success">
              <IconFlame className="size-3.5" stroke={1.75} aria-hidden />
              <span className="font-mono tabular-nums">{displayStreak}</span>
              {" week streak"}
            </p>
          ) : null}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 pt-0.5">
              <h2 className="text-[1.65rem] leading-[1.15] font-semibold tracking-tight">
                Make today <span className="text-success">count.</span>
              </h2>
              <p className="mt-3 font-mono text-2xl leading-none font-semibold tracking-tight tabular-nums">
                {heatReady ? displaySessions : "\u00a0"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {displaySessions === 1 ? "session done" : "sessions done"}
              </p>
            </div>
            <WeekRing done={weekDone} goal={weekGoal} />
          </div>
          <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
            <p className="shrink-0 font-mono text-sm tabular-nums">
              Lv {level.level}
            </p>
            <div
              className="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-heat-empty"
              role="progressbar"
              aria-valuenow={level.xpIntoLevel}
              aria-valuemin={0}
              aria-valuemax={XP_PER_LEVEL}
              aria-label={`Level ${level.level}, ${formatXp(level.xpToNext)} to level ${level.nextLevel}`}
            >
              <div
                className="h-full rounded-full bg-success"
                style={{ width: `${Math.min(100, level.fill * 100)}%` }}
              />
            </div>
            <p className="shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
              {formatXp(level.xpToNext)}
            </p>
          </div>
        </section>

        <section
          aria-label={`Training last ${monthsShown} months`}
          className="mb-6 min-w-0"
          dir="ltr"
        >
          {/* overflow-hidden keeps the grid inside page padding — never edge-bleed */}
          <div
            ref={heatMeasureRef}
            className="w-full max-w-full min-w-0 overflow-hidden"
          >
            {heatReady ? (
              <div className="flex w-full max-w-full flex-col overflow-hidden">
                <HeatmapCalendar
                  data={displayData}
                  rangeDays={fit.rangeDays}
                  endDate={endDate}
                  weekStartsOn={WEEK_STARTS_ON}
                  cellSize={fit.cellSize}
                  cellGap={CELL_GAP}
                  fillWidth
                  axisLabels={{ showWeekdays: false, showMonths: true }}
                  legend={false}
                  levelClassNames={HEAT_LEVELS}
                  getLevel={(value) => {
                    if (value <= 0) return 0
                    return Math.min(3, Math.round(value))
                  }}
                  onCellClick={onCellClick}
                  renderTooltip={(cell) => {
                    if (cell.disabled) return "Outside range"
                    if (cell.future) return "Upcoming"
                    if (cell.value <= 0) return `${cell.label}: no sessions`
                    return (
                      <div className="text-sm">
                        <div className="font-medium">1 session</div>
                        <div className="text-muted-foreground">
                          {cell.label}
                        </div>
                      </div>
                    )
                  }}
                  className="max-w-full overflow-hidden"
                />
                <div className="mt-2 flex items-center justify-end gap-1.5 text-xs text-foreground/55">
                  <span>less</span>
                  {HEAT_SWATCH.map((color, i) => (
                    <span
                      key={color}
                      className="inline-block rounded-xs"
                      style={{
                        width: fit.cellSize,
                        height: fit.cellSize,
                        backgroundColor: color,
                        boxShadow:
                          i === 0
                            ? "inset 0 0 0 1px color-mix(in oklab, var(--foreground) 18%, transparent)"
                            : undefined,
                      }}
                      aria-hidden
                    />
                  ))}
                  <span>more</span>
                </div>
                <p className="mt-1 text-end text-[11px] leading-none text-foreground/45">
                  Volume per day · tap a day to see that session
                </p>
              </div>
            ) : (
              <div
                className="w-full"
                style={{ height: 16 + 7 * 11 + 6 * CELL_GAP }}
                aria-hidden
              />
            )}
          </div>
        </section>

        {!emptyMode && pickupCards.length > 0 ? (
          <section className="mb-2">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm text-muted-foreground">
                Pick up where you left off
              </h2>
              <span className="shrink-0 rounded-full bg-surface-2 px-2 py-1 font-mono text-[11px] text-secondary-foreground tabular-nums">
                {pickupCards.length}{" "}
                {pickupCards.length === 1 ? "workout" : "workouts"}
              </span>
            </div>
            <ul className="space-y-2.5">
              {pickupCards.map((card, index) => {
                const isSuggested = index === 0
                return (
                  <li key={card.id}>
                    <Link
                      href={
                        isSuggested
                          ? `/workout/live-${card.id}`
                          : `/session/${card.lastSessionId}`
                      }
                      className={cn(
                        "flex min-h-11 flex-col gap-1 rounded-xl bg-surface-1 px-3.5 py-3.5 transition-colors",
                        "hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        isSuggested
                          ? "ring-2 ring-primary ring-inset"
                          : "ring-0"
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <h3
                          className="min-w-0 flex-1 truncate text-base font-medium"
                          title={card.name}
                        >
                          {card.name}
                        </h3>
                        <IconChevronRight
                          className={cn(
                            "size-5 shrink-0 rtl:rotate-180",
                            isSuggested
                              ? "text-primary"
                              : "text-muted-foreground"
                          )}
                          stroke={1.5}
                          aria-hidden
                        />
                      </div>
                      <p
                        className="min-w-0 truncate font-mono text-xs text-muted-foreground"
                        title={card.exerciseLabels.join(" · ")}
                      >
                        {exercisePreview(card.exerciseLabels)}
                      </p>
                      <div className="mt-1 flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
                        <span className="min-w-0 truncate font-mono tabular-nums">
                          {sessionSize(card)}
                        </span>
                        <span className="shrink-0 font-mono tabular-nums">
                          {formatAgo(card.daysSinceLast)}
                        </span>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ) : null}

        {emptyMode ? (
          <div className="flex flex-1 flex-col justify-center py-8">{cta}</div>
        ) : null}
      </div>

      {!emptyMode ? (
        <div className="fixed inset-x-0 bottom-0 z-10 bg-background">
          <div
            className="mx-auto w-full max-w-lg border-t border-border pt-3"
            style={{
              paddingInlineStart: `max(${PAGE_PAD_X}px, env(safe-area-inset-inline-start, 0px))`,
              paddingInlineEnd: `max(${PAGE_PAD_X}px, env(safe-area-inset-inline-end, 0px))`,
              paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
            }}
          >
            {cta}
          </div>
        </div>
      ) : null}
    </div>
  )
}
