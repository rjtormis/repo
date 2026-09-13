import { ExerciseListSkeleton } from "@/components/exercise/skeleton/exercise-list-skeleton"
import { SubpageHeader } from "@/components/subpage-header"
import { Skeleton } from "@/components/ui/skeleton"

const CHIP_WIDTHS = ["w-16", "w-14", "w-20", "w-18", "w-16", "w-14"]

export function ExerciseLibrarySkeleton() {
  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading exercises</span>
      <SubpageHeader title="Exercises" />
      <Skeleton className="mb-2 h-11 w-full" />
      <div className="mb-2 flex gap-1.5 overflow-hidden pb-1" aria-hidden>
        <Skeleton className="h-9 w-12 shrink-0 bg-foreground" />
        {CHIP_WIDTHS.map((width, i) => (
          <Skeleton key={i} className={`h-9 shrink-0 ${width}`} />
        ))}
      </div>
      <div className="mb-2 flex min-h-11 items-center justify-between gap-3 px-1">
        <span className="text-sm">Show all exercises</span>
        <Skeleton className="h-5 w-9 rounded-full" />
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <ExerciseListSkeleton stickyLabels />
      </div>
    </div>
  )
}
