import { SessionDetail } from "@/components/session-detail"
import { Shell } from "@/components/shell"

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
