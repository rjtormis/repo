"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import InfiniteScroll from "react-infinite-scroll-component"
import { IconChevronRight, IconSearch } from "@tabler/icons-react"
import { MuscleGroupIcon } from "@/components/session/muscle-group"
import { Switch } from "@/components/ui/switch"
import { SubpageHeader } from "@/components/subpage-header"
import { useGetExercises } from "@/hooks/tanstack/exrcise"
import type { CatalogExercise } from "@/types/exercise.types"
import {
  MUSCLE_GROUP_FILTERS,
  muscleGroupLabel,
} from "@/lib/muscle-groups"
import { cn } from "@/lib/utils"

const LIST_ID = "exercise-library-list"

export function ExerciseLibrary() {
  const [query, setQuery] = useState("")
  const [debounced, setDebounced] = useState("")
  const [muscleGroup, setMuscleGroup] = useState("")
  const [commonOnly, setCommonOnly] = useState(true)
  const [scrolling, setScrolling] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    if (!scrolling) return
    const t = window.setTimeout(() => setScrolling(false), 700)
    return () => window.clearTimeout(t)
  }, [scrolling])

  const searching = debounced.length > 0
  const { data, isPending, hasNextPage, fetchNextPage } = useGetExercises({
    query: debounced,
    muscleGroup,
    commonOnly,
  })

  const recents = data?.pages[0]?.recents ?? []
  const items = data?.pages.flatMap((page) => page.items) ?? []
  const empty = recents.length === 0 && items.length === 0

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <SubpageHeader title="Exercises" />

      <label className="relative mb-2 block shrink-0">
        <IconSearch
          className="pointer-events-none absolute inset-s-3 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground"
          stroke={1.5}
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search exercises"
          className="h-11 w-full min-w-0 rounded-md border border-input bg-background ps-9 pe-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>

      <div className="-mx-4 mb-2 flex shrink-0 gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <FilterChip
          label="All"
          selected={muscleGroup === ""}
          onClick={() => setMuscleGroup("")}
        />
        {MUSCLE_GROUP_FILTERS.map((group) => (
          <FilterChip
            key={group}
            label={muscleGroupLabel(group)}
            selected={muscleGroup === group}
            onClick={() => setMuscleGroup(group)}
          />
        ))}
      </div>

      <label
        htmlFor="exercise-library-show-all"
        className="mb-2 flex min-h-11 shrink-0 cursor-pointer items-center justify-between gap-3 px-1"
      >
        <span className="text-sm">Show all exercises</span>
        <Switch
          id="exercise-library-show-all"
          checked={!commonOnly}
          onCheckedChange={(checked) => setCommonOnly(!checked)}
        />
      </label>

      <div
        id={LIST_ID}
        onScroll={() => setScrolling(true)}
        className={cn(
          "min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain scrollbar-modern",
          scrolling && "is-scrolling"
        )}
      >
        {isPending && empty ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            Loading…
          </p>
        ) : empty ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            No matches
          </p>
        ) : (
          <InfiniteScroll
            key={`${debounced}|${muscleGroup}|${commonOnly}`}
            dataLength={items.length}
            next={() => {
              void fetchNextPage()
            }}
            hasMore={Boolean(hasNextPage)}
            loader={
              <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                Loading…
              </p>
            }
            scrollableTarget={LIST_ID}
            className="flex min-w-0 flex-col"
          >
            {recents.length > 0 ? <SectionLabel>Recent</SectionLabel> : null}
            {recents.map((item) => (
              <ExerciseRow key={`recent-${item.id}`} item={item} />
            ))}
            {items.length > 0 && recents.length > 0 ? (
              <SectionLabel>
                {commonOnly && !searching ? "Common" : "More"}
              </SectionLabel>
            ) : null}
            {items.map((item) => (
              <ExerciseRow key={item.id} item={item} />
            ))}
          </InfiniteScroll>
        )}
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="sticky top-0 z-[1] bg-background px-2 pt-2 pb-1 text-[11px] font-medium text-muted-foreground">
      {children}
    </p>
  )
}

function FilterChip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 shrink-0 rounded-md px-2.5 text-sm",
        selected
          ? "bg-foreground text-background"
          : "bg-muted text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </button>
  )
}

function ExerciseRow({ item }: { item: CatalogExercise }) {
  return (
    <Link
      href={`/exercises/${item.id}`}
      className="flex min-h-12 min-w-0 w-full items-center gap-3 rounded-md px-2 text-start text-sm hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <span
        className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground"
        aria-hidden
      >
        <MuscleGroupIcon group={item.muscleGroups} className="size-6" />
      </span>
      <span className="min-w-0 flex-1 overflow-hidden">
        <span className="block truncate">{item.name}</span>
        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
          {muscleGroupLabel(item.muscleGroups)}
        </span>
      </span>
      <IconChevronRight
        className="size-4 shrink-0 text-muted-foreground/60 rtl:rotate-180"
        stroke={1.5}
        aria-hidden
      />
    </Link>
  )
}
