import type { Metadata } from "next"
import { LeaderboardScreen } from "@/components/leaderboard-screen"
import { Shell } from "@/components/shell"

export const metadata: Metadata = {
  title: "Leaderboard — Repo",
  description: "Heaviest logged set on each movement.",
}

export default function LeaderboardPage() {
  return (
    <Shell>
      <LeaderboardScreen />
    </Shell>
  )
}
