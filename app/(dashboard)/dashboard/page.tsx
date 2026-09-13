import type { Metadata } from "next"
import HomeScreen from "@/components/home-screen"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your training at a glance.",
}

export default function DashboardPage() {
  return <HomeScreen />
}
