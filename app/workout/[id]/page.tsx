import { Shell } from "@/components/shell"
import { WorkoutLogger } from "@/components/workout-logger"

export default async function ActiveWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <Shell className="overscroll-y-contain">
      <WorkoutLogger sessionId={id} />
    </Shell>
  )
}
