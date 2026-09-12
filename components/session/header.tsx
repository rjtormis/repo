"use client"

import Link from "next/link"
import { IconChevronLeft, IconDotsVertical } from "@tabler/icons-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function SessionHeader({
  name,
  dateLabel,
  onRename,
  onDelete,
  onEdit,
  editing = false,
  showEdit = false,
  exercises = 0,
}: {
  name: string
  dateLabel: string
  onRename: () => void
  onDelete: () => void
  onEdit: () => void
  editing?: boolean
  showEdit?: boolean
  exercises: number
}) {
  return (
    <header>
      <div className="flex min-w-0 items-center gap-1">
        <Link
          href="/"
          aria-label="Back"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <IconChevronLeft className="size-5.5 rtl:rotate-180" stroke={1.5} />
        </Link>

        <div className="min-w-0 flex-1 pt-2">
          <h1 className="truncate text-lg font-medium">{name}</h1>
          <p className="mt-1 truncate font-mono text-xs text-muted-foreground tabular-nums">
            {dateLabel}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label="Session options"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              />
            }
          >
            <IconDotsVertical className="size-5.5" stroke={1.5} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-auto min-w-44">
            {showEdit && exercises > 0 ? (
              <DropdownMenuItem className="min-h-11" onClick={onEdit}>
                {editing ? "Done editing" : "Edit sets"}
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem className="min-h-11" onClick={onRename}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              className="min-h-11"
              variant="destructive"
              onClick={onDelete}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
