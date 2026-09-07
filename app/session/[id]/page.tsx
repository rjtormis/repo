import { notFound } from "next/navigation"
import { SessionDetail } from "@/components/session-detail"
import { Shell } from "@/components/shell"
import { sessionById } from "@/lib/demo-data"

export default async function PastSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = sessionById(id)
  if (!session) notFound()

  return (
    <Shell>
      <SessionDetail session={session} />
    </Shell>
  )
}
