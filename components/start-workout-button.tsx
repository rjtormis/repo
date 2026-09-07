"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function StartWorkoutButton() {
  const router = useRouter()

  return (
    <Button
      size="lg"
      className="h-12 w-full text-base"
      onClick={() => {
        const id = `live-${Date.now().toString(36)}`
        router.push(`/workout/${id}`)
      }}
    >
      Start session
    </Button>
  )
}
