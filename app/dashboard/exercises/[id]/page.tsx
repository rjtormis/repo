import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getExerciseDetail } from "@/actions/exercises"
import { ExerciseDetail } from "@/components/exercise-detail"
import { Shell } from "@/components/shell"
import { getServerSession } from "@/lib/session"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  try {
    const result = await getExerciseDetail(id)
    if (!result) {
      return { title: "Exercise not found" }
    }

    const { exercise } = result
    const equipment = exercise.equipments.length
      ? exercise.equipments.join(" and ")
      : "bodyweight"
    const description = `How to do ${exercise.name}. Targets ${String(exercise.muscleGroups).toLowerCase()}, using ${equipment}.`

    return {
      title: exercise.name,
      description,
    }
  } catch {
    return { title: "Exercise" }
  }
}

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession()
  if (!session) redirect("/")

  const { id } = await params

  return (
    <Shell className="h-dvh max-h-dvh overflow-hidden">
      <ExerciseDetail exerciseId={id} />
    </Shell>
  )
}
