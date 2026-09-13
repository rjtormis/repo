import { redirect } from "next/navigation"
import { ExerciseLibrary } from "@/components/exercise-library"
import { Shell } from "@/components/shell"
import { getServerSession } from "@/lib/session"

import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Exercises",
  description: "Browse and search the exercise library.",
}

export default async function ExercisesPage() {
  const session = await getServerSession()
  if (!session) redirect("/")

  return (
    <Shell className="h-dvh max-h-dvh overflow-hidden">
      <ExerciseLibrary />
    </Shell>
  )
}
