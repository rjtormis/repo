import { SessionDetailSkeleton } from "@/components/session/skeleton/session-detail-skeleton"
import { Shell } from "@/components/shell"

export default function Page() {
  return (
    <Shell className="h-dvh max-h-dvh overflow-hidden pb-0">
      <SessionDetailSkeleton />
    </Shell>
  )
}
