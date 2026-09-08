"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { Popover } from "@base-ui/react/popover"
import {
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconDots,
  IconMinus,
  IconPencil,
  IconPlus,
  IconSearch,
  IconX,
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
import {
  exercises as seedExercises,
  lastSetsForExercise,
  sessionById,
} from "@/lib/demo-data"
import type { Exercise, ExerciseEntry, SetLog } from "@/lib/types"
import { cn } from "@/lib/utils"

const CHIP = "min-h-11 w-[52px] shrink-0"

function newSet(weightKg: number | null, reps: number): SetLog {
  return {
    id: `set-${Math.random().toString(36).slice(2, 9)}`,
    weightKg,
    reps,
    completedAt: null,
  }
}

function entryFromExercise(exerciseId: string): ExerciseEntry {
  const previous = lastSetsForExercise(exerciseId)
  const previousWeight = previous[0]?.weightKg
  // Demo a small progression while keeping the ghost row tied to history.
  const workingWeight =
    previousWeight == null ? 60 : Math.round((previousWeight + 2.5) * 2) / 2
  const sets =
    previous.length > 0
      ? previous.map((s) => newSet(workingWeight, s.reps))
      : [
          newSet(workingWeight, 8),
          newSet(workingWeight, 8),
          newSet(workingWeight, 8),
        ]
  return {
    id: `entry-${Math.random().toString(36).slice(2, 9)}`,
    exerciseId,
    sets,
  }
}

function initialSessionName(sessionId: string): string {
  const sourceId = sessionId.match(/ses-\d+/)?.[0]
  const source = sourceId ? sessionById(sourceId) : undefined
  if (source) return source.name
  if (sessionId.includes("card-legs")) return "Legs"
  if (sessionId.includes("card-push")) return "Push"
  if (sessionId.includes("card-pull")) return "Pull"
  return "Session"
}

function initialEntries(sessionId: string): ExerciseEntry[] {
  const sourceId = sessionId.match(/ses-\d+/)?.[0]
  const source = sourceId ? sessionById(sourceId) : undefined
  if (source) {
    return source.entries.map((entry) => entryFromExercise(entry.exerciseId))
  }
  if (sessionId.includes("card-legs")) {
    return [
      entryFromExercise("ex-squat"),
      entryFromExercise("ex-rdl"),
      entryFromExercise("ex-legpress"),
    ]
  }
  if (sessionId.includes("card-pull")) {
    return [
      entryFromExercise("ex-row"),
      entryFromExercise("ex-pullup"),
      entryFromExercise("ex-curl"),
    ]
  }
  return [
    entryFromExercise("ex-bench"),
    entryFromExercise("ex-ohp"),
    entryFromExercise("ex-pushdown"),
  ]
}

function formatElapsed(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }
  return `${m}:${String(s).padStart(2, "0")}`
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value)
}

function formatPrior(weightKg: number | null, reps: number): string {
  if (weightKg == null) return `BW × ${reps}`
  return `${weightKg} × ${reps}`
}

function formatExerciseNumber(index: number): string {
  return String(index + 1).padStart(2, "0")
}

function lastTimeLabel(exerciseId: string): string | null {
  const previous = lastSetsForExercise(exerciseId)
  if (previous.length === 0) return null
  const weight = previous[0]?.weightKg
  return weight == null ? "Last time: BW" : `Last time: ${weight} kg`
}

function completedSetSummary(sets: SetLog[]): string {
  const completed = sets.filter((setLog) => setLog.completedAt)
  if (completed.length === 0) return ""

  const groups: { weightKg: number | null; reps: number[] }[] = []
  for (const setLog of completed) {
    const current = groups[groups.length - 1]
    if (current && current.weightKg === setLog.weightKg) {
      current.reps.push(setLog.reps)
    } else {
      groups.push({ weightKg: setLog.weightKg, reps: [setLog.reps] })
    }
  }

  return groups
    .map(({ weightKg, reps }) => {
      const weight = weightKg == null ? "BW" : weightKg
      return `${weight} × ${reps.join(", ")}`
    })
    .join(" · ")
}

type RemovedSet = {
  entryId: string
  set: SetLog
  index: number
}

export function WorkoutLogger({ sessionId }: { sessionId: string }) {
  const router = useRouter()
  const [library] = useState<Exercise[]>(seedExercises)
  const [sessionName, setSessionName] = useState(() =>
    initialSessionName(sessionId)
  )
  const [editingName, setEditingName] = useState(false)
  const [startedAt] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())
  const [entries, setEntries] = useState<ExerciseEntry[]>(() =>
    initialEntries(sessionId)
  )
  const [activeEntryId, setActiveEntryId] = useState<string | null>(
    () =>
      entries.find((entry) => entry.sets.some((setLog) => !setLog.completedAt))
        ?.id ??
      entries[0]?.id ??
      null
  )
  const [pickerOpen, setPickerOpen] = useState(false)
  const [finishConfirmOpen, setFinishConfirmOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [editingSetId, setEditingSetId] = useState<string | null>(null)
  const [removedSet, setRemovedSet] = useState<RemovedSet | null>(null)
  const longPressTimerRef = useRef<number | null>(null)
  const suppressClickRef = useRef<string | null>(null)
  const undoTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current != null) {
        window.clearTimeout(longPressTimerRef.current)
      }
      if (undoTimerRef.current != null) {
        window.clearTimeout(undoTimerRef.current)
      }
    }
  }, [])

  const activeIndex = useMemo(() => {
    if (activeEntryId === null) return -1
    const selected = entries.findIndex((entry) => entry.id === activeEntryId)
    if (selected >= 0) return selected
    const i = entries.findIndex((e) => e.sets.some((s) => !s.completedAt))
    return i === -1 ? (entries.length > 0 ? 0 : -1) : i
  }, [activeEntryId, entries])

  const active = activeIndex >= 0 ? entries[activeIndex] : undefined
  const unloggedExerciseCount = entries.filter(
    (entry) => !entry.sets.some((setLog) => setLog.completedAt)
  ).length
  const completedSets = entries.flatMap((entry) =>
    entry.sets.filter((setLog) => setLog.completedAt)
  )
  const completedSetCount = completedSets.length
  const loggedVolume = completedSets.reduce(
    (sum, setLog) => sum + (setLog.weightKg ?? 0) * setLog.reps,
    0
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return library
    return library.filter((e) => e.name.toLowerCase().includes(q))
  }, [library, query])

  function setWeightForExercise(entryId: string, weightKg: number) {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId) return entry
        return {
          ...entry,
          sets: entry.sets.map((s) => (s.completedAt ? s : { ...s, weightKg })),
        }
      })
    )
  }

  function confirmSet(entryId: string, setId: string) {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId) return entry
        return {
          ...entry,
          sets: entry.sets.map((s) =>
            s.id === setId && !s.completedAt
              ? { ...s, completedAt: new Date().toISOString() }
              : s
          ),
        }
      })
    )
  }

  function updateSet(
    entryId: string,
    setId: string,
    changes: Partial<Pick<SetLog, "reps" | "weightKg">>
  ) {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              sets: entry.sets.map((setLog) =>
                setLog.id === setId ? { ...setLog, ...changes } : setLog
              ),
            }
          : entry
      )
    )
  }

  function removeSet(entryId: string, setId: string) {
    const entry = entries.find((item) => item.id === entryId)
    const index = entry?.sets.findIndex((setLog) => setLog.id === setId) ?? -1
    const setLog = index >= 0 ? entry?.sets[index] : undefined
    if (!setLog) return

    setEntries((prev) =>
      prev.map((item) =>
        item.id === entryId
          ? { ...item, sets: item.sets.filter((set) => set.id !== setId) }
          : item
      )
    )
    setEditingSetId(null)
    setRemovedSet({ entryId, set: setLog, index })

    if (undoTimerRef.current != null) {
      window.clearTimeout(undoTimerRef.current)
    }
    undoTimerRef.current = window.setTimeout(() => setRemovedSet(null), 5000)
  }

  function undoRemoveSet() {
    if (!removedSet) return
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== removedSet.entryId) return entry
        const sets = [...entry.sets]
        sets.splice(Math.min(removedSet.index, sets.length), 0, removedSet.set)
        return { ...entry, sets }
      })
    )
    if (undoTimerRef.current != null) {
      window.clearTimeout(undoTimerRef.current)
    }
    setRemovedSet(null)
  }

  function clearLongPress() {
    if (longPressTimerRef.current != null) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  function startLongPress(setId: string, done: boolean) {
    clearLongPress()
    if (done) return
    longPressTimerRef.current = window.setTimeout(() => {
      suppressClickRef.current = setId
      setEditingSetId(setId)
      longPressTimerRef.current = null
    }, 500)
  }

  function addSet(entryId: string) {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId) return entry
        const last = entry.sets[entry.sets.length - 1]
        return {
          ...entry,
          sets: [...entry.sets, newSet(last?.weightKg ?? 60, last?.reps ?? 8)],
        }
      })
    )
  }

  function addExercise(exerciseId: string) {
    const entry = entryFromExercise(exerciseId)
    setEntries((prev) => [...prev, entry])
    setActiveEntryId(entry.id)
    setPickerOpen(false)
    setQuery("")
  }

  function removeExercise(entryId: string) {
    const remaining = entries.filter((entry) => entry.id !== entryId)
    setEntries(remaining)
    if (active?.id === entryId) {
      const next =
        remaining.find((entry) =>
          entry.sets.some((setLog) => !setLog.completedAt)
        ) ?? remaining[0]
      setActiveEntryId(next?.id ?? null)
    }
  }

  function requestFinish() {
    if (unloggedExerciseCount > 0) {
      setFinishConfirmOpen(true)
      return
    }
    router.push("/")
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overscroll-y-contain">
      <header className="pb-4">
        <div className="flex min-h-11 items-center gap-1">
          <Link
            href="/"
            aria-label="Back"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <IconChevronLeft className="size-5.5 rtl:rotate-180" stroke={1.5} />
          </Link>

          <div className="flex min-w-0 flex-1 items-center gap-1">
            {editingName ? (
              <input
                autoFocus
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setEditingName(false)
                }}
                className="min-w-0 flex-1 bg-transparent text-base font-medium outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditingName(true)}
                className="flex max-w-full min-w-0 items-center gap-1 text-start"
              >
                <span className="truncate text-base font-medium">
                  {sessionName}
                </span>
                <IconPencil
                  className="size-4.5 shrink-0 text-muted-foreground"
                  stroke={1.5}
                  aria-hidden
                />
              </button>
            )}
          </div>

          <span className="shrink-0 font-mono text-sm text-muted-foreground tabular-nums">
            {formatElapsed(now - startedAt)}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-(--radius) bg-surface-1 p-3">
            <p className="text-[11px] text-muted-foreground">Exercises</p>
            <p className="mt-1 font-mono text-[17px] tabular-nums">
              {entries.length}
            </p>
          </div>
          <div className="rounded-(--radius) bg-surface-1 p-3">
            <p className="text-[11px] text-muted-foreground">Sets</p>
            <p className="mt-1 font-mono text-[17px] tabular-nums">
              {completedSetCount}
            </p>
          </div>
          <div className="rounded-(--radius) bg-surface-1 p-3">
            <p className="text-[11px] text-muted-foreground">Volume</p>
            <p className="mt-1 truncate font-mono text-[17px] tabular-nums">
              {formatNumber(loggedVolume)} kg
            </p>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain pb-28">
        <ul className="space-y-2">
          {entries.map((entry, entryIndex) => {
            const name =
              library.find((exercise) => exercise.id === entry.exerciseId)
                ?.name ?? "Exercise"
            const isOpen = active?.id === entry.id
            const number = formatExerciseNumber(entryIndex)
            const completedCount = entry.sets.filter(
              (setLog) => setLog.completedAt
            ).length
            const isComplete =
              entry.sets.length > 0 && completedCount === entry.sets.length
            const previousSets = lastSetsForExercise(entry.exerciseId)
            const previousLabel = lastTimeLabel(entry.exerciseId)
            const openWeight =
              entry.sets.find((setLog) => !setLog.completedAt)?.weightKg ??
              entry.sets[0]?.weightKg ??
              0
            const mixedWeights =
              new Set(entry.sets.map((setLog) => String(setLog.weightKg)))
                .size > 1
            const collapsedSummary = isComplete
              ? completedSetSummary(entry.sets)
              : completedCount > 0
                ? `${completedCount} of ${entry.sets.length} Sets`
                : previousLabel
            const nextEntry = entries[entryIndex + 1]
            const nextName = nextEntry
              ? (library.find(
                  (exercise) => exercise.id === nextEntry.exerciseId
                )?.name ?? "Exercise")
              : null

            return (
              <li key={entry.id}>
                {isOpen ? (
                  <section className="min-w-0 space-y-3 rounded-xl bg-surface-1 p-3">
                    <div className="flex min-w-0 items-center gap-1">
                      <button
                        type="button"
                        aria-expanded={true}
                        aria-label={`Collapse ${name}`}
                        onClick={() => setActiveEntryId(null)}
                        className="flex min-h-11 min-w-0 flex-1 items-center gap-2.5 text-start hover:text-foreground"
                      >
                        <span className="w-6 shrink-0 font-mono text-sm font-medium text-success tabular-nums">
                          {number}
                        </span>
                        <h2 className="min-w-0 flex-1 truncate text-base font-medium">
                          {name}
                        </h2>
                        <IconChevronUp
                          className="size-5.5 shrink-0 text-muted-foreground"
                          stroke={1.5}
                          aria-hidden
                        />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <button
                              type="button"
                              aria-label={`Options for ${name}`}
                              className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                            />
                          }
                        >
                          <IconDots className="size-5.5" stroke={1.5} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => removeExercise(entry.id)}
                            className="min-h-11"
                          >
                            Remove Exercise
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[11px] text-muted-foreground">
                        Working weight
                      </p>
                      <label className="flex items-center gap-2">
                        <input
                          type="number"
                          inputMode="decimal"
                          className="h-11 w-20 appearance-none rounded-md border border-input bg-background px-2 font-mono text-sm tabular-nums outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                          value={openWeight ?? ""}
                          onChange={(e) => {
                            const v = Number(e.target.value)
                            if (Number.isFinite(v))
                              setWeightForExercise(entry.id, v)
                          }}
                        />
                        <span className="text-sm text-muted-foreground">
                          kg
                        </span>
                      </label>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] text-muted-foreground">
                        Sets · Tap when done
                      </p>
                      <div className="flex min-w-0 scrollbar-none gap-2 overflow-x-auto overscroll-x-contain pb-0.5">
                        {entry.sets.map((s, setIndex) => {
                          const done = Boolean(s.completedAt)
                          const triggerId = `set-trigger-${s.id}`
                          return (
                            <Popover.Root
                              key={s.id}
                              open={editingSetId === s.id}
                              triggerId={
                                editingSetId === s.id ? triggerId : null
                              }
                              onOpenChange={(open) => {
                                if (!open) {
                                  setEditingSetId(null)
                                } else if (done) {
                                  setEditingSetId(s.id)
                                }
                              }}
                            >
                              <Popover.Trigger
                                id={triggerId}
                                render={
                                  <button
                                    type="button"
                                    aria-pressed={done}
                                    aria-label={`Set ${setIndex + 1}: ${s.reps} reps, ${
                                      done
                                        ? "completed; tap to edit"
                                        : "pending; tap to complete"
                                    }`}
                                    onPointerDown={() =>
                                      startLongPress(s.id, done)
                                    }
                                    onPointerUp={clearLongPress}
                                    onPointerCancel={clearLongPress}
                                    onPointerLeave={clearLongPress}
                                    onContextMenu={(event) =>
                                      event.preventDefault()
                                    }
                                    onClick={(event) => {
                                      if (suppressClickRef.current === s.id) {
                                        event.preventDefault()
                                        suppressClickRef.current = null
                                        return
                                      }
                                      if (done) {
                                        setEditingSetId(s.id)
                                      } else {
                                        confirmSet(entry.id, s.id)
                                      }
                                    }}
                                    className={cn(
                                      CHIP,
                                      "inline-flex flex-col items-center justify-center rounded-md font-mono text-sm tabular-nums transition-colors",
                                      done
                                        ? "border border-success bg-success text-emerald-950 hover:bg-success/90"
                                        : "border border-dashed border-muted-foreground/50 bg-transparent text-muted-foreground hover:border-muted-foreground active:bg-muted"
                                    )}
                                  >
                                    {mixedWeights ? (
                                      <span className="text-[10px] leading-none opacity-80">
                                        {s.weightKg ?? "BW"}
                                      </span>
                                    ) : null}
                                    <span className="leading-none">
                                      {s.reps}
                                    </span>
                                  </button>
                                }
                              />

                              <Popover.Portal>
                                <Popover.Positioner
                                  side="top"
                                  align="center"
                                  sideOffset={8}
                                  className="z-50"
                                >
                                  <Popover.Popup className="w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-lg outline-none">
                                    <div className="flex items-center justify-between gap-3">
                                      <Popover.Title className="text-base font-medium">
                                        Set {setIndex + 1}
                                      </Popover.Title>
                                      <Popover.Close
                                        aria-label="Close set editor"
                                        className="inline-flex size-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                                      >
                                        <IconX
                                          className="size-5.5"
                                          stroke={1.5}
                                        />
                                      </Popover.Close>
                                    </div>

                                    <div className="mt-3 space-y-4">
                                      <div>
                                        <p className="mb-1.5 text-xs text-muted-foreground">
                                          Reps
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            aria-label="Decrease reps"
                                            onClick={() =>
                                              updateSet(entry.id, s.id, {
                                                reps: Math.max(0, s.reps - 1),
                                              })
                                            }
                                            className="inline-flex size-11 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                                          >
                                            <IconMinus
                                              className="size-5"
                                              stroke={1.5}
                                            />
                                          </button>
                                          <span className="min-w-12 text-center font-mono text-lg tabular-nums">
                                            {s.reps}
                                          </span>
                                          <button
                                            type="button"
                                            aria-label="Increase reps"
                                            onClick={() =>
                                              updateSet(entry.id, s.id, {
                                                reps: s.reps + 1,
                                              })
                                            }
                                            className="inline-flex size-11 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                                          >
                                            <IconPlus
                                              className="size-5"
                                              stroke={1.5}
                                            />
                                          </button>
                                        </div>
                                      </div>

                                      <label className="block">
                                        <span className="mb-1.5 block text-xs text-muted-foreground">
                                          Weight
                                        </span>
                                        <span className="flex items-center gap-2">
                                          <input
                                            type="number"
                                            inputMode="decimal"
                                            value={s.weightKg ?? ""}
                                            onChange={(event) => {
                                              const value = event.target.value
                                              updateSet(entry.id, s.id, {
                                                weightKg:
                                                  value === ""
                                                    ? null
                                                    : Number(value),
                                              })
                                            }}
                                            className="h-11 min-w-0 flex-1 appearance-none rounded-md border border-input bg-background px-3 font-mono text-sm tabular-nums outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                                          />
                                          <span className="shrink-0 text-sm text-muted-foreground">
                                            kg
                                          </span>
                                        </span>
                                      </label>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => removeSet(entry.id, s.id)}
                                      className="mt-4 flex min-h-11 w-full items-center border-t border-border pt-3 text-start text-sm text-destructive"
                                    >
                                      Remove Set
                                    </button>
                                  </Popover.Popup>
                                </Popover.Positioner>
                              </Popover.Portal>
                            </Popover.Root>
                          )
                        })}
                        <button
                          type="button"
                          aria-label="Add set"
                          onClick={() => addSet(entry.id)}
                          className={cn(
                            CHIP,
                            "inline-flex items-center justify-center rounded-md border border-dashed border-border text-muted-foreground hover:bg-muted"
                          )}
                        >
                          <IconPlus className="size-5" stroke={1.5} />
                        </button>
                      </div>

                      <div className="flex min-w-0 scrollbar-none gap-2 overflow-x-auto overscroll-x-contain">
                        {entry.sets.map((s, i) => {
                          const prior = previousSets[i]
                          return (
                            <div
                              key={`prior-${s.id}`}
                              className={cn(
                                CHIP,
                                "flex items-start justify-center pt-0.5"
                              )}
                            >
                              {prior ? (
                                <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                                  {formatPrior(prior.weightKg, prior.reps)}
                                </span>
                              ) : (
                                <span className="sr-only">No previous set</span>
                              )}
                            </div>
                          )
                        })}
                        <div className={CHIP} aria-hidden />
                      </div>
                    </div>

                    {nextEntry && nextName ? (
                      <button
                        type="button"
                        onClick={() => setActiveEntryId(nextEntry.id)}
                        className="ms-auto flex min-h-11 max-w-full items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <span className="truncate">Next: {nextName}</span>
                        <IconChevronRight
                          className="size-5 shrink-0 rtl:rotate-180"
                          stroke={1.5}
                          aria-hidden
                        />
                      </button>
                    ) : null}
                  </section>
                ) : (
                  <button
                    type="button"
                    aria-expanded={false}
                    aria-label={`Expand ${name}`}
                    onClick={() => setActiveEntryId(entry.id)}
                    className="flex min-h-16 w-full min-w-0 items-center gap-3 border-b border-border px-1 py-2 text-start hover:bg-muted/40"
                  >
                    <span className="w-6 shrink-0 self-start pt-0.5 font-mono text-sm font-medium text-success tabular-nums">
                      {number}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-sm",
                          isComplete
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {name}
                      </span>
                      {collapsedSummary ? (
                        <span className="mt-1 block truncate font-mono text-xs text-muted-foreground tabular-nums">
                          {collapsedSummary}
                        </span>
                      ) : null}
                    </span>
                    {isComplete ? (
                      <IconCheck
                        className="size-5.5 shrink-0 text-success"
                        stroke={1.5}
                        aria-hidden
                      />
                    ) : (
                      <IconChevronDown
                        className="size-5.5 shrink-0 text-muted-foreground"
                        stroke={1.5}
                        aria-hidden
                      />
                    )}
                  </button>
                )}
              </li>
            )
          })}
        </ul>

        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="mt-4 flex min-h-11 w-full items-center gap-2 rounded-md text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        >
          <IconPlus className="size-5" stroke={1.5} />
          Add Exercise
        </button>
      </div>

      {removedSet ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] z-40 mx-auto flex min-h-11 max-w-md items-center justify-between gap-3 rounded-lg border border-border bg-popover px-3 text-sm text-popover-foreground shadow-lg"
        >
          <span>Set removed</span>
          <button
            type="button"
            onClick={undoRemoveSet}
            className="min-h-11 shrink-0 px-2 font-medium text-primary"
          >
            Undo
          </button>
        </div>
      ) : null}

      <div
        className={cn(
          "sticky bottom-0 z-10 -mx-4 border-t border-border bg-background px-4",
          "pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]"
        )}
      >
        <Button
          size="lg"
          className="h-12 min-h-11 w-full text-base"
          onClick={requestFinish}
        >
          Finish
        </Button>
      </div>

      <AlertDialog open={finishConfirmOpen} onOpenChange={setFinishConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {unloggedExerciseCount}{" "}
              {unloggedExerciseCount === 1 ? "exercise has" : "exercises have"}{" "}
              no sets. Finish anyway?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your logged sets will be kept; unfinished exercises will remain
              empty.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11">
              Keep Logging
            </AlertDialogCancel>
            <AlertDialogAction
              className="min-h-11"
              onClick={() => router.push("/")}
            >
              Finish anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {pickerOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/80">
          <div className="mx-auto mt-auto flex max-h-[80dvh] w-full max-w-lg min-w-0 flex-col rounded-t-xl border border-border bg-background px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-medium">Add Exercise</h2>
              <Button
                variant="ghost"
                size="sm"
                className="min-h-11"
                onClick={() => setPickerOpen(false)}
              >
                Close
              </Button>
            </div>
            <label className="relative mb-3 block">
              <IconSearch
                className="pointer-events-none absolute inset-s-3 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground"
                stroke={1.5}
              />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="h-11 w-full min-w-0 rounded-md border border-input bg-background ps-9 pe-3 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </label>
            <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto">
              {filtered.map((ex) => (
                <li key={ex.id}>
                  <button
                    type="button"
                    className="flex min-h-11 w-full items-center rounded-md px-2 text-start text-sm hover:bg-muted"
                    onClick={() => addExercise(ex.id)}
                  >
                    {ex.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}
