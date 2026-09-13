import { SubpageHeader } from "@/components/subpage-header"
import { Skeleton } from "@/components/ui/skeleton"

const CARDS = [
  { title: "w-[58%]", preview: "w-[78%]", meta: "w-28" },
  { title: "w-[46%]", preview: "w-[64%]", meta: "w-24" },
  { title: "w-[70%]", preview: "w-[82%]", meta: "w-32" },
  { title: "w-[52%]", preview: "w-[71%]", meta: "w-24" },
  { title: "w-[63%]", preview: "w-[55%]", meta: "w-28" },
] as const

export function SessionsSkeleton() {
  return (
    <div
      className="flex min-w-0 flex-1 flex-col overflow-x-hidden"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading sessions</span>
      <SubpageHeader title="Sessions" />
      <ul className="space-y-2.5" aria-hidden>
        {CARDS.map((card, i) => (
          <li
            key={i}
            className="flex min-h-11 flex-col gap-1 rounded-xl bg-surface-1 px-3.5 py-3.5"
          >
            <div className="flex min-w-0 items-center gap-2">
              <Skeleton className={`h-5 min-w-0 flex-1 ${card.title}`} />
              <Skeleton className="size-5 shrink-0 rounded-sm" />
            </div>
            <Skeleton className={`h-3 ${card.preview}`} />
            <div className="mt-1 flex items-center justify-between gap-3">
              <Skeleton className={`h-3 ${card.meta}`} />
              <Skeleton className="h-3 w-16" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
