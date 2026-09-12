"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { IconPlayerPlay } from "@tabler/icons-react"
import { MuscleGroupIcon } from "@/components/session/muscle-group"
import { SubpageHeader } from "@/components/subpage-header"
import { Button } from "@/components/ui/button"
import { daysSince, formatAgo } from "@/components/home/lib"
import { useGetExercise } from "@/hooks/tanstack/exrcise"
import { useAddExerciseToWorkout } from "@/hooks/tanstack/session"
import { muscleGroupLabel } from "@/lib/muscle-groups"
import {
  estimated1rmKg,
  formatWeight,
  type WeightUnit,
} from "@/lib/units"
import { useUserPrefs } from "@/lib/user-prefs"
import { cn } from "@/lib/utils"
import type {
  ActiveWorkout,
  ExerciseHistoryEntry,
  ExerciseRecord,
} from "@/types/exercise.types"

export function ExerciseDetail({ exerciseId }: { exerciseId: string }) {
  const router = useRouter()
  const { weightUnit } = useUserPrefs()
  const { data, isPending, isError } = useGetExercise(exerciseId)
  const addToWorkout = useAddExerciseToWorkout()

  if (isPending) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <SubpageHeader title="…" backHref="/exercises" />
        <p className="px-2 py-6 text-center text-sm text-muted-foreground">
          Loading…
        </p>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <SubpageHeader title="Exercise" backHref="/exercises" />
        <p className="px-2 py-6 text-center text-sm text-muted-foreground">
          This exercise isn’t in the catalog, or the link is old.
        </p>
      </div>
    )
  }

  const { exercise, history, record, activeSession } = data
  const facts = [
    {
      label: "Equipment",
      value: exercise.equipments.filter(Boolean).join(" · ") || "—",
    },
    { label: "Mechanics", value: muscleGroupLabel(exercise.mechanics) },
    { label: "Region", value: muscleGroupLabel(exercise.bodyRegion) },
    { label: "Difficulty", value: muscleGroupLabel(exercise.difficulty) },
  ]

  async function handleAdd() {
    if (activeSession?.alreadyAdded) {
      router.push(`/session/${activeSession.id}`)
      return
    }
    const sessionId = await addToWorkout.mutateAsync({
      sessionId: activeSession?.id,
      exerciseId,
    })
    router.push(`/session/${sessionId}`)
  }

  const extraHistory = history.filter(
    (entry) => entry.sessionId !== record?.sessionId
  )
  const showHistory = extraHistory.length > 0

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <SubpageHeader
        title={exercise.name}
        backHref="/exercises"
        hideTitle
      />

      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-y-contain scrollbar-modern",
          activeSession && "pb-24"
        )}
      >
        <div className="flex items-start gap-3 pb-5">
          <span
            className="grid size-14 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"
            aria-hidden
          >
            <MuscleGroupIcon
              group={exercise.muscleGroups}
              className="size-9"
            />
          </span>
          <div className="min-w-0 pt-1">
            <h2 className="text-lg font-medium text-balance">
              {exercise.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {muscleGroupLabel(exercise.muscleGroups)}
              <span aria-hidden> · </span>
              {muscleGroupLabel(exercise.primeMoverMuscle)}
            </p>
          </div>
        </div>

        <DemoLinks
          shortDemo={exercise.shortDemo}
          inDepthDemo={exercise.inDepthDemo}
        />

        <RecordCard record={record} unit={weightUnit} />

        {showHistory ? (
          <section className="pb-6">
            <h3 className="mb-2 text-[11px] font-medium text-muted-foreground">
              History
            </h3>
            <ul className="space-y-2">
              {extraHistory.map((entry) => (
                <HistoryRow
                  key={entry.sessionId}
                  entry={entry}
                  unit={weightUnit}
                />
              ))}
            </ul>
          </section>
        ) : null}

        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 pb-6 text-sm">
          {facts.map((fact) => (
            <div key={fact.label} className="contents">
              <dt className="text-muted-foreground">{fact.label}</dt>
              <dd className="min-w-0 text-end">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {activeSession ? (
        <AddToWorkoutBar
          activeSession={activeSession}
          pending={addToWorkout.isPending}
          onAdd={() => {
            void handleAdd()
          }}
        />
      ) : null}
    </div>
  )
}

function RecordCard({
  record,
  unit,
}: {
  record: ExerciseRecord | null
  unit: WeightUnit
}) {
  if (!record) {
    return (
      <section className="pb-6">
        <h3 className="mb-2 text-[11px] font-medium text-muted-foreground">
          Personal record
        </h3>
        <p className="rounded-xl bg-surface-1 px-3.5 py-3.5 text-sm text-muted-foreground">
          No weighted PR yet. It shows up when you complete a set.
        </p>
      </section>
    )
  }

  const delta =
    record.previous != null
      ? record.e1rmKg - record.previous.e1rmKg
      : null

  return (
    <section className="pb-6">
      <h3 className="mb-2 text-[11px] font-medium text-muted-foreground">
        Personal record
      </h3>
      <Link
        href={`/session/${record.sessionId}`}
        className={cn(
          "flex min-h-11 flex-col gap-1 rounded-xl bg-surface-1 px-3.5 py-3.5 transition-colors",
          "hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        )}
      >
        <div className="flex min-w-0 items-center justify-between gap-3">
          <p className="min-w-0 truncate font-mono text-sm tabular-nums">
            {formatWeight(record.weightKg, unit)} × {record.reps}
          </p>
          <span className="shrink-0 rounded-sm bg-success/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-success">
            PR
          </span>
        </div>
        <p className="font-mono text-xs text-muted-foreground tabular-nums">
          e1RM {formatWeight(record.e1rmKg, unit)}
          {delta != null && delta > 0 ? (
            <>
              {" "}
              · +{formatWeight(delta, unit)} vs{" "}
              {formatAgo(daysSince(new Date(record.previous!.achievedAt)))}
            </>
          ) : delta != null ? (
            <>
              {" "}
              · same as{" "}
              {formatAgo(daysSince(new Date(record.previous!.achievedAt)))}
            </>
          ) : (
            <> · first record</>
          )}
        </p>
      </Link>
    </section>
  )
}

function HistoryRow({
  entry,
  unit,
}: {
  entry: ExerciseHistoryEntry
  unit: WeightUnit
}) {
  const started = new Date(entry.startedAt)
  const e1rm = bestSessionE1rm(entry)

  return (
    <li>
      <Link
        href={`/session/${entry.sessionId}`}
        className={cn(
          "flex min-h-11 flex-col gap-1 rounded-xl bg-surface-1 px-3.5 py-3.5 transition-colors",
          "hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        )}
      >
        <div className="flex min-w-0 items-baseline justify-between gap-3">
          <span className="min-w-0 truncate text-sm">{entry.sessionName}</span>
          <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
            {formatAgo(daysSince(started))}
          </span>
        </div>
        <p className="min-w-0 truncate font-mono text-xs text-muted-foreground tabular-nums">
          {formatSetLine(entry, unit)}
          {e1rm != null ? ` · e1RM ${formatWeight(e1rm, unit)}` : ""}
        </p>
      </Link>
    </li>
  )
}

function bestSessionE1rm(entry: ExerciseHistoryEntry) {
  let best: number | null = null
  for (const set of entry.sets) {
    if (set.weightKg == null) continue
    const next = estimated1rmKg(set.weightKg, set.reps)
    if (best == null || next > best) best = next
  }
  return best
}

function formatSetLine(entry: ExerciseHistoryEntry, unit: WeightUnit) {
  const groups: { kg: number | null; reps: number[] }[] = []
  for (const set of entry.sets) {
    const current = groups[groups.length - 1]
    if (current && current.kg === set.weightKg) {
      current.reps.push(set.reps)
    } else {
      groups.push({ kg: set.weightKg, reps: [set.reps] })
    }
  }

  return groups
    .map(({ kg, reps }) => {
      const weight = kg == null ? "BW" : formatWeight(kg, unit)
      return `${weight} × ${reps.join(", ")}`
    })
    .join(" · ")
}

function AddToWorkoutBar({
  activeSession,
  pending,
  onAdd,
}: {
  activeSession: ActiveWorkout
  pending: boolean
  onAdd: () => void
}) {
  const label = activeSession.alreadyAdded
    ? "Open current workout"
    : "Add to current workout"

  return (
    <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
      <Button
        size="lg"
        className="h-12 min-h-11 w-full text-base"
        disabled={pending}
        onClick={onAdd}
      >
        {pending ? "Adding…" : label}
      </Button>
    </div>
  )
}

function DemoLinks({
  shortDemo,
  inDepthDemo,
}: {
  shortDemo: string | null
  inDepthDemo: string | null
}) {
  const [playing, setPlaying] = useState<string | null>(null)
  const demos = [
    { href: safeHttpUrl(shortDemo), label: "Short clip" },
    { href: safeHttpUrl(inDepthDemo), label: "In-depth" },
  ].filter((demo): demo is { href: string; label: string } => Boolean(demo.href))

  if (demos.length === 0) return null

  const active = demos.find((demo) => demo.href === playing)
  const embedId = active ? youtubeId(active.href) : null

  return (
    <section className="pb-6">
      <h3 className="mb-2 text-[11px] font-medium text-muted-foreground">
        Demo
      </h3>
      <div
        className={cn(
          "grid gap-2",
          demos.length > 1 ? "grid-cols-2" : "grid-cols-1"
        )}
      >
        {demos.map((demo) => (
          <DemoTile
            key={demo.href}
            label={demo.label}
            pressed={playing === demo.href}
            onPlay={() => {
              if (!youtubeId(demo.href)) {
                window.open(demo.href, "_blank", "noreferrer")
                return
              }
              setPlaying((current) =>
                current === demo.href ? null : demo.href
              )
            }}
          />
        ))}
      </div>
      {embedId && active ? (
        <div className="mt-2 aspect-video overflow-hidden rounded-lg bg-muted">
          <iframe
            key={embedId}
            src={`https://www.youtube-nocookie.com/embed/${embedId}?autoplay=1`}
            title={active.label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="size-full border-0"
          />
        </div>
      ) : null}
    </section>
  )
}

function DemoTile({
  label,
  pressed,
  onPlay,
}: {
  label: string
  pressed: boolean
  onPlay: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onPlay}
      className={cn(
        "flex h-14 min-w-0 items-center gap-2.5 rounded-lg bg-surface-1 px-3 text-start text-sm",
        "hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        pressed && "bg-surface-2"
      )}
    >
      <span
        className="grid size-7 shrink-0 place-items-center rounded-full bg-background text-foreground"
        aria-hidden
      >
        <IconPlayerPlay className="size-3.5 translate-x-px" stroke={1.5} />
      </span>
      <span className="min-w-0 truncate">{label}</span>
    </button>
  )
}

function safeHttpUrl(value: string | null) {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null
  } catch {
    return null
  }
}

function youtubeId(value: string) {
  try {
    const url = new URL(value)
    const host = url.hostname.replace(/^www\./, "")
    if (host === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] ?? null
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.searchParams.get("v")) return url.searchParams.get("v")
      const parts = url.pathname.split("/").filter(Boolean)
      if (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "v") {
        return parts[1] ?? null
      }
    }
    return null
  } catch {
    return null
  }
}
