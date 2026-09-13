"use client"

import { useState } from "react"
import { IconCheck } from "@tabler/icons-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function RenameSessionDialog({
  open,
  onOpenChange,
  draft,
  onDraftChange,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  draft: string
  onDraftChange: (value: string) => void
  onSave: () => Promise<void>
}) {
  const [loading, setLoading] = useState(false)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rename session</AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            Enter a new session name.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <input
          autoFocus
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          className="h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <AlertDialogFooter>
          <AlertDialogCancel
            className="min-h-11"
            disabled={loading}
            aria-disabled={loading}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="min-h-11"
            disabled={loading || draft == ""}
            aria-disabled={loading}
            variant="default"
            onClick={async (e) => {
              e.preventDefault()
              setLoading(true)
              try {
                await onSave()
              } finally {
                setLoading(false)
              }
            }}
          >
            <IconCheck /> {loading ? "Saving..." : "Save"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
