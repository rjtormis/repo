"use client"

import { useState } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export function DeleteSessionDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
}) {
  const [loading, setLoading] = useState(false)

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      intent="destructive"
      title="Delete this session?"
      description="This removes it from your history and cannot be undone."
      cancelLabel="Cancel"
      actionLabel="Delete"
      pendingLabel="Deleting..."
      actionPending={loading}
      onAction={() => {
        setLoading(true)
        void onConfirm().finally(() => setLoading(false))
      }}
    />
  )
}
