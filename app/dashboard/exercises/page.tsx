import { redirect } from "next/navigation"
import { ExerciseLibrary } from "@/components/exercise-library"
import { Shell } from "@/components/shell"
import { getServerSession } from "@/lib/session"

export default async function ExercisesPage() {
  const session = await getServerSession()
  if (!session) redirect("/")

  return (
    <Shell className="h-dvh max-h-dvh overflow-hidden">
      <ExerciseLibrary />
    </Shell>
  )
}
