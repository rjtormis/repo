"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  IconChevronLeft,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { exercises as seedExercises } from "@/lib/demo-data"
import {
  MUSCLE_GROUP_ORDER,
  type Exercise,
  type MuscleGroup,
} from "@/lib/types"
import { cn } from "@/lib/utils"

export function ExerciseLibrary() {
  const [items, setItems] = useState<Exercise[]>(seedExercises)
  const [query, setQuery] = useState("")
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [newGroup, setNewGroup] = useState<MuscleGroup>("Chest")

  const q = query.trim().toLowerCase()
  const searching = q.length > 0

  const filtered = useMemo(() => {
    if (!searching) return items
    return items.filter((e) => e.name.toLowerCase().includes(q))
  }, [items, q, searching])

  const grouped = useMemo(() => {
    const map = new Map<MuscleGroup, Exercise[]>()
    for (const g of MUSCLE_GROUP_ORDER) map.set(g, [])
    for (const ex of filtered) {
      const list = map.get(ex.muscleGroup) ?? []
      list.push(ex)
      map.set(ex.muscleGroup, list)
    }
    for (const [, list] of map) {
      list.sort((a, b) => a.name.localeCompare(b.name))
    }
    return map
  }, [filtered])

  function createExercise(nameOverride?: string) {
    const name = (nameOverride ?? newName).trim()
    if (!name) return
    const id = `ex-${Math.random().toString(36).slice(2, 9)}`
    setItems((prev) => [...prev, { id, name, muscleGroup: newGroup }])
    setNewName("")
    setCreating(false)
    setQuery("")
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
      <header className="flex min-h-11 items-center gap-1 pb-3">
        <Link
          href="/"
          aria-label="Back"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <IconChevronLeft className="size-4 rtl:rotate-180" stroke={1.5} />
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-base font-medium">
          Exercises
        </h1>
        <Button
          size="sm"
          variant="secondary"
          className="min-h-11 gap-1"
          onClick={() => setCreating((v) => !v)}
        >
          <IconPlus className="size-4" stroke={1.5} data-icon="inline-start" />
          Create
        </Button>
      </header>

      <label className="relative mb-3 block">
        <IconSearch
          className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          stroke={1.5}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises"
          className="h-11 w-full min-w-0 rounded-md border border-input bg-background ps-9 pe-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>

      {creating ? (
        <div className="mb-3 flex flex-col gap-2 sm:flex-row">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Exercise name"
            className="h-11 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            onKeyDown={(e) => {
              if (e.key === "Enter") createExercise()
            }}
          />
          <select
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value as MuscleGroup)}
            className="h-11 rounded-md border border-input bg-background px-2 text-sm outline-none"
            aria-label="Muscle group"
          >
            {MUSCLE_GROUP_ORDER.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <Button className="min-h-11" onClick={() => createExercise()}>
            Add
          </Button>
        </div>
      ) : null}

      {searching && filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
          <p className="text-sm text-muted-foreground">No matches</p>
          <Button
            variant="secondary"
            className="min-h-11"
            onClick={() => createExercise(query.trim())}
          >
            <IconPlus className="size-4" stroke={1.5} data-icon="inline-start" />
            Create {query.trim()}
          </Button>
        </div>
      ) : (
        <div className="min-w-0 flex-1 overflow-y-auto">
          {MUSCLE_GROUP_ORDER.map((group) => {
            const list = grouped.get(group) ?? []
            if (list.length === 0) return null

            if (searching) {
              return (
                <ul key={group}>
                  {list.map((ex) => (
                    <ExerciseRow key={ex.id} exercise={ex} />
                  ))}
                </ul>
              )
            }

            return (
              <section key={group} className="mb-1">
                <h2
                  className={cn(
                    "sticky top-0 z-[1] bg-background py-2 text-[11px] font-medium text-muted-foreground"
                  )}
                >
                  {group}
                </h2>
                <ul>
                  {list.map((ex) => (
                    <ExerciseRow key={ex.id} exercise={ex} />
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ExerciseRow({ exercise }: { exercise: Exercise }) {
  return (
    <li className="flex min-h-11 items-center justify-between gap-3 border-b border-border/70 py-2 last:border-b-0">
      <span className="min-w-0 truncate text-sm">{exercise.name}</span>
      <span className="shrink-0 text-[11px] text-muted-foreground">
        {exercise.muscleGroup}
      </span>
    </li>
  )
}
