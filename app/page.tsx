import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { LoginScreen } from "@/components/authentication/login-screen"
import { getServerSession } from "@/lib/session"
import { SITE } from "@/lib/meta-data"

export const metadata: Metadata = {
  title: "Sign in",
  description: `Sign in to ${SITE.name} to sync your training across devices.`,
  robots: { index: false, follow: false },
}

export default async function LoginPage() {
  const session = await getServerSession()
  if (session) {
    redirect("/dashboard")
  }

  return <LoginScreen />
}
