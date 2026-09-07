import Link from "next/link"
import { exerciseById } from "@/lib/demo-data"
import type { Session } from "@/lib/types"

function formatDay(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(iso))
}

function setSummary(session: Session): string {
  const sets = session.entries.flatMap((e) =>
    e.sets.filter((s) => s.completedAt)
  )
  return `${sets.length} sets`
}

function exerciseNames(session: Session): string {
  return session.entries
    .map((e) => exerciseById(e.exerciseId)?.name ?? "Exercise")
    .join(" · ")
}

export function SessionCard({ session }: { session: Session }) {
  const when = session.finishedAt ?? session.startedAt
  return (
    <Link
      href={`/session/${session.id}`}
      className="block border-b border-border py-4 transition-colors last:border-b-0 hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-medium text-foreground">{session.name}</h2>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {setSummary(session)}
        </span>
      </div>
      <p className="mt-0.5 text-sm text-muted-foreground">{formatDay(when)}</p>
      <p className="mt-1 line-clamp-1 text-sm text-foreground/80">
        {exerciseNames(session)}
      </p>
    </Link>
  )
}

export function SessionList({ sessions }: { sessions: Session[] }) {
  const ranked = [...sessions].sort((a, b) => {
    const aT = a.finishedAt ?? a.startedAt
    const bT = b.finishedAt ?? b.startedAt
    return bT.localeCompare(aT)
  })

  return (
    <section aria-label="Recent sessions">
      <h2 className="mb-1 text-sm font-medium text-muted-foreground">Recent</h2>
      <div className="divide-y-0">
        {ranked.map((s) => (
          <SessionCard key={s.id} session={s} />
        ))}
      </div>
    </section>
  )
}
