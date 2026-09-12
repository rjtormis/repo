"use client"

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
import { IconCheck, IconTrash } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this session?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes it from your history and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="min-h-11"
            disabled={loading}
            aria-disabled={loading}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            aria-disabled={loading}
            variant="destructive"
            className="min-h-11"
            onClick={async (e) => {
              e.preventDefault()
              setLoading(true)
              try {
                await onConfirm()
              } finally {
                setLoading(false)
              }
            }}
          >
            <IconTrash /> {loading ? "Deleting..." : "Delete session"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
