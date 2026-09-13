import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const NAME_WIDTHS = [
  "w-[68%]",
  "w-[81%]",
  "w-[54%]",
  "w-[74%]",
  "w-[61%]",
  "w-[77%]",
]
const GROUP_WIDTHS = ["w-[38%]", "w-[44%]", "w-[32%]", "w-[48%]", "w-[36%]", "w-[41%"]

function ExerciseRowSkeleton({
  picker,
  index,
}: {
  picker?: boolean
  index: number
}) {
  return (
    <div
      className={cn(
        "flex min-h-12 w-full min-w-0 items-center gap-3",
        picker ? "rounded-md px-2.5 py-2" : "px-2"
      )}
    >
      <Skeleton className="size-9 shrink-0 rounded-md" />
      <div className="min-w-0 flex-1 overflow-hidden">
        <Skeleton
          className={cn("h-3.5", NAME_WIDTHS[index % NAME_WIDTHS.length])}
        />
        <Skeleton
          className={cn(
            "mt-1.5 h-2.5",
            GROUP_WIDTHS[index % GROUP_WIDTHS.length]
          )}
        />
      </div>
      <Skeleton
        className={
          picker ? "size-5 shrink-0 rounded-full" : "size-4 shrink-0 rounded-sm"
        }
      />
    </div>
  )
}

export function ExerciseListSkeleton({
  picker = false,
  stickyLabels = false,
}: {
  picker?: boolean
  stickyLabels?: boolean
}) {
  const labelClass = cn(
    "px-2 pt-2 pb-1 text-[11px] font-medium text-muted-foreground",
    stickyLabels && "sticky top-0 z-[1] bg-background"
  )

  return (
    <div
      className={cn("flex min-w-0 flex-col", picker && "gap-1.5")}
      aria-hidden
    >
      <p className={labelClass}>Recent</p>
      {Array.from({ length: 3 }, (_, i) => (
        <ExerciseRowSkeleton key={`recent-${i}`} picker={picker} index={i} />
      ))}
      <p className={labelClass}>Common</p>
      {Array.from({ length: 8 }, (_, i) => (
        <ExerciseRowSkeleton key={`common-${i}`} picker={picker} index={i + 3} />
      ))}
    </div>
  )
}
