import { redirect } from "next/navigation"
import { SignUpScreen } from "@/components/authentication/sign-up-screen"
import { getServerSession } from "@/lib/session"

export default async function SignUpPage() {
  const session = await getServerSession()
  if (session) {
    redirect("/")
  }

  return <SignUpScreen />
}
