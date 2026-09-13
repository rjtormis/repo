import { SubpageHeader } from "@/components/subpage-header"
import { Skeleton } from "@/components/ui/skeleton"

const HISTORY = [
  { title: "w-[46%]", line: "w-[72%]" },
  { title: "w-[58%]", line: "w-[64%]" },
  { title: "w-[40%]", line: "w-[78%]" },
] as const

const FACTS = ["Equipment", "Mechanics", "Region", "Difficulty"] as const

export function ExerciseDetailSkeleton() {
  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading exercise</span>
      <SubpageHeader title="Exercise" backHref="/dashboard/exercises" hideTitle />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-24">
        <div className="flex items-start gap-3 pb-5">
          <Skeleton className="size-14 shrink-0 rounded-lg bg-muted" />
          <div className="min-w-0 flex-1 pt-1">
            <Skeleton className="h-5 w-[70%]" />
            <Skeleton className="mt-2 h-3.5 w-[52%]" />
          </div>
        </div>

        <section className="pb-6" aria-hidden>
          <p className="mb-2 text-[11px] font-medium text-muted-foreground">
            Demo
          </p>
          <div className="grid grid-cols-2 gap-2">
            {["Short clip", "In-depth"].map((label) => (
              <div
                key={label}
                className="flex h-14 min-w-0 items-center gap-2.5 rounded-lg bg-surface-1 px-3"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-background">
                  <Skeleton className="size-3.5 rounded-full" />
                </span>
                <Skeleton className="h-3.5 w-16" />
              </div>
            ))}
          </div>
        </section>

        <section className="pb-6" aria-hidden>
          <p className="mb-2 text-[11px] font-medium text-muted-foreground">
            Personal record
          </p>
          <div className="flex min-h-11 flex-col gap-1 rounded-xl bg-surface-1 px-3.5 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-24" />
              <span className="shrink-0 rounded-sm bg-success/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-success">
                PR
              </span>
            </div>
            <Skeleton className="h-3 w-[68%]" />
          </div>
        </section>

        <section className="pb-6" aria-hidden>
          <p className="mb-2 text-[11px] font-medium text-muted-foreground">
            History
          </p>
          <ul className="space-y-2">
            {HISTORY.map((row, i) => (
              <li
                key={i}
                className="flex min-h-11 flex-col gap-1 rounded-xl bg-surface-1 px-3.5 py-3.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className={`h-3.5 ${row.title}`} />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className={`h-3 ${row.line}`} />
              </li>
            ))}
          </ul>
        </section>

        <dl
          className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 pb-6 text-sm"
          aria-hidden
        >
          {FACTS.map((label) => (
            <div key={label} className="contents">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="flex min-w-0 justify-end">
                <Skeleton className="h-3.5 w-24" />
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
        <Skeleton className="h-12 w-full bg-primary" />
      </div>
    </div>
  )
}
