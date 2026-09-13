"use client"

import { useEffect, useState } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Input } from "@/components/ui/input"

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
      <Input
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && nextName !== "") onSave(nextName)
        }}
        placeholder="e.g. Push day"
        className="h-11"
      />
    </ConfirmDialog>
  )
}
