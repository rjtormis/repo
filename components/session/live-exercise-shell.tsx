"use client"

import { IconChevronDown } from "@tabler/icons-react"
import { Spinner } from "@/components/ui/spinner"

export function LiveExerciseShell({
  index,
  name,
  summary,
  pending = false,
}: {
  index: number
  name: string
  summary?: string | null
  pending?: boolean
}) {
  return (
    <section
      className="min-w-0 rounded-xl p-3"
      aria-busy={pending}
      aria-label={pending ? `Adding ${name}` : name}
    >
      <div className="flex h-auto min-h-0 w-full min-w-0 items-start justify-start gap-2.5 text-start whitespace-normal">
        <span className="w-6 shrink-0 pt-0.5 font-mono text-sm font-medium text-success tabular-nums">
          {pending ? (
            <Spinner className="text-muted-foreground" />
          ) : (
            String(index + 1).padStart(2, "0")
          )}
        </span>
        <h2 className="min-w-0 flex-1 text-start text-sm font-medium">
          <span className="block truncate text-muted-foreground">{name}</span>
          {summary ? (
            <span className="mt-1 block truncate font-mono text-xs font-normal text-muted-foreground tabular-nums">
              {summary}
            </span>
          ) : null}
        </h2>
        <IconChevronDown
          className="mt-0.5 size-5.5 shrink-0 text-muted-foreground"
          stroke={1.5}
          aria-hidden
        />
      </div>
    </section>
  )
}
