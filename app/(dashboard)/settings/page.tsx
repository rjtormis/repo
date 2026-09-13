import type { Metadata } from "next"
import { SettingsScreen } from "@/components/settings-screen"
import { Shell } from "@/components/shell"

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
}

export default function SettingsPage() {
  return (
    <Shell>
      <SettingsScreen />
    </Shell>
  )
}
