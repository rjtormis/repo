import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { SignUpScreen } from "@/components/authentication/sign-up-screen"
import { getServerSession } from "@/lib/session"
import { SITE } from "@/lib/meta-data"

export const metadata: Metadata = {
  title: "Sign up",
  description: `Create a ${SITE.name} account to sync your training across devices.`,
  robots: { index: false, follow: false },
}

export default async function SignUpPage() {
  const session = await getServerSession()
  if (session) {
    redirect("/dashboard")
  }

  return <SignUpScreen />
}
