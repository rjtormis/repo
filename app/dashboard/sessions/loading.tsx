import { SessionsSkeleton } from "@/components/sessions/skeleton/sessions-skeleton"
import { Shell } from "@/components/shell"

export default function Loading() {
  return (
    <Shell>
      <SessionsSkeleton />
    </Shell>
  )
}
