import type { Metadata } from "next"
import { getSpecificSession } from "@/actions/sessions"
import { SessionDetail } from "@/components/session-detail"
import { Shell } from "@/components/shell"
import { getServerSession } from "@/lib/session"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const user = await getServerSession()
  if (!user) {
    return { title: "Workout" }
  }

  const session = await getSpecificSession({
    userId: user.user.id,
    sessionId: id,
  })

  return {
    title: session?.name ?? "Workout",
    description: "Your logged sets for this workout.",
  }
}

export default async function PastSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <Shell className="h-dvh max-h-dvh overflow-hidden pb-0">
      <SessionDetail sessionId={id} />
    </Shell>
  )
}
