import type { Metadata } from "next"
import { SettingsScreen } from "@/components/settings-screen"
import { Shell } from "@/components/shell"

export const metadata: Metadata = {
  title: "Settings — Repo",
  description: "Account, plan, appearance, and data export.",
}

export default function SettingsPage() {
  return (
    <Shell>
      <SettingsScreen />
    </Shell>
  )
}
