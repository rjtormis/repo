import type { Metadata } from "next"
import { SettingsScreen } from "@/components/settings-screen"
import { Shell } from "@/components/shell"

export const metadata: Metadata = {
  title: "Settings",
  description: "Account, plan, appearance, and data export.",
  robots: { index: false, follow: false },
}

export default function SettingsPage() {
  return (
    <Shell>
      <SettingsScreen />
    </Shell>
  )
}
