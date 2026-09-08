import { notFound } from "next/navigation"
import { SessionDetail } from "@/components/session-detail"
import { Shell } from "@/components/shell"
import { pastSessions, sessionById } from "@/lib/demo-data"

export default async function PastSessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = sessionById(id)
  if (!session) notFound()

  const ordered = [...pastSessions].sort(
    (a, b) =>
      new Date(b.finishedAt ?? b.startedAt).getTime() -
      new Date(a.finishedAt ?? a.startedAt).getTime()
  )
  const index = ordered.findIndex((item) => item.id === session.id)
  const previousSessionId = ordered[index + 1]?.id ?? null
  const nextSessionId = ordered[index - 1]?.id ?? null

  return (
    <Shell className="min-h-dvh pb-0">
      <SessionDetail
        key={session.id}
        session={session}
        previousSessionId={previousSessionId}
        nextSessionId={nextSessionId}
      />
    </Shell>
  )
}
