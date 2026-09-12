"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { IconChevronLeft, IconPencil, IconPlus } from "@tabler/icons-react"
import { AddExerciseDrawer } from "@/components/session/add-exercise-drawer"
import { EmptyExercises } from "@/components/session/empty-exercises"
import { LiveExercise } from "@/components/session/live-exercise"
import {
  formatElapsedClock,
  sessionSetCount,
  sessionVolume,
} from "@/components/session/lib"
import { SessionStats } from "@/components/session/stats-row"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  useAddExercisesToSession,
  useAddWorkoutSet,
  useCompleteWorkoutSet,
  useDeleteWorkoutExercise,
  useDeleteWorkoutSet,
  useRenameSession,
  useUpdateWorkingWeight,
  useUpdateWorkoutSet,
  useUpdateWorkoutStartedAt,
} from "@/hooks/tanstack/session"
import { useUserPrefs } from "@/lib/user-prefs"
import type { WorkoutSessionDetail } from "@/types/session.types"

export function SessionLiveLogger({
  session,
}: {
  session: WorkoutSessionDetail
}) {
  const { weightUnit } = useUserPrefs()
  const sessionId = session.id
  const { mutateAsync: rename } = useRenameSession(sessionId)
  const { mutateAsync: finish, isPending: finishing } =
    useUpdateWorkoutStartedAt(sessionId)
  const { mutateAsync: addExercises } = useAddExercisesToSession(sessionId)
  const { mutateAsync: addSet } = useAddWorkoutSet(sessionId)
  const { mutateAsync: saveSet } = useUpdateWorkoutSet(sessionId)
  const { mutateAsync: completeSet } = useCompleteWorkoutSet(sessionId)
  const { mutateAsync: setWorkingWeight } = useUpdateWorkingWeight(sessionId)
  const { mutateAsync: removeExercise } = useDeleteWorkoutExercise(sessionId)
  const { mutateAsync: removeSet } = useDeleteWorkoutSet(sessionId)

  const [name, setName] = useState(session.name)
  const [editingName, setEditingName] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [addOpen, setAddOpen] = useState(false)
  const [finishConfirmOpen, setFinishConfirmOpen] = useState(false)
  const [activeEntryId, setActiveEntryId] = useState<string | null>(() => {
    const pending = session.exercises.find((row) =>
      row.workoutSets.some((setLog) => !setLog.completedAt)
    )
    return pending?.id ?? session.exercises[0]?.id ?? null
  })

  useEffect(() => {
    setName(session.name)
  }, [session.name])

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (
      activeEntryId &&
      session.exercises.some((row) => row.id === activeEntryId)
    ) {
      return
    }
    const pending = session.exercises.find((row) =>
      row.workoutSets.some((setLog) => !setLog.completedAt)
    )
    setActiveEntryId(pending?.id ?? session.exercises[0]?.id ?? null)
  }, [activeEntryId, session.exercises])

  const startedAt = new Date(session.startedAt ?? session.createdAt).getTime()
  const unloggedExerciseCount = session.exercises.filter(
    (row) => !row.workoutSets.some((setLog) => setLog.completedAt)
  ).length

  const activeIndex = useMemo(() => {
    if (activeEntryId == null) return -1
    return session.exercises.findIndex((row) => row.id === activeEntryId)
  }, [activeEntryId, session.exercises])

  async function commitName() {
    setEditingName(false)
    const next = name.trim()
    if (!next || next === session.name) {
      setName(session.name)
      return
    }
    await rename({ name: next })
  }

  async function requestFinish() {
    if (unloggedExerciseCount > 0 && session.exercises.length > 0) {
      setFinishConfirmOpen(true)
      return
    }
    await finish("in_progress")
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overscroll-y-contain">
      <header className="pb-4">
        <div className="flex min-h-11 items-center gap-1">
          <Link
            href="/dashboard"
            aria-label="Back"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <IconChevronLeft className="size-5.5 rtl:rotate-180" stroke={1.5} />
          </Link>

          <div className="flex min-w-0 flex-1 items-center gap-1">
            {editingName ? (
              <input
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                onBlur={() => {
                  void commitName()
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void commitName()
                }}
                className="min-w-0 flex-1 bg-transparent text-base font-medium outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditingName(true)}
                className="flex max-w-full min-w-0 items-center gap-1 text-start"
              >
                <span className="truncate text-base font-medium">{name}</span>
                <IconPencil
                  className="size-4.5 shrink-0 text-muted-foreground"
                  stroke={1.5}
                  aria-hidden
                />
              </button>
            )}
          </div>

          <span className="shrink-0 font-mono text-sm text-muted-foreground tabular-nums">
            {formatElapsedClock(now - startedAt)}
          </span>
        </div>

        <SessionStats
          exerciseCount={session.exercises.length}
          setCount={sessionSetCount(session)}
          volume={sessionVolume(session)}
          unit={weightUnit}
        />
      </header>

      <div
        className={`min-h-0 min-w-0 flex-1 [scrollbar-width:none] overflow-y-auto overscroll-y-contain pb-28 [&::-webkit-scrollbar]:hidden ${
          session.exercises.length > 0 ? "" : "flex"
        }`}
      >
        {session.exercises.length > 0 ? (
          <>
            <ul className="space-y-2">
              {session.exercises.map((row, index) => (
                <li key={row.id}>
                  <LiveExercise
                    row={row}
                    index={index}
                    open={activeIndex === index}
                    unit={weightUnit}
                    previousSets={
                      session.previousSetsByExercise?.[row.exercise.id]
                    }
                    nextName={session.exercises[index + 1]?.exercise.name}
                    onToggle={() =>
                      setActiveEntryId((current) =>
                        current === row.id ? null : row.id
                      )
                    }
                    onNext={() => {
                      const next = session.exercises[index + 1]
                      if (next) setActiveEntryId(next.id)
                    }}
                    onRemove={() => {
                      void removeExercise({ workoutExerciseId: row.id })
                    }}
                    onCompleteSet={async (setId) => {
                      await completeSet({ setId })
                    }}
                    onEditSet={async (setId, nextWeight, reps) => {
                      await saveSet({ setId, weightKg: nextWeight, reps })
                    }}
                    onAddSet={async (nextWeight, reps) => {
                      await addSet({
                        workoutExerciseId: row.id,
                        weightKg: nextWeight,
                        reps,
                        completed: false,
                      })
                    }}
                    onRemoveSet={async (setId) => {
                      await removeSet({ setId })
                    }}
                    onWorkingWeight={async (nextWeight) => {
                      await setWorkingWeight({
                        workoutExerciseId: row.id,
                        weightKg: nextWeight,
                      })
                    }}
                  />
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="mt-4 flex min-h-11 w-full items-center gap-2 rounded-md text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            >
              <IconPlus className="size-5" stroke={1.5} />
              Add Exercise
            </button>
          </>
        ) : (
          <EmptyExercises live onAdd={() => setAddOpen(true)} />
        )}
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
        <Button
          size="lg"
          className="h-12 min-h-11 w-full text-base"
          onClick={() => {
            void requestFinish()
          }}
          disabled={finishing}
        >
          Finish
        </Button>
      </div>

      <AlertDialog open={finishConfirmOpen} onOpenChange={setFinishConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {unloggedExerciseCount}{" "}
              {unloggedExerciseCount === 1 ? "exercise has" : "exercises have"}{" "}
              no sets. Finish anyway?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your logged sets will be kept; unfinished exercises will remain
              empty.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11">
              Keep Logging
            </AlertDialogCancel>
            <AlertDialogAction
              className="min-h-11"
              onClick={() => {
                void finish("in_progress")
              }}
            >
              Finish anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddExerciseDrawer
        open={addOpen}
        onOpenChange={setAddOpen}
        onSelect={(exercises) => {
          void addExercises({
            exerciseIds: exercises.map((exercise) => exercise.id),
          }).then((next) => {
            const added = next?.exercises.at(-1)
            if (added) setActiveEntryId(added.id)
          })
        }}
      />
    </div>
  )
}