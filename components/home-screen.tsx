"use client"

import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  IconBarbell,
  IconPlus,
  IconPlayerPlayFilled,
  IconSettings,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  HeatmapCalendar,
  type HeatmapCell,
  type HeatmapDatum,
} from "@/components/heatmap-calendar"
import { cn } from "@/lib/utils"

type SessionCard = {
  id: string
  name: string
  exerciseLabels: string[]
  volumeKg: number
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

type HeatFit = {
  rangeDays: number
  cellSize: number
  cellGap: number
}

const HEAT_LEVELS = ["bg-muted", "bg-heat-1", "bg-heat-2", "bg-heat-3"]

/** Weekday label column width inside HeatmapCalendar when axisLabels is on */
const AXIS_LABEL_WIDTH = 44

const PAGE_PAD_X = 24 // matches px-6

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function addDays(base: Date, n: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}

function formatElapsed(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60_000))
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m}m`
  return `${h}h ${String(m).padStart(2, "0")}m`
}

function formatVolume(kg: number): string {
  return `${kg.toLocaleString()} kg`
}

function formatAgo(days: number): string {
  if (days === 0) return "today"
  if (days === 1) return "1 day ago"
  return `${days} days ago`
}

function buildYearActivity(today: Date): Map<string, number> {
  const map = new Map<string, number>()
  const start = addDays(today, -364)

  for (let i = 0; i < 365; i++) {
    const day = addDays(start, i)
    const dow = day.getDay()
    const week = Math.floor(i / 7)
    const trains =
      dow === 1 ||
      dow === 3 ||
      dow === 5 ||
      (dow === 6 && week % 2 === 0)
    if (!trains) continue
    const intensity = (1 + ((week + dow) % 3)) as 1 | 2 | 3
    map.set(toDateKey(day), intensity)
  }

  const gapStart = addDays(today, -48)
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

/**
 * Pick how many days of heatmap fit the content width without horizontal scroll.
 * Prefers whole weeks; bumps cell size down slightly on very narrow screens.
 */
function fitHeatmap(contentWidth: number): HeatFit {
  let cellSize = 12
  let cellGap = 3

  if (contentWidth < 320) {
    cellSize = 10
    cellGap = 2
  } else if (contentWidth < 360) {
    cellSize = 11
    cellGap = 3
  }

  const usable = Math.max(0, contentWidth - AXIS_LABEL_WIDTH)
  const weeks = Math.floor((usable + cellGap) / (cellSize + cellGap))
  // Keep a readable band: 8–26 weeks (≈2–6 months)
  const clampedWeeks = Math.min(26, Math.max(8, weeks))

  return {
    rangeDays: clampedWeeks * 7,
    cellSize,
    cellGap,
  }
}

const MOCK_CARDS: SessionCard[] = [
  {
    id: "card-legs",
    name: "Legs",
    exerciseLabels: ["squat", "rdl", "leg press"],
    volumeKg: 12480,
    daysSinceLast: 9,
    lastSessionId: "ses-3",
  },
  {
    id: "card-push",
    name: "Push",
    exerciseLabels: ["bench", "ohp", "dips"],
    volumeKg: 8320,
    daysSinceLast: 1,
    lastSessionId: "ses-1",
  },
  {
    id: "card-pull",
    name: "Pull",
    exerciseLabels: ["row", "pull-up", "curl"],
    volumeKg: 6540,
    daysSinceLast: 3,
    lastSessionId: "ses-2",
  },
]

const pagePadStyle: CSSProperties = {
  paddingTop: "max(1.25rem, env(safe-area-inset-top, 0px))",
  paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
  paddingInlineStart: `max(${PAGE_PAD_X}px, env(safe-area-inset-inline-start, 0px))`,
  paddingInlineEnd: `max(${PAGE_PAD_X}px, env(safe-area-inset-inline-end, 0px))`,
}

export function HomeScreen() {
  const router = useRouter()
  const heatSectionRef = useRef<HTMLElement>(null)
  const [now] = useState(() => Date.now())
  const [activeSession] = useState<ActiveSession | null>(null)
  const [cards] = useState<SessionCard[]>(MOCK_CARDS)
  const [weekly] = useState<WeeklyTarget>({ done: 3, goal: 5, daysLeft: 4 })
  const [heatFit, setHeatFit] = useState<HeatFit>({
    rangeDays: 84,
    cellSize: 12,
    cellGap: 3,
  })

  useLayoutEffect(() => {
    const el = heatSectionRef.current
    if (!el) return

    const measure = () => {
      const width = el.clientWidth
      if (width <= 0) return
      setHeatFit(fitHeatmap(width))
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { heatData, sessionsInRange, weekStreak, endDate } = useMemo(() => {
    const today = new Date(now)
    today.setHours(12, 0, 0, 0)
    const activity = buildYearActivity(today)
    const rangeStart = addDays(today, -(heatFit.rangeDays - 1))
    const heatData: HeatmapDatum[] = [...activity.entries()].map(
      ([date, intensity]) => ({ date, value: intensity })
    )
    let sessionsInRange = 0
    for (const [date] of activity) {
      const d = new Date(`${date}T12:00:00`)
      if (d >= rangeStart && d <= today) sessionsInRange += 1
    }
    return {
      heatData,
      sessionsInRange,
      weekStreak: weekStreakFromActivity(today, activity),
      endDate: today,
    }
  }, [now, heatFit.rangeDays])

  const emptyMode = cards.length === 0
  const pickupCards = useMemo(() => orderPickupCards(cards), [cards])
  const displayData = useMemo(
    () => (emptyMode ? [] : heatData),
    [emptyMode, heatData]
  )
  const displaySessions = emptyMode ? 0 : sessionsInRange
  const displayStreak = emptyMode ? 0 : weekStreak

  function startWorkout() {
    router.push(`/workout/live-${Date.now().toString(36)}`)
  }

  function resumeWorkout() {
    if (!activeSession) return
    router.push(`/workout/${activeSession.id}`)
  }

  function onCellClick(cell: HeatmapCell) {
    if (cell.value <= 0 || cell.disabled || cell.future) return
    const match = pickupCards[0]
    if (match) router.push(`/session/${match.lastSessionId}`)
  }

  const cta = activeSession ? (
    <Button
      size="lg"
      className="h-12 min-h-11 w-full flex-col gap-0.5 py-2 text-base"
      onClick={resumeWorkout}
    >
      <span>Resume workout</span>
      <span className="font-mono text-xs font-normal opacity-90 tabular-nums">
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
      <IconPlus data-icon="inline-start" className="size-4" />
      Start workout
    </Button>
  )

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-lg bg-background">
      <div
        className={cn("flex flex-col", !emptyMode && "pb-24")}
        style={pagePadStyle}
      >
        <header className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-lg font-medium tracking-tight">Repo</h1>
          <div className="flex items-center gap-0.5">
            <Link
              href="/exercises"
              aria-label="Exercises"
              className="inline-flex size-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <IconBarbell className="size-5" stroke={1.5} />
            </Link>
            <Link
              href="/login"
              aria-label="Settings"
              className="inline-flex size-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <IconSettings className="size-5" stroke={1.5} />
            </Link>
          </div>
        </header>

        <section className="mb-6">
          {emptyMode || displaySessions === 0 ? (
            <p className="text-xl font-medium tracking-tight">No sessions yet</p>
          ) : (
            <>
              <p className="text-xl font-medium tracking-tight">
                <span className="font-mono tabular-nums">{displaySessions}</span>
                {" sessions"}
                <span className="text-base font-normal text-muted-foreground">
                  {` · last ${heatFit.rangeDays} days`}
                </span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-mono tabular-nums">{displayStreak}</span>
                {" week streak"}
              </p>
            </>
          )}
        </section>

        <section
          ref={heatSectionRef}
          aria-label={`Last ${heatFit.rangeDays} days`}
          className="mb-8"
          dir="ltr"
        >
          <HeatmapCalendar
            data={displayData}
            rangeDays={heatFit.rangeDays}
            endDate={endDate}
            weekStartsOn={0}
            cellSize={heatFit.cellSize}
            cellGap={heatFit.cellGap}
            axisLabels
            legend={{ placement: "bottom", show: false }}
            renderLegend={({ levelCount, levelClassNames, cellSize }) => (
              <div className="mt-3 flex w-full items-center justify-end gap-1.5 text-xs text-muted-foreground">
                <span>less</span>
                {Array.from({ length: levelCount }).map((_, i) => (
                  <span
                    key={i}
                    className={cn("rounded-[2px]", levelClassNames[i])}
                    style={{ width: cellSize, height: cellSize }}
                    aria-hidden
                  />
                ))}
                <span>more</span>
              </div>
            )}
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
                  <div className="text-muted-foreground">{cell.label}</div>
                </div>
              )
            }}
            className="gap-0 overflow-visible rounded-none bg-transparent py-0 shadow-none ring-0"
          />
        </section>

        {!emptyMode ? (
          <section className="mb-8 border-y border-border py-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-sm font-medium">This week</h2>
              <p className="font-mono text-xs text-muted-foreground tabular-nums">
                {weekly.done} of {weekly.goal}
                {" · "}
                {weekly.daysLeft} days left
              </p>
            </div>
            <div className="mt-3 flex gap-2.5" aria-hidden>
              {Array.from({ length: weekly.goal }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "size-[22px] rounded-[4px]",
                    i < weekly.done
                      ? "bg-success"
                      : "border border-dashed border-border bg-transparent"
                  )}
                />
              ))}
            </div>
            <span className="sr-only">
              {weekly.done} of {weekly.goal} sessions this week
            </span>
          </section>
        ) : null}

        {!emptyMode && pickupCards.length > 0 ? (
          <section className="mb-4">
            <h2 className="mb-3 text-sm text-muted-foreground">
              pick up where you left off
            </h2>
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
                        "flex min-h-11 flex-col gap-1 rounded-lg px-3.5 py-3.5 transition-colors",
                        "hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isSuggested
                          ? "border-2 border-primary"
                          : "border border-border"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-base font-medium">{card.name}</span>
                        {isSuggested ? (
                          <IconPlayerPlayFilled
                            className="size-5 text-primary"
                            aria-hidden
                          />
                        ) : null}
                      </div>
                      <p className="font-mono text-xs text-muted-foreground">
                        {card.exerciseLabels.join(" · ")}
                      </p>
                      {isSuggested ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          last done {formatAgo(card.daysSinceLast)}
                        </p>
                      ) : (
                        <div className="mt-1 flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
                          <span className="font-mono tabular-nums">
                            {formatVolume(card.volumeKg)}
                          </span>
                          <span className="font-mono tabular-nums">
                            {formatAgo(card.daysSinceLast)}
                          </span>
                        </div>
                      )}
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
        <div
          className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background"
        >
          <div
            className="mx-auto w-full max-w-lg pt-3"
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
