"use client"

import Link from "next/link"
import { IconChevronRight } from "@tabler/icons-react"
import { daysSince, exercisePreview, formatAgo } from "@/components/home/lib"
import { SessionsSkeleton } from "@/components/sessions/skeleton/sessions-skeleton"
import { SubpageHeader } from "@/components/subpage-header"
import { useGetSessions } from "@/hooks/tanstack/session"
import { cn } from "@/lib/utils"

export function SessionsScreen() {
  const { data, isPending } = useGetSessions()

  if (isPending) {
    return <SessionsSkeleton />
  }

  const sessions = [...(data ?? [])]
    .filter((session) => session.endedAt)
    .sort((a, b) => {
    const aAt = new Date(a.lastDoneAt ?? 0).getTime()
    const bAt = new Date(b.lastDoneAt ?? 0).getTime()
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
          {sessions.map((session) => (
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
                  {exercisePreview(session.exercises)}
                </p>
                <div className="mt-1 flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
                  <span className="font-mono tabular-nums">
                    {session.exerciseCount}{" "}
                    {session.exerciseCount === 1 ? "exercise" : "exercises"}
                    {" · "}
                    {session.setCount} {session.setCount === 1 ? "set" : "sets"}
                  </span>
                  <span className="shrink-0 font-mono tabular-nums">
                    {formatAgo(
                      daysSince(new Date(session.lastDoneAt ?? Date.now()))
                    )}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
