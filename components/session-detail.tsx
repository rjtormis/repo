import Link from "next/link"
import { IconChevronLeft } from "@tabler/icons-react"
import { exerciseById } from "@/lib/demo-data"
import type { Session } from "@/lib/types"

function formatLoad(weightKg: number | null, reps: number) {
  if (weightKg == null) return `BW × ${reps}`
  return `${weightKg} kg × ${reps}`
}

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso))
}

export function SessionDetail({ session }: { session: Session }) {
  const when = session.finishedAt ?? session.startedAt
  const setCount = session.entries.reduce(
    (n, e) => n + e.sets.filter((s) => s.completedAt).length,
    0
  )

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6 overflow-x-hidden">
      <header className="flex items-start gap-1">
        <Link
          href="/"
          aria-label="Back"
          className="mt-0.5 inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <IconChevronLeft className="size-4 rtl:rotate-180" stroke={1.5} />
        </Link>
        <div className="min-w-0 flex-1 pt-2">
          <h1 className="text-xl font-medium">{session.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{formatWhen(when)}</p>
          <p className="mt-0.5 font-mono text-sm text-muted-foreground tabular-nums">
            {setCount} sets logged
          </p>
        </div>
      </header>

      <div className="space-y-8">
        {session.entries.map((entry) => {
          const ex = exerciseById(entry.exerciseId)
          return (
            <section key={entry.id}>
              <h2 className="mb-3 text-base font-medium">
                {ex?.name ?? "Exercise"}
              </h2>
              <ol className="space-y-2">
                {entry.sets
                  .filter((s) => s.completedAt)
                  .map((s, i) => (
                    <li
                      key={s.id}
                      className="flex items-baseline justify-between gap-3 border-b border-border py-2 text-sm last:border-b-0"
                    >
                      <span className="text-muted-foreground tabular-nums">
                        Set {i + 1}
                      </span>
                      <span className="font-mono font-medium tabular-nums">
                        {formatLoad(s.weightKg, s.reps)}
                      </span>
                    </li>
                  ))}
              </ol>
            </section>
          )
        })}
      </div>
    </div>
  )
}
