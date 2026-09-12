import { redirect } from "next/navigation"
import { ExerciseDetail } from "@/components/exercise-detail"
import { Shell } from "@/components/shell"
import { getServerSession } from "@/lib/session"

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
