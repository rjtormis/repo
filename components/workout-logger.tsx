"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
  IconChevronLeft,
  IconPencil,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { exercises as seedExercises, lastSetsForExercise } from "@/lib/demo-data"
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
  const last = lastSetsForExercise(exerciseId)
  const weight = last[0]?.weightKg ?? 60
  const sets =
    last.length > 0
      ? last.map((s) => newSet(s.weightKg, s.reps))
      : [newSet(weight, 8), newSet(weight, 8), newSet(weight, 8)]
  return {
    id: `entry-${Math.random().toString(36).slice(2, 9)}`,
    exerciseId,
    sets,
  }
}

function initialSessionName(sessionId: string): string {
  if (sessionId.includes("card-legs")) return "Legs"
  if (sessionId.includes("card-push")) return "Push"
  if (sessionId.includes("card-pull")) return "Pull"
  return "Session"
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

function formatPrior(weightKg: number | null, reps: number): string {
  if (weightKg == null) return `BW × ${reps}`
  return `${weightKg} × ${reps}`
}

function plannedWeight(exerciseId: string): string {
  const last = lastSetsForExercise(exerciseId)
  const w = last[0]?.weightKg
  if (w == null) return "—"
  return `${w} kg`
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
  const [entries, setEntries] = useState<ExerciseEntry[]>(() => [
    entryFromExercise("ex-bench"),
    entryFromExercise("ex-ohp"),
    entryFromExercise("ex-pushdown"),
  ])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [query, setQuery] = useState("")

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const activeIndex = useMemo(() => {
    const i = entries.findIndex((e) => e.sets.some((s) => !s.completedAt))
    return i === -1 ? Math.max(0, entries.length - 1) : i
  }, [entries])

  const active = entries[activeIndex]
  const upNext = entries.slice(activeIndex + 1)

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
          sets: entry.sets.map((s) =>
            s.completedAt ? s : { ...s, weightKg }
          ),
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

  function addSet(entryId: string) {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId) return entry
        const last = entry.sets[entry.sets.length - 1]
        return {
          ...entry,
          sets: [
            ...entry.sets,
            newSet(last?.weightKg ?? 60, last?.reps ?? 8),
          ],
        }
      })
    )
  }

  function addExercise(exerciseId: string) {
    setEntries((prev) => [...prev, entryFromExercise(exerciseId)])
    setPickerOpen(false)
    setQuery("")
  }

  const last = active ? lastSetsForExercise(active.exerciseId) : []
  const openWeight =
    active?.sets.find((s) => !s.completedAt)?.weightKg ??
    active?.sets[0]?.weightKg ??
    0
  const mixedWeights =
    !!active &&
    new Set(active.sets.map((s) => String(s.weightKg))).size > 1
  const ex = active
    ? library.find((e) => e.id === active.exerciseId)
    : undefined

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overscroll-y-contain">
      <header className="flex min-h-11 items-center gap-1 pb-4">
        <Link
          href="/"
          aria-label="Back"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <IconChevronLeft className="size-4 rtl:rotate-180" stroke={1.5} />
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
              className="flex min-w-0 max-w-full items-center gap-1 text-start"
            >
              <span className="truncate text-base font-medium">
                {sessionName}
              </span>
              <IconPencil
                className="size-4 shrink-0 text-muted-foreground"
                stroke={1.5}
                aria-hidden
              />
            </button>
          )}
        </div>

        <span className="shrink-0 font-mono text-sm text-muted-foreground tabular-nums">
          {formatElapsed(now - startedAt)}
        </span>
      </header>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overflow-x-hidden overscroll-y-contain pb-28">
        {active ? (
          <section className="min-w-0 space-y-3">
            <h2 className="text-base font-medium leading-none">
              {ex?.name ?? "Exercise"}
            </h2>

            <div className="space-y-1.5">
              <p className="text-[11px] text-muted-foreground">working weight</p>
              <label className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  className="h-11 w-20 rounded-md border border-input bg-background px-2 font-mono text-sm tabular-nums outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={openWeight ?? ""}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    if (Number.isFinite(v)) setWeightForExercise(active.id, v)
                  }}
                />
                <span className="text-sm text-muted-foreground">kg</span>
              </label>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground">
                sets · tap when done
              </p>
              <div className="flex min-w-0 gap-2 overflow-x-auto overscroll-x-contain pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {active.sets.map((s) => {
                  const done = Boolean(s.completedAt)
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={done}
                      onClick={() => confirmSet(active.id, s.id)}
                      className={cn(
                        CHIP,
                        "inline-flex flex-col items-center justify-center rounded-md font-mono text-sm tabular-nums transition-colors",
                        done
                          ? "bg-success text-[#043f33]"
                          : "border border-dashed border-border bg-transparent text-muted-foreground active:bg-muted"
                      )}
                    >
                      {mixedWeights ? (
                        <span className="text-[10px] leading-none opacity-80">
                          {s.weightKg ?? "BW"}
                        </span>
                      ) : null}
                      <span className="leading-none">{s.reps}</span>
                    </button>
                  )
                })}
                <button
                  type="button"
                  aria-label="Add set"
                  onClick={() => addSet(active.id)}
                  className={cn(
                    CHIP,
                    "inline-flex items-center justify-center rounded-md border border-dashed border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  <IconPlus className="size-4" stroke={1.5} />
                </button>
              </div>

              <div className="flex min-w-0 gap-2 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {active.sets.map((s, i) => {
                  const prior = last[i]
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
                      ) : null}
                    </div>
                  )
                })}
                <div className={CHIP} aria-hidden />
              </div>
            </div>
          </section>
        ) : null}

        {upNext.length > 0 ? (
          <section className="space-y-1">
            <h3 className="mb-2 text-[11px] text-muted-foreground">up next</h3>
            <ul className="divide-y divide-border border-y border-border">
              {upNext.map((entry) => {
                const name =
                  library.find((e) => e.id === entry.exerciseId)?.name ??
                  "Exercise"
                return (
                  <li
                    key={entry.id}
                    className="flex min-h-11 items-center justify-between gap-3 py-2"
                  >
                    <span className="min-w-0 truncate text-sm text-muted-foreground">
                      {name}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                      {plannedWeight(entry.exerciseId)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        ) : null}

        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex min-h-11 w-full items-center gap-2 rounded-md text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        >
          <IconPlus className="size-4" stroke={1.5} />
          Add exercise
        </button>
      </div>

      <div
        className={cn(
          "sticky bottom-0 z-10 -mx-4 border-t border-border bg-background px-4",
          "pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]"
        )}
      >
        <Button
          size="lg"
          className="h-12 min-h-11 w-full text-base"
          onClick={() => router.push("/")}
        >
          Finish
        </Button>
      </div>

      {pickerOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/80">
          <div className="mx-auto mt-auto flex max-h-[80dvh] w-full min-w-0 max-w-lg flex-col rounded-t-xl border border-border bg-background px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-medium">Add exercise</h2>
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
                className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
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
