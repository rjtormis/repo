"use client"

import type { ReactNode } from "react"
import { IconCircleCheck, IconTrash } from "@tabler/icons-react"
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
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export type ConfirmIntent = "destructive" | "informational"

export function ConfirmDialogIcon({ intent }: { intent: ConfirmIntent }) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full",
        intent === "destructive" ? "bg-destructive/10" : "bg-muted"
      )}
      aria-hidden
    >
      {intent === "destructive" ? (
        <IconTrash className="size-4 text-destructive" stroke={1.5} />
      ) : (
        <IconCircleCheck className="size-4 text-muted-foreground" stroke={1.5} />
      )}
    </span>
  )
}

export function ConfirmDialog({
  open,
  onOpenChange,
  intent,
  title,
  description,
  truncateTitle = false,
  cancelLabel,
  actionLabel,
  onAction,
  onCancel,
  actionPending = false,
  actionDisabled = false,
  pendingLabel,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  intent: ConfirmIntent
  title: ReactNode
  description: ReactNode
  truncateTitle?: boolean
  cancelLabel: string
  actionLabel: string
  onAction: () => void
  onCancel?: () => void
  actionPending?: boolean
  actionDisabled?: boolean
  pendingLabel?: string
  children?: ReactNode
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <div className="flex min-w-0 items-start gap-3">
          <ConfirmDialogIcon intent={intent} />
          <AlertDialogHeader className="min-w-0 flex-1 place-items-start text-start">
            <AlertDialogTitle
              className={cn(
                "w-full min-w-0 select-none text-start",
                truncateTitle && "truncate"
              )}
            >
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="w-full select-none text-start">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        {children}
        <AlertDialogFooter className="grid grid-cols-2">
          <AlertDialogCancel
            variant="ghost-outline"
            className="min-h-11 w-full"
            disabled={actionPending}
            aria-disabled={actionPending}
            onClick={onCancel}
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            variant={intent === "destructive" ? "destructive-solid" : "default"}
            className="min-h-11 w-full"
            disabled={actionPending || actionDisabled}
            aria-disabled={actionPending || actionDisabled}
            onClick={onAction}
          >
            {actionPending ? (
              <>
                <Spinner /> {pendingLabel ?? actionLabel}
              </>
            ) : (
              actionLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
