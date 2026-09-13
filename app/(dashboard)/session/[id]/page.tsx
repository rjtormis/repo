import { getSpecificSession } from "@/actions/sessions"
import { SessionDetail } from "@/components/session-detail"
import { Shell } from "@/components/shell"
import { getServerSession } from "@/lib/session"
import { Metadata } from "next"
import { redirect } from "next/navigation"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const user = await getServerSession()

  if (!user) redirect("/login")

  const session = await getSpecificSession({
    userId: user?.user.id as string,
    sessionId: id,
  })

  return {
    title: session?.name ?? "Workout",
    description: "Your logged sets for this workout.",
    robots: { index: false, follow: false },
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
