import Link from "next/link"
import { MONTHS } from "@/components/session/constants"
import type { PersonalRecord } from "@/components/home/types"
import { formatWeight, type WeightUnit } from "@/lib/units"
import { cn } from "@/lib/utils"

export function PrList({
  records,
  unit,
}: {
  records: PersonalRecord[]
  unit: WeightUnit
}) {
  return (
    <div>
      <div className="mb-3 flex justify-end">
        <span className="shrink-0 rounded-full bg-surface-2 px-2 py-1 font-mono text-[11px] text-secondary-foreground tabular-nums">
          {records.length} {records.length === 1 ? "PR" : "PRs"}
        </span>
      </div>
      {records.length === 0 ? (
        <p className="rounded-xl bg-surface-1 px-3.5 py-3.5 text-sm text-muted-foreground">
          No weighted PRs yet. They show up when you complete a set.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {records.map((record) => (
            <li key={record.exerciseId}>
              <Link
                href={`/dashboard/session/${record.sessionId}`}
                className={cn(
                  "flex min-h-11 flex-col gap-1 rounded-xl bg-surface-1 px-3.5 py-3.5 transition-colors",
                  "hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                )}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <h3
                    className="min-w-0 flex-1 truncate text-base font-medium"
                    title={record.exerciseName}
                  >
                    {record.exerciseName}
                  </h3>
                  <span className="shrink-0 rounded-sm bg-success/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-success">
                    PR
                  </span>
                </div>
                <p className="min-w-0 truncate font-mono text-xs text-muted-foreground tabular-nums">
                  {formatWeight(record.weightKg, unit)} × {record.reps}
                </p>
                <p className="mt-1 min-w-0 truncate font-mono text-xs text-muted-foreground tabular-nums">
                  {deltaLabel(record, unit)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function formatShortDate(iso: string) {
  const date = new Date(iso)
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`
}

function deltaLabel(record: PersonalRecord, unit: WeightUnit) {
  const previous = record.previous
  if (!previous) return "first record"

  const when = formatShortDate(previous.achievedAt)
  const weightDelta = record.weightKg - previous.weightKg
  if (weightDelta > 0) {
    return `+${formatWeight(weightDelta, unit)} from ${when}`
  }

  const repDelta = record.reps - previous.reps
  if (repDelta > 0) {
    return `+${repDelta} ${repDelta === 1 ? "rep" : "reps"} from ${when}`
  }

  return `same as ${when}`
}
