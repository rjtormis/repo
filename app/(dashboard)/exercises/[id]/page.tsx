import { redirect } from "next/navigation"
import { ExerciseDetail } from "@/components/exercise-detail"
import { Shell } from "@/components/shell"
import { getServerSession } from "@/lib/session"
import { Metadata } from "next"
import { getExerciseDetail } from "@/actions/exercises"
import { SITE } from "@/lib/meta-data"

// ─────────────────────────────────────────────────────────────
// app/exercises/[slug]/page.tsx — dynamic, public, indexable
// This is your SEO surface. Thousands of exercise pages.
// ─────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const result = await getExerciseDetail(slug)

  if (!result) {
    return { title: "Exercise not found", robots: { index: false } }
  }

  const { exercise } = result

  const title = exercise.name
  const description = `How to do ${exercise.name}. Targets ${exercise.muscleGroups.toLowerCase()}, using ${exercise.equipments.join(" and ")}. Track your sets and personal records in Repo.`

  return {
    title,
    description,
    alternates: { canonical: `/exercises/${slug}` },
    openGraph: {
      type: "article",
      title: `${title} · ${SITE.name}`,
      description,
      url: `${SITE.url}/exercises/${slug}`,
    },
    twitter: { card: "summary_large_image", title, description },
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
