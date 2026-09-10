import { redirect } from "next/navigation"
import HomeScreen from "@/components/home-screen"
import { getServerSession } from "@/lib/session"

export default async function HomePage() {
  const session = await getServerSession()
  if (!session) {
    redirect("/login")
  }
  // console.log(session.user.id)

  return <HomeScreen userId={session.user.id} />
}
