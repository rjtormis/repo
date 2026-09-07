import Link from "next/link"
import { IconArrowLeft } from "@tabler/icons-react"
import { DEMO_NOTE, exerciseById } from "@/lib/demo-data"
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
    <div className="flex flex-1 flex-col gap-6">
      <header className="flex items-start gap-3">
        <Link
          href="/"
          aria-label="Back home"
          className="mt-0.5 inline-flex size-9 items-center justify-center rounded-md hover:bg-muted"
        >
          <IconArrowLeft className="size-5 rtl:rotate-180" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{DEMO_NOTE} · Read-only</p>
          <h1 className="text-xl font-medium">{session.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{formatWhen(when)}</p>
          <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">
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
                      <span className="font-medium tabular-nums">
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
