import type { Metadata } from "next"
import { SessionsScreen } from "@/components/sessions-screen"
import { Shell } from "@/components/shell"

export const metadata: Metadata = {
  title: "Sessions",
  description: "Your finished sessions, newest first.",
}

export default function SessionsPage() {
  return (
    <Shell>
      <SessionsScreen />
    </Shell>
  )
}
