"use client"

import { useEffect, useState, type CSSProperties } from "react"
import InfiniteScroll from "react-infinite-scroll-component"
import {
  IconCircle,
  IconCircleCheck,
  IconSearch,
  IconX,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { MuscleGroupIcon } from "@/components/session/muscle-group"
import { MUSCLE_GROUP_FILTERS, muscleGroupLabel } from "@/lib/muscle-groups"
import { useGetExercises } from "@/hooks/tanstack/exrcise"
import type { CatalogExercise } from "@/types/exercise.types"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"
import { Input } from "@/components/ui/input"

const LIST_ID = "add-exercise-list"
const SHEET_MAX_PX = 32 * 16
const SHEET_RATIO = 0.68

function usePhoneSheetHeight(open: boolean) {
  const [height, setHeight] = useState<number | null>(null)

  useEffect(() => {
    if (!open) return

    const measure = () => {
      const visible = window.visualViewport?.height ?? window.innerHeight
      const gap = 8
      const usable = Math.max(240, visible - gap)
      setHeight(Math.min(usable * SHEET_RATIO, SHEET_MAX_PX, usable))
    }

    measure()
    const viewport = window.visualViewport
    viewport?.addEventListener("resize", measure)
    viewport?.addEventListener("scroll", measure)
    window.addEventListener("resize", measure)
    return () => {
      viewport?.removeEventListener("resize", measure)
      viewport?.removeEventListener("scroll", measure)
      window.removeEventListener("resize", measure)
    }
  }, [open])

  return height
}

export function AddExerciseDrawer({
  open,
  onOpenChange,
  onSelect,
  isLoading,
  selectedExercises,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect?: (exercises: CatalogExercise[]) => void
  isLoading: boolean
  selectedExercises?: CatalogExercise[]
}) {
  const [query, setQuery] = useState("")
  const [debounced, setDebounced] = useState("")
  const [muscleGroup, setMuscleGroup] = useState("")
  const [commonOnly, setCommonOnly] = useState(true)
  const [selected, setSelected] = useState<Record<string, CatalogExercise>>({})
  const [scrolling, setScrolling] = useState(false)
  const sheetHeight = usePhoneSheetHeight(open)

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
    enabled: open,
  })

  const recents = data?.pages[0]?.recents ?? []
  const items = data?.pages.flatMap((page) => page.items) ?? []
  const selectedList = Object.values(selected)
  const selectedCount = selectedList.length
  const empty = recents.length === 0 && items.length === 0

  function reset() {
    setQuery("")
    setDebounced("")
    setMuscleGroup("")
    setCommonOnly(true)
    setSelected({})
  }

  function close() {
    reset()
    onOpenChange(false)
  }

  function toggle(exercise: CatalogExercise) {
    setSelected((current) => {
      const next = { ...current }
      if (next[exercise.id]) delete next[exercise.id]
      else next[exercise.id] = exercise
      return next
    })
  }

  function confirm() {
    if (selectedCount === 0) return
    onSelect?.(selectedList)
    setTimeout(() => {
      close()
    }, 500)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <SheetContent
        side="bottom"
        showCloseButton={false}

        className="mx-auto flex w-full max-w-lg flex-col gap-0 overflow-hidden rounded-t-xl px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] data-[side=bottom]:h-[var(--add-exercise-sheet-h,68svh)] data-[side=bottom]:max-h-[calc(100svh-0.5rem)]"
        style={
          {
            "--add-exercise-sheet-h": sheetHeight
              ? `${Math.round(sheetHeight)}px`
              : "68svh",
          } as CSSProperties
        }
      >
        <div
          className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/30"
          aria-hidden
        />
        <SheetHeader className="mb-3 shrink-0 flex-row items-center justify-between gap-3 p-0">
          <div className="min-w-0 text-start">
            <SheetTitle className="text-base">Log new exercise</SheetTitle>
            <SheetDescription className="sr-only">
              Search and pick one or more exercises to add to this session.
            </SheetDescription>
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="min-h-11"

            onClick={close}
          >
            <IconX />
          </Button>
        </SheetHeader>

        <label className="relative mb-2 block shrink-0">
          <IconSearch
            className="pointer-events-none absolute inset-s-3 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground"
            stroke={1.5}
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            className="h-11 w-full min-w-0 rounded-md border border-input bg-background ps-9 pe-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>

        <div className="mb-2 flex max-w-full min-w-0 shrink-0 [scrollbar-width:none] gap-1.5 overflow-x-auto overscroll-x-contain pb-1 [&::-webkit-scrollbar]:hidden">
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
          htmlFor="add-exercise-show-all"
          className="mb-2 flex min-h-11 shrink-0 cursor-pointer items-center justify-between gap-3 px-1"
        >
          <span className="text-sm">Show all exercises</span>
          <Switch
            id="add-exercise-show-all"
            checked={!commonOnly}
            onCheckedChange={(checked) => setCommonOnly(!checked)}
          />
        </label>

        <div
          id={LIST_ID}
          onScroll={() => setScrolling(true)}
          className={cn(
            "scrollbar-modern min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain",
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
              className="flex min-w-0 flex-col gap-1.5"
            >
              {recents.length > 0 ? <SectionLabel>Recent</SectionLabel> : null}
              {recents.map((item) => (
                <ExercisePickRow
                  key={`recent-${item.id}`}
                  item={item}
                  selected={Boolean(selected[item.id])}
                  onToggle={() => toggle(item)}
                  disabled={selectedExercises?.some((e) => e.id === item.id)}
                />
              ))}
              {items.length > 0 && recents.length > 0 ? (
                <SectionLabel>
                  {commonOnly && !searching ? "Common" : "More"}
                </SectionLabel>
              ) : null}
              {items.map((item) => (
                <ExercisePickRow
                  key={item.id}
                  item={item}
                  selected={Boolean(selected[item.id])}
                  onToggle={() => toggle(item)}
                  disabled={selectedExercises?.some((e) => e.id === item.id)}
                />
              ))}
            </InfiniteScroll>
          )}
        </div>

        <SheetFooter className="mt-3 shrink-0 p-0">
          <Button
            size="lg"
            className="h-12 min-h-11 w-full text-base"
            disabled={selectedCount === 0 || isLoading}
            onClick={confirm}
            aria-disabled={isLoading}
          >
            {isLoading ? <Spinner /> : null}
            {selectedCount === 0
              ? "Select exercises"
              : `Add ${selectedCount} ${
                  selectedCount === 1 ? "exercise" : "exercises"
                }`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="px-2 pt-2 pb-1 text-[11px] font-medium text-muted-foreground">
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
    <Button
      variant={selected ? "filter-active" : "filter"}
      className="shrink-0"
      onClick={onClick}
    >
      {label}
    </Button>
  )
}

function ExercisePickRow({
  item,
  selected,
  onToggle,
  disabled,
}: {
  item: CatalogExercise
  selected: boolean
  onToggle: () => void
  disabled?: boolean
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "h-auto min-h-12 w-full min-w-0 items-center justify-start gap-3 rounded-md px-2.5 py-2 text-start whitespace-normal",
        (selected || disabled) && "bg-muted"
      )}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground",
          selected || disabled ? "bg-background" : "bg-muted"
        )}
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
      {selected || disabled ? (
        <IconCircleCheck
          className="size-5 shrink-0 text-foreground"
          stroke={1.5}
          aria-hidden
        />
      ) : (
        <IconCircle
          className="size-5 shrink-0 text-muted-foreground/50"
          stroke={1.5}
          aria-hidden
        />
      )}
    </Button>
  )
}
