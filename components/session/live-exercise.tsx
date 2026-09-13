"use client"

import { useEffect, useRef, useState } from "react"
import {
  IconCheck,
  IconChevronDown,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react"
import { SET_CHIP } from "@/components/session/constants"
import {
  formatPriorSet,
  lastTimeLabel,
  setSummary,
  weightKg,
} from "@/components/session/lib"
import { RemoveExerciseDialog } from "@/components/session/dialogs/remove-exercise-dialog"
import { SetEditorSheet } from "@/components/session/drawers/set-editor-sheet"
import { Button } from "@/components/ui/button"
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
import { Separator } from "../ui/separator"
import { Spinner } from "../ui/spinner"
import { Input } from "../ui/input"

export function LiveExercise({
  row,
  index,
  open,
  unit,
  previousSets,
  nextName,
  onActiveEntryId: _onActiveEntryId,
  onToggle,
  onNext,
  onRemove,
  onRemovePending,
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
  onActiveEntryId: (id: string | null) => void
  onToggle: () => void
  onNext?: () => void
  onRemove: () => void
  onRemovePending: boolean
  onCompleteSet: (setId: string) => Promise<void>
  onEditSet: (
    setId: string,
    weightKg: number | null,
    reps: number
  ) => Promise<void>
  onAddSet: (weightKg: number | null, reps: number) => Promise<string | void>
  onRemoveSet: (setId: string) => Promise<void>
  onWorkingWeight: (weightKg: number | null) => Promise<void>
}) {
  const sets = row.workoutSets
  const completedCount = sets.filter((setLog) => setLog.completedAt).length
  const isComplete = sets.length > 0 && completedCount === sets.length
  const previousLabel = lastTimeLabel(previousSets, unit)
  const collapsedSummary = isComplete
    ? setSummary(row, unit)
    : sets.length > 0
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
  const [removeOpen, setRemoveOpen] = useState(false)
  const [closingForRemove, setClosingForRemove] = useState(false)
  const [holdingId, setHoldingId] = useState<string | null>(null)
  const draftRef = useRef<WorkoutSetDetail | "new" | null>(null)
  const longPressTimerRef = useRef<number | null>(null)
  const suppressClickRef = useRef<string | null>(null)
  draftRef.current = draft

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
    setHoldingId(setId)
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
    setHoldingId(null)
  }

  function openEdit(setLog: WorkoutSetDetail) {
    setDraft(setLog)
  }

  function openNew() {
    setDraft("new")
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

  async function commitDraft(nextWeight: number | null, nextReps: number) {
    const current = draftRef.current
    if (current === "new") {
      const id = await onAddSet(nextWeight, nextReps)
      if (id) {
        const next = {
          id,
          position: sets.length,
          weight: nextWeight,
          reps: nextReps,
          completedAt: null,
        }
        draftRef.current = next
        setDraft(next)
      }
      return
    }
    if (!current) return
    await onEditSet(current.id, nextWeight, nextReps)
    const next = { ...current, weight: nextWeight, reps: nextReps }
    draftRef.current = next
    setDraft(next)
  }

  async function removeDraft() {
    const current = draftRef.current
    if (!current || current === "new") return
    await onRemoveSet(current.id)
    draftRef.current = null
    setDraft(null)
  }

  function startRemove() {
    setClosingForRemove(true)
    setRemoveOpen(false)
    onRemove()
  }

  const removing = closingForRemove || (onRemovePending && open)
  const bodyOpen = open && !removing
  const setCountLabel = `${completedCount} of ${sets.length} Sets`

  return (
    <section
      className={cn(
        "min-w-0 rounded-xl p-3 transition-colors duration-200 ease-(--motion-ease-out)",
        (bodyOpen || removing) && "bg-surface-1"
      )}
    >
      <Button
        variant="transparent"
        aria-expanded={bodyOpen}
        disabled={removing}
        aria-label={
          bodyOpen
            ? `Collapse ${row.exercise.name}`
            : `Expand ${row.exercise.name}`
        }
        onClick={() => {
          if (removing) return
          onToggle()
        }}
        className={`${onRemovePending ? "pointer-events-none" : ""} h-auto min-h-0 w-full min-w-0 items-start justify-start gap-2.5 p-0 text-start whitespace-normal transition-colors`}
      >
        <span className="w-6 shrink-0 pt-0.5 font-mono text-sm font-medium text-success tabular-nums">
          {removing ? (
            <Spinner className="text-destructive" />
          ) : (
            String(index + 1).padStart(2, "0")
          )}
        </span>
        <h2 className="min-w-0 flex-1 text-start text-sm font-medium">
          <span
            className={cn(
              "block truncate transition-colors duration-200 ease-(--motion-ease-out)",
              isComplete || open ? "text-foreground" : "text-muted-foreground",
              removing ? "text-destructive" : ""
            )}
          >
            {removing ? `Removing ${row.exercise.name}` : row.exercise.name}
          </span>
          {removing ? (
            <span className="mt-1 block truncate font-mono text-xs font-normal text-muted-foreground tabular-nums">
              {setCountLabel}
            </span>
          ) : !bodyOpen && collapsedSummary ? (
            <span className="mt-1 block truncate font-mono text-xs font-normal text-muted-foreground tabular-nums">
              {collapsedSummary}
            </span>
          ) : null}
        </h2>
        {isComplete ? (
          <IconCheck
            className="mt-0.5 size-5.5 shrink-0 text-success"
            stroke={1.5}
            aria-hidden
          />
        ) : null}
        <IconChevronDown
          className={cn(
            "mt-0.5 size-5.5 shrink-0 text-muted-foreground transition-transform duration-200 ease-(--motion-ease-out)",
            bodyOpen && "rotate-180"
          )}
          stroke={1.5}
          aria-hidden
        />
      </Button>
      <div
        className={cn(
          "motion-accordion",
          bodyOpen ? "motion-accordion-open" : "motion-accordion-closed"
        )}
      >
        <div className="min-h-0 overflow-hidden" inert={!bodyOpen}>
          <div className="space-y-3 pt-3">
            <div className="space-y-1.5">
              <p className="text-[11px] text-muted-foreground">
                Working weight
              </p>
              <label className="flex items-center gap-2">
                <Input
                  type="number"
                  disabled={removing}
                  aria-disabled={removing}
                  inputMode="decimal"
                  className={`border ${weightDraft === "" ? "border-destructive" : ""} h-11 w-20 appearance-none rounded-md bg-background px-2 font-mono text-sm tabular-nums outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50`}
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
              <p className="text-[11px] text-muted-foreground">
                Sets · Tap when done
              </p>
              <div className="flex min-w-0 scrollbar-none gap-2 overflow-x-auto overscroll-x-contain pb-0.5">
                {sets.map((setLog, setIndex) => {
                  const done = Boolean(setLog.completedAt)
                  const kg = weightKg(setLog.weight)
                  const holding = holdingId === setLog.id
                  return (
                    <Button
                      key={setLog.id}
                      disabled={weightDraft === ""}
                      aria-disabled={weightDraft === ""}
                      variant={done ? "set" : "set-pending"}
                      size="chip"
                      aria-pressed={done}
                      aria-label={`Set ${setIndex + 1}: ${setLog.reps} reps, ${
                        done
                          ? "completed; tap to edit"
                          : "pending; tap to complete"
                      }`}
                      className="relative overflow-hidden"
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
                    >
                      {!done ? (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 bg-success/20 motion-reduce:hidden"
                          style={{
                            clipPath: holding
                              ? "inset(0 0 0 0)"
                              : "inset(0 100% 0 0)",
                            transition: holding
                              ? "clip-path 500ms linear"
                              : "clip-path 200ms var(--motion-ease-out)",
                          }}
                        />
                      ) : null}
                      {mixedWeights ? (
                        <span className="relative text-[10px] leading-none opacity-80">
                          {formatWeight(kg, unit, { unit: false })}
                        </span>
                      ) : null}
                      <span className="relative leading-none">
                        {setLog.reps}
                      </span>
                    </Button>
                  )
                })}
                <Button
                  variant="set-pending"
                  size="chip"
                  aria-label="Add set"
                  disabled={weightDraft === ""}
                  aria-disabled={weightDraft === ""}
                  onClick={openNew}
                >
                  <IconPlus className="size-5" stroke={1.5} />
                </Button>
              </div>

              <div className="mb-0 flex min-w-0 scrollbar-none gap-2 overflow-x-auto overscroll-x-contain">
                {sets.map((setLog, setIndex) => {
                  const prior = previousSets?.[setIndex]
                  return (
                    <div
                      key={`prior-${setLog.id}`}
                      className={cn(
                        SET_CHIP,
                        "flex items-start justify-center pt-0.5"
                      )}
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
              <Separator />
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  if (completedCount === 0) {
                    startRemove()
                    return
                  }
                  setRemoveOpen(true)
                }}
                disabled={onRemovePending}
                aria-disabled={onRemovePending}
              >
                {onRemovePending ? <Spinner /> : <IconTrash />}
                Remove exercise
              </Button>
            </div>
          </div>
        </div>
      </div>

      <SetEditorSheet
        open={draft != null}
        title={draft === "new" ? "Add set" : "Edit set"}
        unit={unit}
        weightKg={
          draft && draft !== "new"
            ? weightKg(draft.weight)
            : (weightKg(sets.at(-1)?.weight ?? null) ?? openWeight)
        }
        reps={draft && draft !== "new" ? draft.reps : (sets.at(-1)?.reps ?? 8)}
        canRemove={draft != null && draft !== "new"}
        onOpenChange={(next) => {
          if (!next) setDraft(null)
        }}
        onCommit={commitDraft}
        onRemove={removeDraft}
      />
      <RemoveExerciseDialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        exerciseName={row.exercise.name}
        exerciseSets={completedCount}
        onRemovePending={onRemovePending}
        onRemove={startRemove}
      />
    </section>
  )
}
