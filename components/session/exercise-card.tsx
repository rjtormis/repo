"use client"

import { useState } from "react"
import { MONTHS, SET_CHIP } from "@/components/session/constants"
import {
  completedSets,
  entryVolume,
  weightKg,
} from "@/components/session/lib"
import { IconPlus } from "@tabler/icons-react"
import {
  displayToKg,
  formatWeight,
  kgToDisplay,
  type WeightUnit,
} from "@/lib/units"
import { cn } from "@/lib/utils"
import type {
  ExercisePrevious,
  SessionExerciseRow,
  WorkoutSetDetail,
} from "@/types/session.types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function ExerciseCard({
  row,
  unit,
  previous,
  editing,
  onEditSet,
  onAddSet,
}: {
  row: SessionExerciseRow
  unit: WeightUnit
  previous?: ExercisePrevious | null
  editing?: boolean
  onEditSet?: (setId: string, weightKg: number | null, reps: number) => Promise<void>
  onAddSet?: (weightKg: number | null, reps: number) => Promise<void>
}) {
  const sets = completedSets(row)
  const volume = entryVolume(row)
  const mixedWeights =
    new Set(sets.map((setLog) => String(weightKg(setLog.weight)))).size > 1
  const showWeight = editing || mixedWeights
  const [draft, setDraft] = useState<WorkoutSetDetail | "new" | null>(null)
  const [weight, setWeight] = useState("")
  const [reps, setReps] = useState("")
  const [saving, setSaving] = useState(false)

  const currentBest = sets.reduce<number | null>((best, setLog) => {
    const kg = weightKg(setLog.weight)
    if (kg == null) return best
    return best == null || kg > best ? kg : best
  }, null)

  function fillFrom(setLog?: WorkoutSetDetail) {
    const kg = setLog ? weightKg(setLog.weight) : null
    setWeight(kg == null ? "" : String(kgToDisplay(kg, unit)))
    setReps(String(setLog?.reps ?? 8))
  }

  function openSet(setLog: WorkoutSetDetail) {
    if (!editing) return
    setDraft(setLog)
    fillFrom(setLog)
  }

  function openNew() {
    if (!editing) return
    setDraft("new")
    fillFrom(sets.at(-1))
  }

  async function saveSet() {
    const nextReps = Number(reps)
    const typed = Number(weight)
    const nextWeight =
      weight.trim() === "" || !Number.isFinite(typed)
        ? null
        : displayToKg(typed, unit)
    if (!Number.isFinite(nextReps) || nextReps < 1) return
    setSaving(true)
    try {
      if (draft === "new") {
        await onAddSet?.(nextWeight, nextReps)
      } else if (draft) {
        await onEditSet?.(draft.id, nextWeight, nextReps)
      }
      setDraft(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="min-w-0 space-y-3 rounded-xl bg-surface-1 p-3">
      <div className="flex min-w-0 items-center gap-2">
        <h2 className="min-w-0 truncate text-base font-medium">
          {row.exercise.name}
        </h2>
        {previous ? (
          <DeltaBadge
            currentKg={currentBest}
            previous={previous}
            unit={unit}
          />
        ) : null}
      </div>

      {sets.length > 0 || editing ? (
        <div className="flex min-w-0 scrollbar-none gap-2 overflow-x-auto overscroll-x-contain pb-0.5">
          {sets.map((setLog, setIndex) => {
            const kg = weightKg(setLog.weight)
            const chipClass = `${SET_CHIP} inline-flex flex-col items-center justify-center rounded-md border border-success bg-success font-mono text-sm text-emerald-950 tabular-nums`
            const label = `Set ${setIndex + 1}: ${setLog.reps} reps${
              kg == null
                ? " at bodyweight"
                : ` at ${formatWeight(kg, unit)}`
            }${editing ? "; tap to edit" : ""}`
            return editing ? (
              <button
                key={setLog.id}
                type="button"
                onClick={() => openSet(setLog)}
                aria-label={label}
                className={chipClass}
              >
                {showWeight ? (
                  <span className="text-[10px] leading-none opacity-80">
                    {kg == null
                      ? "BW"
                      : formatWeight(kg, unit, { unit: false })}
                  </span>
                ) : null}
                <span className="leading-none">{setLog.reps}</span>
              </button>
            ) : (
              <div key={setLog.id} aria-label={label} className={chipClass}>
                {showWeight ? (
                  <span className="text-[10px] leading-none opacity-80">
                    {kg == null
                      ? "BW"
                      : formatWeight(kg, unit, { unit: false })}
                  </span>
                ) : null}
                <span className="leading-none">{setLog.reps}</span>
              </div>
            )
          })}
          {editing ? (
            <button
              type="button"
              onClick={openNew}
              aria-label="Add set"
              className={`${SET_CHIP} inline-flex items-center justify-center rounded-md border border-dashed border-muted-foreground/50 text-muted-foreground hover:border-muted-foreground hover:text-foreground`}
            >
              <IconPlus className="size-4" stroke={1.5} />
            </button>
          ) : null}
        </div>
      ) : (
        <p className="font-mono text-xs text-muted-foreground">
          no completed sets
        </p>
      )}

      <div className="flex min-w-0 items-end justify-between gap-3 border-t border-border pt-3">
        <p className="text-[11px] text-muted-foreground">
          {sets.length} {sets.length === 1 ? "set" : "sets"}
        </p>
        <div className="shrink-0 text-end">
          <p className="text-[11px] text-muted-foreground">volume</p>
          <p className="mt-0.5 font-mono text-sm tabular-nums">
            {formatWeight(volume, unit)}
          </p>
        </div>
      </div>

      <AlertDialog
        open={draft != null}
        onOpenChange={(open) => {
          if (!open) setDraft(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {draft === "new" ? "Add set" : "Edit set"}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <label className="min-w-0 text-sm">
              <span className="mb-1 block text-[11px] text-muted-foreground">
                weight ({unit})
              </span>
              <input
                inputMode="decimal"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                className="h-11 w-full rounded-md border border-input bg-background px-3 font-mono outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </label>
            <label className="min-w-0 text-sm">
              <span className="mb-1 block text-[11px] text-muted-foreground">
                reps
              </span>
              <input
                inputMode="numeric"
                value={reps}
                onChange={(event) => setReps(event.target.value)}
                className="h-11 w-full rounded-md border border-input bg-background px-3 font-mono outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11" disabled={saving}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="min-h-11"
              disabled={saving}
              onClick={(event) => {
                event.preventDefault()
                void saveSet()
              }}
            >
              {saving ? "Saving…" : "Save"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

function DeltaBadge({
  currentKg,
  previous,
  unit,
}: {
  currentKg: number | null
  previous?: ExercisePrevious | null
  unit: WeightUnit
}) {
  if (currentKg == null || !previous) return null

  const delta = currentKg - previous.weightKg
  const when = new Date(previous.achievedAt)
  const dateLabel = `${MONTHS[when.getMonth()]} ${when.getDate()}`

  if (delta === 0) {
    return (
      <span
        className="ms-auto shrink-0 rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground tabular-nums"
        title={`same as ${dateLabel}`}
      >
        same
      </span>
    )
  }

  const up = delta > 0
  return (
    <span
      className={cn(
        "ms-auto shrink-0 rounded-sm px-1.5 py-0.5 font-mono text-[10px] tabular-nums",
        up
          ? "bg-success/15 text-success"
          : "bg-muted text-muted-foreground"
      )}
      title={`${up ? "+" : ""}${formatWeight(delta, unit)} from ${dateLabel}`}
    >
      {up ? "+" : ""}
      {formatWeight(delta, unit)}
    </span>
  )
}
