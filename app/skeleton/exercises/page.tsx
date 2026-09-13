import { ExerciseLibrarySkeleton } from "@/components/exercise/skeleton/exercise-library-skeleton"
import { Shell } from "@/components/shell"

export default function Page() {
  return (
    <Shell className="h-dvh max-h-dvh overflow-hidden">
      <ExerciseLibrarySkeleton />
    </Shell>
  )
}
