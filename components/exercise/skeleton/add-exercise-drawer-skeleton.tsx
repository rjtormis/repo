import { ExerciseListSkeleton } from "@/components/exercise/skeleton/exercise-list-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

const CHIP_WIDTHS = ["w-16", "w-14", "w-20", "w-18", "w-16", "w-14"]

export function AddExerciseDrawerSkeleton() {
  return (
    <div
      className="mx-auto flex h-[68svh] w-full max-w-lg flex-col overflow-hidden rounded-t-xl bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading exercises</span>
      <div
        className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/30"
        aria-hidden
      />
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-base font-medium">Log new exercise</p>
        <Skeleton className="size-11 shrink-0 bg-destructive/10" />
      </div>
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
        <ExerciseListSkeleton picker />
      </div>
      <Skeleton className="mt-3 h-12 w-full bg-primary" />
    </div>
  )
}
