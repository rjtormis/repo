import type { Metadata } from "next"
import { redirect } from "next/navigation"
import HomeScreen from "@/components/home-screen"
import { getServerSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your training at a glance.",
}

export default async function DashboardPage() {
  const session = await getServerSession()
  if (!session) {
    redirect("/")
  }

  return <HomeScreen />
}
