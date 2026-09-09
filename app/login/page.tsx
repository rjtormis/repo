import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { LoginScreen } from "@/components/authentication/login-screen"
import { getServerSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "Login — Repo",
  description: "Login to your Repo account.",
}

export default async function LoginPage() {
  const session = await getServerSession()
  if (session) {
    redirect("/")
  }

  return <LoginScreen />
}
