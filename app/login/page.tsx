import type { Metadata } from "next"
import { LoginScreen } from "@/components/login-screen"

export const metadata: Metadata = {
  title: "Sync — Repo",
  description: "Back up your training logs. Optional — your data stays on this device either way.",
}

export default function LoginPage() {
  return <LoginScreen />
}
