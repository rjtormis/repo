"use client"

import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export function FinishWorkoutDialog({
  open,
  onOpenChange,
  unloggedExerciseCount,
  onFinish,
  onFinishPending,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  unloggedExerciseCount: number
  onFinish: () => void
  onFinishPending: boolean
}) {
  const one = unloggedExerciseCount === 1

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      intent="informational"
      title={`${unloggedExerciseCount} ${one ? "exercise has" : "exercises have"} no sets. Finish anyway?`}
      description={`Your logged sets will be kept. ${
        one
          ? "The exercise without sets won't be recorded."
          : "Exercises without sets won't be recorded."
      }`}
      cancelLabel="Keep logging"
      actionLabel="Finish anyway"
      onAction={onFinish}
      pendingLabel="Finishing..."
      actionPending={onFinishPending}
    />
  )
}
