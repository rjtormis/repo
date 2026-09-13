import { ExerciseDetailSkeleton } from "@/components/exercise/skeleton/exercise-detail-skeleton"
import { Shell } from "@/components/shell"

export default function Loading() {
  return (
    <Shell className="h-dvh max-h-dvh overflow-hidden">
      <ExerciseDetailSkeleton />
    </Shell>
  )
}
