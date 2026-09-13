"use client"

import { useRef, useState } from "react"
import {
  IconDots,
  IconDotsVertical,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react"
import { MONTHS } from "@/components/session/constants"
import { completedSets, entryVolume, weightKg } from "@/components/session/lib"
import { SetEditorSheet } from "@/components/session/drawers/set-editor-sheet"
import { Button, buttonVariants } from "@/components/ui/button"
import { formatWeight, type WeightUnit } from "@/lib/units"
import { cn } from "@/lib/utils"
import type {
  ExercisePrevious,
  SessionExerciseRow,
  WorkoutSetDetail,
} from "@/types/session.types"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "../ui/spinner"
import { RemoveExerciseDialog } from "@/components/session/dialogs/remove-exercise-dialog"

export function ExerciseCard({
  row,
  unit,
  previous,
  editing,
  onEditSet,
  onAddSet,
  onRemove,
  onRemovePending,
  onRemoveSet,
}: {
  row: SessionExerciseRow
  unit: WeightUnit
  previous?: ExercisePrevious | null
  editing?: boolean
  onEditSet?: (
    setId: string,
    weightKg: number | null,
    reps: number
  ) => Promise<void>
  onAddSet?: (weightKg: number | null, reps: number) => Promise<string | void>
  onRemove?: () => void
  onRemovePending: boolean
  onRemoveSet?: (setId: string) => Promise<void>
}) {
  const sets = completedSets(row)
  const volume = entryVolume(row)
  const mixedWeights =
    new Set(sets.map((setLog) => String(weightKg(setLog.weight)))).size > 1
  const showWeight = editing || mixedWeights
  const [draft, setDraft] = useState<WorkoutSetDetail | "new" | null>(null)
  const [removeExerciseDialog, setRemoveExerciseDialog] = useState(false)
  const draftRef = useRef<WorkoutSetDetail | "new" | null>(null)

  draftRef.current = draft

  const currentBest = sets.reduce<number | null>((best, setLog) => {
    const kg = weightKg(setLog.weight)
    if (kg == null) return best
    return best == null || kg > best ? kg : best
  }, null)

  function openSet(setLog: WorkoutSetDetail) {
    if (!editing) return
    setDraft(setLog)
  }

  function openNew() {
    if (!editing) return
    setDraft("new")
  }

  async function commitDraft(nextWeight: number | null, nextReps: number) {
    const current = draftRef.current
    if (current === "new") {
      const id = await onAddSet?.(nextWeight, nextReps)
      if (id) {
        const next = {
          id,
          position: sets.length,
          weight: nextWeight,
          reps: nextReps,
          completedAt: new Date().toISOString(),
        }
        draftRef.current = next
        setDraft(next)
      }
      return
    }
    if (!current) return
    await onEditSet?.(current.id, nextWeight, nextReps)
    const next = { ...current, weight: nextWeight, reps: nextReps }
    draftRef.current = next
    setDraft(next)
  }

  async function removeDraft() {
    const current = draftRef.current
    if (!current || current === "new") return
    await onRemoveSet?.(current.id)
    draftRef.current = null
    setDraft(null)
  }

  return (
    <section className="min-w-0 space-y-3 rounded-xl bg-surface-1 p-3">
      <div className="flex justify-between">
        <div className="flex w-full justify-between">
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
          {editing ? (
            <Button
              variant="destructive"
              size="icon"
              onClick={() => {
                if (completedSets(row).length > 0) {
                  setRemoveExerciseDialog(true)
                } else {
                  onRemove?.()
                }
              }}
              aria-disabled={onRemovePending}
              disabled={onRemovePending}
            >
              {onRemovePending ? <Spinner /> : <IconTrash />}
            </Button>
          ) : null}
        </div>
      </div>

      {sets.length > 0 || editing ? (
        <div className="flex min-w-0 scrollbar-none gap-2 overflow-x-auto overscroll-x-contain pb-0.5">
          {sets.map((setLog, setIndex) => {
            const kg = weightKg(setLog.weight)
            const label = `Set ${setIndex + 1}: ${setLog.reps} reps${
              kg == null ? " at bodyweight" : ` at ${formatWeight(kg, unit)}`
            }${editing ? "; tap to edit" : ""}`
            const chip = (
              <>
                {showWeight ? (
                  <span className="text-[10px] leading-none opacity-80">
                    {kg == null
                      ? "BW"
                      : formatWeight(kg, unit, { unit: false })}
                  </span>
                ) : null}
                <span className="leading-none">{setLog.reps}</span>
              </>
            )
            return editing ? (
              <Button
                key={setLog.id}
                variant="set"
                size="chip"
                onClick={() => openSet(setLog)}
                aria-label={label}
              >
                {chip}
              </Button>
            ) : (
              <div
                key={setLog.id}
                aria-label={label}
                className={buttonVariants({ variant: "set", size: "chip" })}
              >
                {chip}
              </div>
            )
          })}
          {editing ? (
            <Button
              variant="set-pending"
              size="chip"
              onClick={openNew}
              aria-label="Add set"
            >
              <IconPlus className="size-4" stroke={1.5} />
            </Button>
          ) : null}
        </div>
      ) : (
        <p className="font-mono text-xs text-muted-foreground">
          no completed sets
        </p>
      )}

      <div className="flex min-w-0 items-end justify-between gap-3 border-t border-border pt-3">
        <p className="text-[11px] text-muted-foreground">
          {sets.length} {sets.length === 1 ? "Set" : "Sets"}
        </p>
        <div className="shrink-0 text-end">
          <p className="text-[11px] text-muted-foreground">Volume</p>
          <p className="mt-0.5 font-mono text-sm tabular-nums">
            {formatWeight(volume, unit)}
          </p>
        </div>
      </div>

      <SetEditorSheet
        open={draft != null}
        title={draft === "new" ? "Add set" : "Edit set"}
        unit={unit}
        weightKg={
          draft && draft !== "new"
            ? weightKg(draft.weight)
            : weightKg(sets.at(-1)?.weight ?? null)
        }
        reps={draft && draft !== "new" ? draft.reps : (sets.at(-1)?.reps ?? 8)}
        canRemove={draft != null && draft !== "new"}
        onOpenChange={(next) => {
          if (!next) setDraft(null)
        }}
        onCommit={commitDraft}
        onRemove={onRemoveSet ? removeDraft : undefined}
      />
      <RemoveExerciseDialog
        open={removeExerciseDialog}
        onOpenChange={setRemoveExerciseDialog}
        exerciseName={row.exercise.name}
        exerciseSets={completedSets(row).length}
        onRemovePending={onRemovePending}
        onRemove={onRemove}
      />
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
        up ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
      )}
      title={`${up ? "+" : ""}${formatWeight(delta, unit)} from ${dateLabel}`}
    >
      {up ? "+" : ""}
      {formatWeight(delta, unit)}
    </span>
  )
}
