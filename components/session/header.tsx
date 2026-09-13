"use client"

import Link from "next/link"
import { IconChevronLeft, IconDotsVertical } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
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
        <Button
          variant="quiet"
          size="icon-touch"
          render={<Link href="/dashboard" />}
          aria-label="Back"
        >
          <IconChevronLeft className="size-5.5 rtl:rotate-180" stroke={1.5} />
        </Button>

        <div className="min-w-0 flex-1 pt-2">
          <h1 className="truncate text-lg font-medium">{name}</h1>
          <p className="mt-1 truncate font-mono text-xs text-muted-foreground tabular-nums">
            {dateLabel}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="quiet"
                size="icon-touch"
                aria-label="Session options"
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
