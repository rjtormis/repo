"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  IconCheck,
  IconChevronLeft,
  IconDotsVertical,
} from "@tabler/icons-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { exerciseById, pastSessions } from "@/lib/demo-data"
import type { ExerciseEntry, Session, SetLog } from "@/lib/types"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]
const SET_CHIP = "min-h-11 w-[52px] shrink-0"

function completedSets(entry: ExerciseEntry): SetLog[] {
  return entry.sets.filter((setLog) => setLog.completedAt)
}

function setSummary(entry: ExerciseEntry): string {
  const groups: { weightKg: number | null; reps: number[] }[] = []

  for (const setLog of completedSets(entry)) {
    const current = groups[groups.length - 1]
    if (current && current.weightKg === setLog.weightKg) {
      current.reps.push(setLog.reps)
    } else {
      groups.push({ weightKg: setLog.weightKg, reps: [setLog.reps] })
    }
  }

  return groups
    .map(({ weightKg, reps }) => {
      const weight = weightKg == null ? "BW" : `${weightKg} kg`
      return `${weight} × ${reps.join(", ")}`
    })
    .join(" · ")
}

function entryVolume(entry: ExerciseEntry): number {
  return completedSets(entry).reduce(
    (sum, setLog) => sum + (setLog.weightKg ?? 0) * setLog.reps,
    0
  )
}

function sessionVolume(session: Session): number {
  return session.entries.reduce((sum, entry) => sum + entryVolume(entry), 0)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(
    value
  )
}

function formatHeaderDate(session: Session): string {
  const start = new Date(session.startedAt)
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(start)
  const finished = session.finishedAt ? new Date(session.finishedAt) : null
  const minutes = finished
    ? Math.max(1, Math.round((finished.getTime() - start.getTime()) / 60_000))
    : null

  return `${WEEKDAYS[start.getDay()]} ${start.getDate()} ${
    MONTHS[start.getMonth()]
  } · ${time}${minutes == null ? "" : ` · ${minutes} min`}`
}

function formatComparisonDate(iso: string): string {
  const date = new Date(iso)
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`
}

type ExerciseComparison = {
  previousWeight: number
  date: string
  delta: number
}

function exerciseComparison(
  session: Session,
  entry: ExerciseEntry
): ExerciseComparison | null {
  const currentWeights = completedSets(entry)
    .map((setLog) => setLog.weightKg)
    .filter((weight): weight is number => weight != null)
  if (currentWeights.length === 0) return null

  const currentTime = new Date(
    session.finishedAt ?? session.startedAt
  ).getTime()
  const previous = [...pastSessions]
    .filter(
      (candidate) =>
        candidate.id !== session.id &&
        new Date(candidate.finishedAt ?? candidate.startedAt).getTime() <
          currentTime
    )
    .sort(
      (a, b) =>
        new Date(b.finishedAt ?? b.startedAt).getTime() -
        new Date(a.finishedAt ?? a.startedAt).getTime()
    )
    .find((candidate) =>
      candidate.entries.some(
        (candidateEntry) =>
          candidateEntry.exerciseId === entry.exerciseId &&
          completedSets(candidateEntry).length > 0
      )
    )
  const previousEntry = previous?.entries.find(
    (candidateEntry) => candidateEntry.exerciseId === entry.exerciseId
  )
  if (!previous || !previousEntry) return null

  const previousWeights = completedSets(previousEntry)
    .map((setLog) => setLog.weightKg)
    .filter((weight): weight is number => weight != null)
  if (previousWeights.length === 0) return null

  const previousWeight = Math.max(...previousWeights)
  return {
    previousWeight,
    date: formatComparisonDate(previous.finishedAt ?? previous.startedAt),
    delta: Math.max(...currentWeights) - previousWeight,
  }
}

function changeBadge(comparison: ExerciseComparison) {
  if (Math.abs(comparison.delta) < 0.001) {
    return {
      label: "no change",
      className: "bg-surface-2 text-secondary-foreground",
    }
  }
  const sign = comparison.delta > 0 ? "+" : "−"
  return {
    label: `${sign}${formatNumber(Math.abs(comparison.delta))} kg`,
    className:
      comparison.delta > 0
        ? "bg-bg-success text-text-success"
        : "bg-surface-2 text-secondary-foreground",
  }
}

function sessionExerciseSignature(session: Session): string {
  return session.entries
    .map((entry) => entry.exerciseId)
    .sort()
    .join("|")
}

function comparableVolumeSessions(session: Session): Session[] {
  const signature = sessionExerciseSignature(session)
  const currentTime = new Date(
    session.finishedAt ?? session.startedAt
  ).getTime()
  return pastSessions
    .filter(
      (candidate) =>
        candidate.finishedAt &&
        new Date(candidate.finishedAt).getTime() <= currentTime &&
        sessionExerciseSignature(candidate) === signature
    )
    .sort(
      (a, b) =>
        new Date(a.finishedAt ?? a.startedAt).getTime() -
        new Date(b.finishedAt ?? b.startedAt).getTime()
    )
    .slice(-5)
}

export function SessionDetail({
  session,
  previousSessionId,
  nextSessionId,
}: {
  session: Session
  previousSessionId: string | null
  nextSessionId: string | null
}) {
  const router = useRouter()
  const [name, setName] = useState(session.name)
  const [renameDraft, setRenameDraft] = useState(session.name)
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null)

  const exerciseCount = session.entries.length
  const setCount = session.entries.reduce(
    (sum, entry) => sum + completedSets(entry).length,
    0
  )
  const totalVolume = sessionVolume(session)
  const isInProgress = session.finishedAt == null
  const volumeTrend = comparableVolumeSessions(session)
  const maxTrendVolume = Math.max(
    1,
    ...volumeTrend.map((candidate) => sessionVolume(candidate))
  )

  function repeatSession() {
    const newId = `copy-${session.id}-${Date.now().toString(36)}`
    router.push(`/workout/${newId}`)
  }

  function navigateBySwipe(deltaX: number) {
    if (Math.abs(deltaX) < 56) return
    const isRtl = document.documentElement.dir === "rtl"
    const targetId =
      deltaX < 0
        ? isRtl
          ? nextSessionId
          : previousSessionId
        : isRtl
          ? previousSessionId
          : nextSessionId
    if (targetId) router.push(`/session/${targetId}`)
  }

  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 touch-pan-y flex-col overflow-x-hidden"
      onTouchStart={(event) => {
        const touch = event.touches[0]
        swipeStartRef.current = touch
          ? { x: touch.clientX, y: touch.clientY }
          : null
      }}
      onTouchEnd={(event) => {
        const start = swipeStartRef.current
        const touch = event.changedTouches[0]
        swipeStartRef.current = null
        if (!start || !touch) return
        const deltaX = touch.clientX - start.x
        const deltaY = touch.clientY - start.y
        if (Math.abs(deltaX) > Math.abs(deltaY) * 1.25) {
          navigateBySwipe(deltaX)
        }
      }}
    >
      <header>
        <div className="flex min-w-0 items-start gap-1">
          <Link
            href="/"
            aria-label="Back"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <IconChevronLeft className="size-5.5 rtl:rotate-180" stroke={1.5} />
          </Link>

          <div className="min-w-0 flex-1 pt-2">
            <h1 className="truncate text-lg font-medium">{name}</h1>
            <p className="mt-1 truncate font-mono text-xs text-muted-foreground tabular-nums">
              {formatHeaderDate(session)}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  aria-label="Session options"
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                />
              }
            >
              <IconDotsVertical className="size-5.5" stroke={1.5} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="min-h-11"
                onClick={() => router.push(`/workout/edit-${session.id}`)}
              >
                Edit session
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-h-11"
                onClick={() => {
                  setRenameDraft(name)
                  setRenameOpen(true)
                }}
              >
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-h-11"
                onClick={() => setDeleteOpen(true)}
              >
                Delete session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-(--radius) bg-surface-1 p-3">
            <p className="text-[11px] text-muted-foreground">exercises</p>
            <p className="mt-1 font-mono text-[17px] tabular-nums">
              {exerciseCount}
            </p>
          </div>
          <div className="rounded-(--radius) bg-surface-1 p-3">
            <p className="text-[11px] text-muted-foreground">sets</p>
            <p className="mt-1 font-mono text-[17px] tabular-nums">
              {setCount}
            </p>
          </div>
          <div className="rounded-(--radius) bg-surface-1 p-3">
            <p className="text-[11px] text-muted-foreground">volume</p>
            <p className="mt-1 truncate font-mono text-[17px] tabular-nums">
              {formatNumber(totalVolume)} kg
            </p>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pt-4 pb-24">
        <ul className="space-y-2">
          {session.entries.map((entry) => {
            const exercise = exerciseById(entry.exerciseId)
            const exerciseName = exercise?.name ?? "Exercise"
            const sets = completedSets(entry)
            const volume = entryVolume(entry)
            const comparison = exerciseComparison(session, entry)
            const badge = comparison ? changeBadge(comparison) : null
            const isPr = session.prExerciseIds?.includes(entry.exerciseId)
            const mixedWeights =
              new Set(sets.map((setLog) => String(setLog.weightKg))).size > 1

            return (
              <li key={entry.id}>
                <section className="min-w-0 space-y-3 rounded-xl bg-surface-1 p-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <h2 className="min-w-0 truncate text-base font-medium">
                      {exerciseName}
                    </h2>
                    {isPr ? (
                      <span className="shrink-0 rounded-sm bg-success/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-success">
                        PR
                      </span>
                    ) : null}
                    {badge ? (
                      <span
                        className={`ms-auto shrink-0 rounded-sm px-1.5 py-0.5 font-mono text-[11px] ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    ) : (
                      <IconCheck
                        className="ms-auto size-5.5 shrink-0 text-success"
                        stroke={1.5}
                        aria-hidden
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground">
                      completed sets
                    </p>
                    {sets.length > 0 ? (
                      <div className="flex min-w-0 scrollbar-none gap-2 overflow-x-auto overscroll-x-contain pb-0.5">
                        {sets.map((setLog, setIndex) => (
                          <div
                            key={setLog.id}
                            aria-label={`Set ${setIndex + 1}: ${setLog.reps} reps${
                              setLog.weightKg == null
                                ? " at bodyweight"
                                : ` at ${formatNumber(setLog.weightKg)} kilograms`
                            }`}
                            className={`${SET_CHIP} inline-flex flex-col items-center justify-center rounded-md border border-success bg-success font-mono text-sm text-emerald-950 tabular-nums`}
                          >
                            {mixedWeights ? (
                              <span className="text-[10px] leading-none opacity-80">
                                {setLog.weightKg == null
                                  ? "BW"
                                  : formatNumber(setLog.weightKg)}
                              </span>
                            ) : null}
                            <span className="leading-none">{setLog.reps}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="font-mono text-xs text-muted-foreground">
                        No completed sets
                      </p>
                    )}
                  </div>

                  <div className="flex min-w-0 items-end justify-between gap-3 border-t border-border pt-3">
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted-foreground">
                        {sets.length} {sets.length === 1 ? "set" : "sets"}
                      </p>
                      <p className="mt-0.5 truncate font-mono text-sm tabular-nums">
                        {setSummary(entry)}
                      </p>
                    </div>
                    <div className="shrink-0 text-end">
                      <p className="text-[11px] text-muted-foreground">
                        volume
                      </p>
                      <p className="mt-0.5 font-mono text-sm tabular-nums">
                        {formatNumber(volume)} kg
                      </p>
                    </div>
                  </div>

                  {comparison ? (
                    <p className="font-mono text-[11px] text-muted-foreground tabular-nums">
                      was {formatNumber(comparison.previousWeight)} kg on{" "}
                      {comparison.date}
                    </p>
                  ) : null}
                </section>
              </li>
            )
          })}
        </ul>

        {volumeTrend.length >= 3 ? (
          <section className="mt-6">
            <p className="truncate text-[11px] text-muted-foreground">
              volume · last 5 {name} sessions
            </p>
            <div
              className="mt-2 flex h-12 items-end gap-2"
              aria-label={`Volume trend for ${name}`}
            >
              {volumeTrend.map((candidate) => {
                const volume = sessionVolume(candidate)
                const height = Math.max(18, (volume / maxTrendVolume) * 100)
                return (
                  <div
                    key={candidate.id}
                    className={`min-w-0 flex-1 rounded-t-sm ${
                      candidate.id === session.id
                        ? "bg-success"
                        : "bg-surface-1"
                    }`}
                    style={{ height: `${height}%` }}
                    title={`${formatNumber(volume)} kg`}
                  />
                )
              })}
            </div>
          </section>
        ) : null}
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
        <Button
          size="lg"
          className="h-12 min-h-11 w-full text-base"
          onClick={
            isInProgress
              ? () => router.push(`/workout/${session.id}`)
              : repeatSession
          }
        >
          {isInProgress ? "Resume" : "Repeat this workout"}
        </Button>
      </div>

      <AlertDialog open={renameOpen} onOpenChange={setRenameOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename session</AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              Enter a new session name.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <input
            autoFocus
            value={renameDraft}
            onChange={(event) => setRenameDraft(event.target.value)}
            className="h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="min-h-11"
              onClick={() => {
                const nextName = renameDraft.trim()
                if (nextName) setName(nextName)
                setRenameOpen(false)
              }}
            >
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this session?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes it from your history and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11">Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="outline"
              className="min-h-11"
              onClick={() => router.push("/")}
            >
              Delete session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
