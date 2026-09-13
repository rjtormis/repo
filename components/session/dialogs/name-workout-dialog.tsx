"use client"

import { useEffect, useState } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export function NameWorkoutDialog({
  open,
  onOpenChange,
  onSave,
  onSkip,
  onSavePending,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (name: string) => void
  onSkip: () => void
  onSavePending: boolean
}) {
  const [draft, setDraft] = useState("")

  useEffect(() => {
    if (open) setDraft("")
  }, [open])

  const nextName = draft.trim()

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      intent="informational"
      title="Name this workout"
      description="So you can find it again. You can skip this."
      cancelLabel="Skip"
      actionLabel="Save"
      pendingLabel="Saving..."
      actionPending={onSavePending}
      actionDisabled={nextName === ""}
      onAction={() => onSave(nextName)}
      onCancel={onSkip}
    >
      <input
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && nextName !== "") onSave(nextName)
        }}
        placeholder="e.g. Push day"
        className="h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
    </ConfirmDialog>
  )
}
