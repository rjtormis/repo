// app/(dashboard)/layout.tsx
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/session"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()
  if (!session) redirect("/login")

  return <>{children}</>
}
