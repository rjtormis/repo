"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/** /workout without an id starts a new session. */
export default function WorkoutIndexPage() {
  const router = useRouter()

  useEffect(() => {
    const id = `live-${Date.now().toString(36)}`
    router.replace(`/workout/${id}`)
  }, [router])

  return (
    <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
      Starting session…
    </div>
  )
}
