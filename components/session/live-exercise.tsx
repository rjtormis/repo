"use client"

import { useEffect, useRef, useState } from "react"
import {
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconChevronUp,
  IconDots,
  IconPlus,
} from "@tabler/icons-react"
import { SET_CHIP } from "@/components/session/constants"
import {
  formatPriorSet,
  lastTimeLabel,
  setSummary,
  weightKg,
} from "@/components/session/lib"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  displayToKg,
  formatWeight,
  kgToDisplay,
  type WeightUnit,
} from "@/lib/units"
import { cn } from "@/lib/utils"
import type {
  PreviousSet,
  SessionExerciseRow,
  WorkoutSetDetail,
} from "@/types/session.types"

function padIndex(index: number) {
  return String(index + 1).padStart(2, "0")
}

export function LiveExercise({
  row,
  index,
  open,
  unit,
  previousSets,
  nextName,
  onToggle,
  onNext,
  onRemove,
  onCompleteSet,
  onEditSet,
  onAddSet,
  onRemoveSet,
  onWorkingWeight,
}: {
  row: SessionExerciseRow
  index: number
  open: boolean
  unit: WeightUnit
  previousSets?: PreviousSet[]
  nextName?: string | null
  onToggle: () => void
  onNext?: () => void
  onRemove: () => void
  onCompleteSet: (setId: string) => Promise<void>
  onEditSet: (
    setId: string,
    weightKg: number | null,
    reps: number
  ) => Promise<void>
  onAddSet: (weightKg: number | null, reps: number) => Promise<void>
  onRemoveSet: (setId: string) => Promise<void>
  onWorkingWeight: (weightKg: number | null) => Promise<void>
}) {
  const sets = row.workoutSets
  const completedCount = sets.filter((setLog) => setLog.completedAt).length
  const isComplete = sets.length > 0 && completedCount === sets.length
  const previousLabel = lastTimeLabel(previousSets, unit)
  const collapsedSummary = isComplete
    ? setSummary(row, unit)
    : completedCount > 0
      ? `${completedCount} of ${sets.length} Sets`
      : previousLabel
  const pending = sets.find((setLog) => !setLog.completedAt)
  const openWeight = weightKg(pending?.weight ?? sets[0]?.weight)
  const mixedWeights =
    new Set(sets.map((setLog) => String(weightKg(setLog.weight)))).size > 1

  const [weightDraft, setWeightDraft] = useState(
    openWeight == null ? "" : String(kgToDisplay(openWeight, unit))
  )
  const [draft, setDraft] = useState<WorkoutSetDetail | "new" | null>(null)
  const [editWeight, setEditWeight] = useState("")
  const [editReps, setEditReps] = useState("")
  const [saving, setSaving] = useState(false)
  const longPressTimerRef = useRef<number | null>(null)
  const suppressClickRef = useRef<string | null>(null)

  useEffect(() => {
    setWeightDraft(
      openWeight == null ? "" : String(kgToDisplay(openWeight, unit))
    )
  }, [openWeight, unit])

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current != null) {
        window.clearTimeout(longPressTimerRef.current)
      }
    }
  }, [])

  function startLongPress(setId: string, done: boolean) {
    if (longPressTimerRef.current != null) {
      window.clearTimeout(longPressTimerRef.current)
    }
    if (done) return
    longPressTimerRef.current = window.setTimeout(() => {
      suppressClickRef.current = setId
      const setLog = sets.find((item) => item.id === setId)
      if (setLog) openEdit(setLog)
      longPressTimerRef.current = null
    }, 500)
  }

  function clearLongPress() {
    if (longPressTimerRef.current != null) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  function openEdit(setLog: WorkoutSetDetail) {
    const kg = weightKg(setLog.weight)
    setDraft(setLog)
    setEditWeight(kg == null ? "" : String(kgToDisplay(kg, unit)))
    setEditReps(String(setLog.reps))
  }

  function openNew() {
    const last = sets.at(-1)
    const kg = last ? weightKg(last.weight) : openWeight
    setDraft("new")
    setEditWeight(kg == null ? "" : String(kgToDisplay(kg, unit)))
    setEditReps(String(last?.reps ?? 8))
  }

  async function commitWeight() {
    const typed = Number(weightDraft)
    const next =
      weightDraft.trim() === "" || !Number.isFinite(typed)
        ? null
        : displayToKg(typed, unit)
    const current = openWeight
    if (next === current) return
    await onWorkingWeight(next)
  }

  async function saveDraft() {
    const nextReps = Number(editReps)
    const typed = Number(editWeight)
    const nextWeight =
      editWeight.trim() === "" || !Number.isFinite(typed)
        ? null
        : displayToKg(typed, unit)
    if (!Number.isFinite(nextReps) || nextReps < 1) return
    setSaving(true)
    try {
      if (draft === "new") {
        await onAddSet(nextWeight, nextReps)
      } else if (draft) {
        await onEditSet(draft.id, nextWeight, nextReps)
      }
      setDraft(null)
    } finally {
      setSaving(false)
    }
  }

  async function removeDraft() {
    if (!draft || draft === "new") return
    setSaving(true)
    try {
      await onRemoveSet(draft.id)
      setDraft(null)
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        aria-expanded={false}
        aria-label={`Expand ${row.exercise.name}`}
        onClick={onToggle}
        className="flex min-h-16 w-full min-w-0 items-center gap-3 rounded-xl px-1 py-2 text-start hover:bg-muted/40"
      >
        <span className="w-6 shrink-0 self-start pt-0.5 font-mono text-sm font-medium text-success tabular-nums">
          {padIndex(index)}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block truncate text-sm",
              isComplete ? "font-medium text-foreground" : "text-muted-foreground"
            )}
          >
            {row.exercise.name}
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
    )
  }

  return (
    <section className="min-w-0 space-y-3 rounded-xl bg-surface-1 p-3">
      <div className="flex min-w-0 items-center gap-1">
        <button
          type="button"
          aria-expanded={true}
          aria-label={`Collapse ${row.exercise.name}`}
          onClick={onToggle}
          className="flex min-h-11 min-w-0 flex-1 items-center gap-2.5 text-start hover:text-foreground"
        >
          <span className="w-6 shrink-0 font-mono text-sm font-medium text-success tabular-nums">
            {padIndex(index)}
          </span>
          <h2 className="min-w-0 flex-1 truncate text-base font-medium">
            {row.exercise.name}
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
                aria-label={`Options for ${row.exercise.name}`}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              />
            }
          >
            <IconDots className="size-5.5" stroke={1.5} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant="destructive"
              onClick={onRemove}
              className="min-h-11"
            >
              Remove Exercise
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-1.5">
        <p className="text-[11px] text-muted-foreground">Working weight</p>
        <label className="flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            className="h-11 w-20 appearance-none rounded-md border border-input bg-background px-2 font-mono text-sm tabular-nums outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={weightDraft}
            onChange={(event) => setWeightDraft(event.target.value)}
            onBlur={() => {
              void commitWeight()
            }}
          />
          <span className="text-sm text-muted-foreground">{unit}</span>
        </label>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] text-muted-foreground">Sets · Tap when done</p>
        <div className="flex min-w-0 scrollbar-none gap-2 overflow-x-auto overscroll-x-contain pb-0.5">
          {sets.map((setLog, setIndex) => {
            const done = Boolean(setLog.completedAt)
            const kg = weightKg(setLog.weight)
            return (
              <button
                key={setLog.id}
                type="button"
                aria-pressed={done}
                aria-label={`Set ${setIndex + 1}: ${setLog.reps} reps, ${
                  done ? "completed; tap to edit" : "pending; tap to complete"
                }`}
                onPointerDown={() => startLongPress(setLog.id, done)}
                onPointerUp={clearLongPress}
                onPointerCancel={clearLongPress}
                onPointerLeave={clearLongPress}
                onContextMenu={(event) => event.preventDefault()}
                onClick={(event) => {
                  if (suppressClickRef.current === setLog.id) {
                    event.preventDefault()
                    suppressClickRef.current = null
                    return
                  }
                  if (done) {
                    openEdit(setLog)
                    return
                  }
                  void onCompleteSet(setLog.id)
                }}
                className={cn(
                  SET_CHIP,
                  "inline-flex flex-col items-center justify-center rounded-md font-mono text-sm tabular-nums transition-colors",
                  done
                    ? "border border-success bg-success text-emerald-950 hover:bg-success/90"
                    : "border border-dashed border-muted-foreground/50 bg-transparent text-muted-foreground hover:border-muted-foreground active:bg-muted"
                )}
              >
                {mixedWeights ? (
                  <span className="text-[10px] leading-none opacity-80">
                    {formatWeight(kg, unit, { unit: false })}
                  </span>
                ) : null}
                <span className="leading-none">{setLog.reps}</span>
              </button>
            )
          })}
          <button
            type="button"
            aria-label="Add set"
            onClick={openNew}
            className={cn(
              SET_CHIP,
              "inline-flex items-center justify-center rounded-md border border-dashed border-border text-muted-foreground hover:bg-muted"
            )}
          >
            <IconPlus className="size-5" stroke={1.5} />
          </button>
        </div>

        <div className="flex min-w-0 scrollbar-none gap-2 overflow-x-auto overscroll-x-contain">
          {sets.map((setLog, setIndex) => {
            const prior = previousSets?.[setIndex]
            return (
              <div
                key={`prior-${setLog.id}`}
                className={cn(SET_CHIP, "flex items-start justify-center pt-0.5")}
              >
                {prior ? (
                  <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                    {formatPriorSet(prior.weightKg, prior.reps, unit)}
                  </span>
                ) : (
                  <span className="sr-only">No previous set</span>
                )}
              </div>
            )
          })}
          <div className={SET_CHIP} aria-hidden />
        </div>
      </div>

      {nextName ? (
        <button
          type="button"
          onClick={onNext}
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

      <AlertDialog
        open={draft != null}
        onOpenChange={(openDialog) => {
          if (!openDialog) setDraft(null)
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
                value={editWeight}
                onChange={(event) => setEditWeight(event.target.value)}
                className="h-11 w-full rounded-md border border-input bg-background px-3 font-mono outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </label>
            <label className="min-w-0 text-sm">
              <span className="mb-1 block text-[11px] text-muted-foreground">
                reps
              </span>
              <input
                inputMode="numeric"
                value={editReps}
                onChange={(event) => setEditReps(event.target.value)}
                className="h-11 w-full rounded-md border border-input bg-background px-3 font-mono outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </label>
          </div>
          {draft && draft !== "new" ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                void removeDraft()
              }}
              className="flex min-h-11 w-full items-center border-t border-border pt-3 text-start text-sm text-destructive"
            >
              Remove Set
            </button>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11" disabled={saving}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="min-h-11"
              disabled={saving}
              onClick={(event) => {
                event.preventDefault()
                void saveDraft()
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
