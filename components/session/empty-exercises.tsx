"use client"

import { IconBarbell, IconPlus } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

export function EmptyExercises({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-10 text-center">
      <IconBarbell
        className="size-10 text-muted-foreground"
        stroke={1.4}
        aria-hidden
      />
      <h2 className="mt-4 text-lg font-medium">No exercise log</h2>
      <p className="mt-1.5 max-w-56 text-sm text-muted-foreground">
        Nothing logged for this session yet. Add the first lift to start.
      </p>
      <Button className="mt-5 min-h-11" onClick={onAdd}>
        <IconPlus className="size-5" stroke={1.5} data-icon="inline-start" />
        Log new exercise
      </Button>
    </div>
  )
}
