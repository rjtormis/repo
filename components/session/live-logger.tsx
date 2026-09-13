"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { IconChevronLeft, IconPencil, IconPlus } from "@tabler/icons-react"
import { DiscardSessionDialog } from "@/components/session/dialogs/discard-session-dialog"
import { FinishWorkoutDialog } from "@/components/session/dialogs/finish-workout-dialog"
import { AddExerciseDrawer } from "@/components/session/drawers/add-exercise-drawer"
import { EmptyExercises } from "@/components/session/empty-exercises"
import { LiveExercise } from "@/components/session/live-exercise"
import {
  formatElapsedClock,
  restorableSets,
  sessionSetCount,
  sessionVolume,
  weightKg,
} from "@/components/session/lib"
import { SessionStats } from "@/components/session/stats-row"
import { Button } from "@/components/ui/button"
import {
  useAddExercisesToSession,
  useAddWorkoutSet,
  useCompleteWorkoutSet,
  useDeleteSpecificSession,
  useDeleteWorkoutExercise,
  useDeleteWorkoutSet,
  useRenameSession,
  useRestoreWorkoutExercise,
  useUpdateWorkingWeight,
  useUpdateWorkoutSet,
  useUpdateWorkoutStartedAt,
} from "@/hooks/tanstack/session"
import { showRemovedToast } from "@/lib/undo-toast"
import { useUserPrefs } from "@/lib/user-prefs"
import type { WorkoutSessionDetail } from "@/types/session.types"
import { MuscleGroup } from "@/generated/prisma/enums"
import { NameWorkoutDialog } from "./dialogs/name-workout-dialog"

function isDefaultWorkoutName(value: string) {
  return value.trim().toLowerCase() === "new workout"
}

export function SessionLiveLogger({
  session,
  sessionStatus,
}: {
  session: WorkoutSessionDetail
  sessionStatus: string
}) {
  const router = useRouter()
  const { weightUnit } = useUserPrefs()
  const sessionId = session.id
  const { mutateAsync: rename, isPending: renaming } = useRenameSession(sessionId)
  const { mutateAsync: finishWorkout, isPending: finishWorkOutPending } =
    useUpdateWorkoutStartedAt(sessionId)
  const { mutateAsync: addExercises, isPending: addExercisePending } =
    useAddExercisesToSession(sessionId)
  const { mutateAsync: addSet } = useAddWorkoutSet(sessionId)
  const { mutateAsync: saveSet } = useUpdateWorkoutSet(sessionId)
  const { mutateAsync: completeSet } = useCompleteWorkoutSet(sessionId)
  const { mutateAsync: setWorkingWeight } = useUpdateWorkingWeight(sessionId)
  const { mutateAsync: removeExercise, isPending: removeExercisePending } =
    useDeleteWorkoutExercise(sessionId)
  const { mutateAsync: removeSet } = useDeleteWorkoutSet(sessionId)
  const { mutateAsync: restoreExercise } = useRestoreWorkoutExercise(sessionId)
  const { mutateAsync: discardSession, isPending: discarding } =
    useDeleteSpecificSession(sessionId)

  const [name, setName] = useState(session.name)
  const [editingName, setEditingName] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [addOpen, setAddOpen] = useState(false)
  const [finishConfirmOpen, setFinishConfirmOpen] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [nameDialogOpen, setNameDialogOpen] = useState(false)
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
    if (session.exercises.length === 0) {
      setDiscardOpen(true)
      return
    }
    if (unloggedExerciseCount > 0) {
      setFinishConfirmOpen(true)
      return
    }
    if (isDefaultWorkoutName(session.name)) {
      setNameDialogOpen(true)
      return
    }

    await finishWorkout("in_progress")
  }

  async function finishAfterName(nextName?: string) {
    const trimmed = nextName?.trim()
    if (trimmed && trimmed.toLowerCase() !== session.name.trim().toLowerCase()) {
      await rename({ name: trimmed })
    }
    await finishWorkout("in_progress")
    setNameDialogOpen(false)
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overscroll-y-contain">
      <header className="pb-4">
        <div className="flex min-h-11 items-center gap-1">
          <Button
            className=""
            variant="quiet"
            size="icon-touch"
            render={<Link href="/dashboard" />}
            aria-label="Back"
          >
            <IconChevronLeft className="size-5.5 rtl:rotate-180" stroke={1.5} />
          </Button>

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
              <Button
                variant="ghost"
                onClick={() => setEditingName(true)}
                className="h-auto max-w-full min-w-0 justify-start gap-1 px-1 text-start"
              >
                <span className="mr-2 truncate text-base font-medium">
                  {name}
                </span>
                <IconPencil
                  className="size-4.5 shrink-0 text-muted-foreground"
                  stroke={1.5}
                  aria-hidden
                />
              </Button>
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
                <li key={row.id} className="motion-enter">
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
                      const snapshot = {
                        exerciseId: row.exercise.id,
                        name: row.exercise.name,
                        sets: restorableSets(row),
                      }
                      if (activeEntryId === row.id) {
                        const remaining = session.exercises.filter(
                          (entry) => entry.id !== row.id
                        )
                        const pending = remaining.find((entry) =>
                          entry.workoutSets.some(
                            (setLog) => !setLog.completedAt
                          )
                        )
                        setActiveEntryId(
                          pending?.id ?? remaining[0]?.id ?? null
                        )
                      }
                      void removeExercise({ workoutExerciseId: row.id }).then(
                        () => {
                          showRemovedToast(snapshot.name, () => {
                            void restoreExercise({
                              exerciseId: snapshot.exerciseId,
                              sets: snapshot.sets,
                            })
                          })
                        }
                      )
                    }}
                    onRemovePending={removeExercisePending}
                    onCompleteSet={async (setId) => {
                      await completeSet({ setId })
                    }}
                    onEditSet={async (setId, nextWeight, reps) => {
                      await saveSet({ setId, weightKg: nextWeight, reps })
                    }}
                    onAddSet={async (nextWeight, reps) => {
                      const next = await addSet({
                        workoutExerciseId: row.id,
                        weightKg: nextWeight,
                        reps,
                        completed: false,
                      })
                      return next?.exercises
                        .find((entry) => entry.id === row.id)
                        ?.workoutSets.at(-1)?.id
                    }}
                    onRemoveSet={async (setId) => {
                      const setLog = row.workoutSets.find(
                        (item) => item.id === setId
                      )
                      await removeSet({ setId })
                      if (!setLog) return
                      showRemovedToast(row.exercise.name, () => {
                        void addSet({
                          workoutExerciseId: row.id,
                          weightKg: weightKg(setLog.weight),
                          reps: setLog.reps,
                          completed: Boolean(setLog.completedAt),
                        })
                      })
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
            <Button
              variant="quiet"
              className="mt-4 h-11 w-full justify-start"
              onClick={() => setAddOpen(true)}
            >
              <IconPlus className="size-5" stroke={1.5} />
              Add Exercise
            </Button>
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
          disabled={finishWorkOutPending || discarding}
        >
          Finish
        </Button>
      </div>

      <FinishWorkoutDialog
        open={finishConfirmOpen}
        onOpenChange={setFinishConfirmOpen}
        unloggedExerciseCount={unloggedExerciseCount}
        onFinish={() => {
          setFinishConfirmOpen(false)
          if (isDefaultWorkoutName(session.name)) {
            setNameDialogOpen(true)
            return
          }
          void finishWorkout("in_progress")
        }}
        onFinishPending={finishWorkOutPending}
      />
      <DiscardSessionDialog
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        discardPending={discarding}
        onDiscard={() => {
          void discardSession().then(() => {
            router.push("/dashboard")
          })
        }}
      />
      <NameWorkoutDialog
        open={nameDialogOpen}
        onOpenChange={setNameDialogOpen}
        onSave={(nextName) => {
          void finishAfterName(nextName)
        }}
        onSkip={() => {
          void finishAfterName()
        }}
        onSavePending={renaming || finishWorkOutPending}
      />

      <AddExerciseDrawer
        open={addOpen}
        onOpenChange={setAddOpen}
        onSelect={(exercises) => {
          void addExercises({
            exerciseIds: exercises.map((exercise) => exercise.id),
          }).then((next) => {
            const added = next?.exercises.at(-1)
            console.log(added)
            if (added) setActiveEntryId(added.id)
          })
        }}
        selectedExercises={session.exercises.map((e) => {
          return {
            id: e.exercise.id,
            name: e.exercise.name,
            muscleGroups: e.exercise.muscleGroup,
          }
        })}
        isLoading={addExercisePending}
      />
    </div>
  )
}
