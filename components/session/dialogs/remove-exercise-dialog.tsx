"use client"

import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export function RemoveExerciseDialog({
  open,
  onOpenChange,
  exerciseName,
  exerciseSets,
  onRemove,
  onRemovePending,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  exerciseName: string
  exerciseSets: number
  onRemove?: () => void
  onRemovePending: boolean
}) {
  const setLabel = exerciseSets === 1 ? "set" : "sets"

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      intent="destructive"
      truncateTitle
      title={`Remove ${exerciseName}?`}
      description={`${exerciseSets} logged ${setLabel} will be deleted. This can't be undone once you finish the workout.`}
      cancelLabel="Cancel"
      actionLabel="Remove"
      pendingLabel="Removing..."
      actionPending={onRemovePending}
      onAction={() => onRemove?.()}
    />
  )
}
