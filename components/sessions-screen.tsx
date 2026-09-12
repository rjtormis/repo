"use client"

import Link from "next/link"
import { IconChevronRight } from "@tabler/icons-react"
import { SubpageHeader } from "@/components/subpage-header"
import { exerciseById, pastSessions } from "@/lib/demo-data"
import { cn } from "@/lib/utils"

function daysSince(iso: string): number {
  const then = new Date(iso)
  then.setHours(12, 0, 0, 0)
  const now = new Date()
  now.setHours(12, 0, 0, 0)
  return Math.round((now.getTime() - then.getTime()) / 86_400_000)
}

function formatAgo(days: number): string {
  if (days === 0) return "today"
  if (days === 1) return "1 day ago"
  return `${days} days ago`
}

export function SessionsScreen() {
  const sessions = [...pastSessions].sort((a, b) => {
    const aAt = new Date(a.finishedAt ?? a.startedAt).getTime()
    const bAt = new Date(b.finishedAt ?? b.startedAt).getTime()
    return bAt - aAt
  })

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
      <SubpageHeader title="Sessions" />

      {sessions.length === 0 ? (
        <p className="px-1 py-8 text-sm text-muted-foreground">
          Finished sessions will show up here.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {sessions.map((session) => {
            const labels = session.entries.map(
              (entry) => exerciseById(entry.exerciseId)?.name ?? "Exercise"
            )
            const setCount = session.entries.reduce(
              (sum, entry) =>
                sum + entry.sets.filter((s) => s.completedAt).length,
              0
            )
            const when = session.finishedAt ?? session.startedAt

            return (
              <li key={session.id}>
                <Link
                  href={`/dashboard/session/${session.id}`}
                  className={cn(
                    "flex min-h-11 flex-col gap-1 rounded-xl bg-surface-1 px-3.5 py-3.5 transition-colors",
                    "hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <h2
                      className="min-w-0 flex-1 truncate text-base font-medium"
                      title={session.name}
                    >
                      {session.name}
                    </h2>
                    <IconChevronRight
                      className="size-5 shrink-0 text-muted-foreground rtl:rotate-180"
                      stroke={1.5}
                      aria-hidden
                    />
                  </div>
                  <p className="min-w-0 truncate font-mono text-xs text-muted-foreground">
                    {labels.join(" · ")}
                  </p>
                  <div className="mt-1 flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
                    <span className="font-mono tabular-nums">
                      {session.entries.length}{" "}
                      {session.entries.length === 1 ? "exercise" : "exercises"}
                      {" · "}
                      {setCount} {setCount === 1 ? "set" : "sets"}
                    </span>
                    <span className="shrink-0 font-mono tabular-nums">
                      {formatAgo(daysSince(when))}
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
