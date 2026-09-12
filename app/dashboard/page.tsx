import { redirect } from "next/navigation"
import HomeScreen from "@/components/home-screen"
import { getServerSession } from "@/lib/session"

export default async function DashboardPage() {
  const session = await getServerSession()
  if (!session) {
    redirect("/")
  }

  return <HomeScreen />
}
