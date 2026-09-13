"use client"

import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export function DiscardSessionDialog({
  open,
  onOpenChange,
  onDiscard,
  discardPending,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDiscard: () => void
  discardPending?: boolean
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      intent="destructive"
      title="No sets logged."
      description="Discard this workout? Nothing was recorded, so this session won't be saved."
      cancelLabel="Keep logging"
      actionLabel="Discard"
      pendingLabel="Discarding..."
      actionPending={discardPending}
      onAction={onDiscard}
    />
  )
}
