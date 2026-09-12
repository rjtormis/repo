"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { IconPlus } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import type { HeatmapCell } from "@/components/heatmap-calendar"
import { NavigationMenu } from "@/components/navigation-menu"
import {
  PAGE_PAD_STYLE,
  PAGE_PAD_X,
  TARGET_DAYS,
} from "@/components/home/constants"
import {
  fitHeatmap,
  formatElapsed,
  formatHomeDate,
  greetingForHour,
  monthsFromDays,
  orderPickupCards,
} from "@/components/home/lib"
import { HistoryPager } from "@/components/home/history-pager"
import { StatsCard } from "@/components/home/stats-card"
import { TrainingHeatmap } from "@/components/home/training-heatmap"
import type { ActiveSession, WeeklyTarget } from "@/components/home/types"
import { useGetDashboardStats } from "@/hooks/tanstack/dashboard"
import { useUserPrefs } from "@/lib/user-prefs"
import { cn } from "@/lib/utils"
import { useCreateWorkoutSessions } from "@/hooks/tanstack/session"

export default function HomeScreen() {
  const router = useRouter()
  const { weekStartsOn, workoutDays, weightUnit } = useUserPrefs()
  const heatMeasureRef = useRef<HTMLDivElement>(null)
  const [now] = useState(() => Date.now())
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [clock, setClock] = useState<Date | null>(null)
  const [fit, setFit] = useState({ rangeDays: TARGET_DAYS, cellSize: 11 })
  const [activeSession] = useState<ActiveSession | null>(null)

  const [weekly] = useState<WeeklyTarget>({ done: 3, goal: 5, daysLeft: 4 })

  const today = new Date().toLocaleDateString("en-CA")
  const { data: stats } = useGetDashboardStats(today)

  const workoutSessions = stats?.recentSessions ?? []
  const heatmap = stats?.heatmap ?? []

  const { mutateAsync } = useCreateWorkoutSessions()

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const nowLocal = new Date()
      setClock(nowLocal)
      const next = new Date(nowLocal)
      next.setHours(12, 0, 0, 0)
      setEndDate(next)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  useLayoutEffect(() => {
    const el = heatMeasureRef.current
    if (!el) return
    const update = () => {
      const next = fitHeatmap(el.clientWidth, endDate, weekStartsOn)
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
  }, [endDate, weekStartsOn])

  const emptyMode = workoutSessions.length == 0

  const pickupCards = useMemo(
    () => orderPickupCards(workoutSessions),
    [workoutSessions]
  )
  const displayData = useMemo(
    () => (emptyMode ? [] : heatmap),
    [emptyMode, heatmap]
  )
  const displaySessions = emptyMode || !endDate ? 0 : stats!.sessions.total
  const displayStreak = emptyMode || !endDate ? 0 : stats!.streak.count
  const heatReady = endDate !== null
  const monthsShown = monthsFromDays(fit.rangeDays)
  const weekDone = emptyMode ? 0 : weekly.done
  const weekGoal = workoutDays > 0 ? workoutDays : weekly.goal
  const xpToNext = Math.max(
    0,
    (stats?.level?.xpForNextLevel ?? 0) - (stats?.level?.xpIntoLevel ?? 0)
  )
  const greeting = clock ? greetingForHour(clock.getHours()) : null
  const dateLabel = clock ? formatHomeDate(clock) : null

  function resumeWorkout() {
    if (!activeSession) return
    router.push(`/session/${activeSession.id}`)
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
      onClick={async () => {
        console.log("clicked")
        const result = await mutateAsync()
        router.push(`/session/${result.id}`)
      }}
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
          !emptyMode && "pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))]"
        )}
        style={PAGE_PAD_STYLE}
      >
        <header className="mb-4">
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            {dateLabel ?? "\u00a0"}
          </p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <h1 className="min-w-0 text-xl leading-tight font-semibold">
              {greeting ?? "\u00a0"}
            </h1>
            <NavigationMenu />
          </div>
        </header>

        <StatsCard
          streak={displayStreak}
          motivation={stats?.motivation}
          sessions={displaySessions}
          sessionsReady={heatReady}
          weekDone={weekDone}
          weekGoal={weekGoal}
          level={stats?.level}
          xpToNext={emptyMode ? 0 : xpToNext}
        />

        <TrainingHeatmap
          measureRef={heatMeasureRef}
          monthsShown={monthsShown}
          ready={heatReady}
          weekStartsOn={weekStartsOn}
          data={displayData}
          rangeDays={fit.rangeDays}
          endDate={endDate}
          cellSize={fit.cellSize}
          onCellClick={onCellClick}
        />

        {!emptyMode ? (
          <HistoryPager
            cards={pickupCards}
            records={stats?.records ?? []}
            unit={weightUnit}
          />
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
