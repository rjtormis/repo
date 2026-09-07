"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { IconArrowLeft, IconPlus, IconSearch } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { DEMO_NOTE, exercises as seedExercises } from "@/lib/demo-data"
import type { Exercise } from "@/lib/types"

export function ExerciseLibrary() {
  const [items, setItems] = useState<Exercise[]>(seedExercises)
  const [query, setQuery] = useState("")
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((e) => e.name.toLowerCase().includes(q))
  }, [items, query])

  function createExercise() {
    const name = newName.trim()
    if (!name) return
    const id = `ex-${Math.random().toString(36).slice(2, 9)}`
    setItems((prev) => [...prev, { id, name }])
    setNewName("")
    setCreating(false)
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <header className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="Back home"
          className="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted"
        >
          <IconArrowLeft className="size-5 rtl:rotate-180" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{DEMO_NOTE}</p>
          <h1 className="text-lg font-medium">Exercises</h1>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setCreating((v) => !v)}
        >
          <IconPlus data-icon="inline-start" />
          Create
        </Button>
      </header>

      <label className="relative block">
        <IconSearch className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises"
          className="h-11 w-full rounded-md border border-input bg-background ps-9 pe-3 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>

      {creating ? (
        <div className="flex gap-2">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Exercise name"
            className="h-11 min-w-0 flex-1 rounded-md border border-input bg-background px-3 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            onKeyDown={(e) => {
              if (e.key === "Enter") createExercise()
            }}
          />
          <Button onClick={createExercise}>Add</Button>
        </div>
      ) : null}

      <ul className="divide-y divide-border border-y border-border">
        {filtered.map((ex) => (
          <li key={ex.id} className="px-1 py-3.5 text-sm">
            {ex.name}
          </li>
        ))}
        {filtered.length === 0 ? (
          <li className="px-1 py-8 text-center text-sm text-muted-foreground">
            No matches. Create one above.
          </li>
        ) : null}
      </ul>
    </div>
  )
}
