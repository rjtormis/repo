"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { IconPlus, IconSearch, IconCheck } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  DEMO_NOTE,
  exercises as seedExercises,
  lastSetsForExercise,
} from "@/lib/demo-data"
import type { Exercise, ExerciseEntry, SetLog } from "@/lib/types"
import { cn } from "@/lib/utils"

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
  const weight = last[0]?.weightKg ?? 0
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

function formatLoad(weightKg: number | null, reps: number) {
  if (weightKg == null) return `BW × ${reps}`
  return `${weightKg} kg × ${reps}`
}

export function WorkoutLogger({ sessionId }: { sessionId: string }) {
  const [library] = useState<Exercise[]>(seedExercises)
  const [entries, setEntries] = useState<ExerciseEntry[]>(() => [
    entryFromExercise("ex-bench"),
  ])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [query, setQuery] = useState("")

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
            s.id === setId
              ? { ...s, completedAt: new Date().toISOString() }
              : s
          ),
        }
      })
    )
  }

  function addExercise(exerciseId: string) {
    setEntries((prev) => [...prev, entryFromExercise(exerciseId)])
    setPickerOpen(false)
    setQuery("")
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overscroll-y-contain">
      <header className="flex items-center justify-between gap-3 pb-4">
        <div>
          <p className="text-xs text-muted-foreground">{DEMO_NOTE}</p>
          <h1 className="text-lg font-medium">Session</h1>
          <p className="font-mono text-xs text-muted-foreground">{sessionId}</p>
        </div>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/" />}>
          Done
        </Button>
      </header>

      <div className="flex-1 space-y-8 overflow-y-auto overscroll-y-contain pb-24">
        {entries.map((entry) => {
          const ex = library.find((e) => e.id === entry.exerciseId)
          const last = lastSetsForExercise(entry.exerciseId)
          const openWeight =
            entry.sets.find((s) => !s.completedAt)?.weightKg ??
            entry.sets[0]?.weightKg ??
            0

          return (
            <section key={entry.id} className="space-y-3">
              <div className="flex items-end justify-between gap-3">
                <h2 className="text-base font-medium">{ex?.name ?? "Exercise"}</h2>
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">kg</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="h-10 w-20 rounded-md border border-input bg-background px-2 text-end tabular-nums outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    value={openWeight ?? ""}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      if (Number.isFinite(v)) setWeightForExercise(entry.id, v)
                    }}
                  />
                </label>
              </div>

              <ul className="space-y-2">
                {entry.sets.map((s, i) => {
                  const prior = last[i]
                  const done = Boolean(s.completedAt)
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        disabled={done}
                        onClick={() => confirmSet(entry.id, s.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md border px-3 py-3 text-start transition-colors",
                          done
                            ? "border-primary/30 bg-primary/10"
                            : "border-border bg-background active:bg-muted"
                        )}
                      >
                        <span className="w-6 text-sm text-muted-foreground tabular-nums">
                          {i + 1}
                        </span>
                        <span className="flex-1">
                          <span className="block text-base font-medium tabular-nums">
                            {formatLoad(s.weightKg, s.reps)}
                          </span>
                          {prior ? (
                            <span className="mt-0.5 block text-xs text-muted-foreground tabular-nums">
                              Last {formatLoad(prior.weightKg, prior.reps)}
                            </span>
                          ) : (
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              No prior set
                            </span>
                          )}
                        </span>
                        {done ? (
                          <IconCheck className="size-5 text-primary" />
                        ) : (
                          <span className="text-sm text-primary">Tap</span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>

      <div className="sticky bottom-0 border-t border-border bg-background pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Button
          variant="secondary"
          className="h-12 w-full"
          onClick={() => setPickerOpen(true)}
        >
          <IconPlus data-icon="inline-start" />
          Add exercise
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          <Link href="/exercises" className="underline-offset-2 hover:underline">
            Exercise library
          </Link>
        </p>
      </div>

      {pickerOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/80 backdrop-blur-sm">
          <div className="mx-auto mt-auto flex max-h-[80dvh] w-full max-w-lg flex-col rounded-t-xl border border-border bg-background px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-medium">Add exercise</h2>
              <Button variant="ghost" size="sm" onClick={() => setPickerOpen(false)}>
                Close
              </Button>
            </div>
            <label className="relative mb-3 block">
              <IconSearch className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="h-11 w-full rounded-md border border-input bg-background ps-9 pe-3 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </label>
            <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto">
              {filtered.map((ex) => (
                <li key={ex.id}>
                  <button
                    type="button"
                    className="flex w-full rounded-md px-3 py-3 text-start text-sm hover:bg-muted"
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
