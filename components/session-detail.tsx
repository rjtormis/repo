"use client"

import {
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import { flushSync } from "react-dom"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IconChevronLeft, IconPlus } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { DeleteSessionDialog } from "@/components/session/dialogs/delete-session-dialog"
import { RenameSessionDialog } from "@/components/session/dialogs/rename-session-dialog"
import { AddExerciseDrawer } from "@/components/session/drawers/add-exercise-drawer"
import { EmptyExercises } from "@/components/session/empty-exercises"
import { ExerciseCard } from "@/components/session/exercise-card"
import { SessionHeader } from "@/components/session/header"
import { SessionLiveLogger } from "@/components/session/live-logger"
import {
  formatHeaderDate,
  restorableSets,
  sessionSetCount,
  sessionStatusOf,
  sessionVolume,
  weightKg,
} from "@/components/session/lib"
import {
  buildShareCardData,
  shareHandle,
} from "@/components/session/share/build-share-card"
import { ShareSheet } from "@/components/session/share/share-sheet"
import { VolumeTrend } from "@/components/session/volume-trend"
import { SessionStats } from "@/components/session/stats-row"
import { useGetDashboardStats } from "@/hooks/tanstack/dashboard"
import {
  useAddExercisesToSession,
  useGetSpecificSession,
  useRenameSession,
  useAddWorkoutSet,
  useUpdateWorkoutSet,
  useDeleteSpecificSession,
  useDeleteWorkoutExercise,
  useDeleteWorkoutSet,
  useRestoreWorkoutExercise,
  useUpdateWorkoutStartedAt,
} from "@/hooks/tanstack/session"
import { showRemovedToast } from "@/lib/undo-toast"
import { authClient } from "@/lib/auth-client"
import { useUserPrefs } from "@/lib/user-prefs"

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)")
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

function SessionLiveBoundary({
  live,
  children,
}: {
  live: boolean
  children: (showLive: boolean) => ReactNode
}) {
  const [showLive, setShowLive] = useState(live)
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  )
  const canTransition =
    !reduceMotion &&
    typeof document !== "undefined" &&
    typeof document.startViewTransition === "function"

  useLayoutEffect(() => {
    if (!canTransition || live === showLive) return
    document.startViewTransition(() => {
      flushSync(() => setShowLive(live))
    })
  }, [canTransition, live, showLive])

  return children(canTransition ? showLive : live)
}

export function SessionDetail({ sessionId }: { sessionId: string }) {
  const router = useRouter()

  const { weightUnit } = useUserPrefs()
  const { data: auth } = authClient.useSession()
  const { data, isPending, isError } = useGetSpecificSession(sessionId)
  const today = new Date().toLocaleDateString("en-CA")
  const { data: dash } = useGetDashboardStats(today)
  const { mutateAsync } = useRenameSession(sessionId)
  const { mutateAsync: updateSessionStart, isPending: sessionStartPending } =
    useUpdateWorkoutStartedAt(sessionId)
  const { mutateAsync: addExercises, isPending: addExercisePending } =
    useAddExercisesToSession(sessionId)
  const { mutateAsync: saveSet } = useUpdateWorkoutSet(sessionId)
  const { mutateAsync: addSet } = useAddWorkoutSet(sessionId)
  const { mutateAsync: deleteSession } = useDeleteSpecificSession(sessionId)
  const { mutateAsync: removeExercise, isPending: removeExercisePending } =
    useDeleteWorkoutExercise(sessionId)
  const { mutateAsync: removeSet } = useDeleteWorkoutSet(sessionId)
  const { mutateAsync: restoreExercise } = useRestoreWorkoutExercise(sessionId)

  const [name, setName] = useState("")
  const [editing, setEditing] = useState(false)
  const [renameDraft, setRenameDraft] = useState("")
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  useEffect(() => {
    if (!data) return
    setName(data.name)
  }, [data])

  if (isPending) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <SessionHeader
          name="…"
          exercises={0}
          dateLabel="…"
          onRename={() => {}}
          onDelete={() => {}}
          onEdit={() => {}}
        />
      </div>
    )
  }

  const handleRenameSession = async () => {
    const nextName = renameDraft.trim()
    if (nextName) setName(nextName)
    await mutateAsync({ name })
    setRenameOpen(false)
  }

  const handleDeleteSession = async () => {
    await deleteSession()
    router.push("/dashboard")
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex min-w-0 items-start gap-1">
          <Button
            variant="quiet"
            size="icon-touch"
            render={<Link href="/dashboard" />}
            aria-label="Back"
          >
            <IconChevronLeft className="size-5.5 rtl:rotate-180" stroke={1.5} />
          </Button>
          <div className="min-w-0 flex-1 pt-2">
            <h1 className="text-lg font-medium">Workout not found</h1>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              It may have been deleted, or the link is old.
            </p>
          </div>
        </header>
      </div>
    )
  }

  const sessionStatus = sessionStatusOf(data)
  const displayName = name || data.name
  const canLogSets = editing

  const handleStartFinishWorkout = async () => {
    await updateSessionStart(sessionStatus)
  }

  function openRename() {
    setRenameDraft(displayName)
    setRenameOpen(true)
  }

  return (
    <SessionLiveBoundary live={sessionStatus === "in_progress"}>
      {(showLive) =>
        showLive ? (
          <SessionLiveLogger session={data} sessionStatus={sessionStatus} />
        ) : (
    <div className="flex h-full min-h-0 min-w-0 flex-1 touch-pan-y flex-col overflow-hidden">
      <SessionHeader
        name={displayName}
        dateLabel={formatHeaderDate(data)}
        onRename={openRename}
        onDelete={() => setDeleteOpen(true)}
        onEdit={() => setEditing((value) => !value)}
        editing={editing}
        showEdit={sessionStatus === "finished"}
        exercises={data.exercises.length}
      />

      <SessionStats
        exerciseCount={data.exercises.length}
        setCount={sessionSetCount(data)}
        volume={sessionVolume(data)}
        unit={weightUnit}
      />
      <VolumeTrend points={data.volumeTrend ?? []} currentId={data.id} />

      <div
        className={`min-h-0 min-w-0 flex-1 [scrollbar-width:none] overflow-y-auto overscroll-y-contain pt-4 [&::-webkit-scrollbar]:hidden ${
          data.exercises.length > 0 ? "" : "flex"
        }`}
      >
        {canLogSets ? (
          <p className="mb-3 text-xs text-muted-foreground">
            Tap a set to change weight or reps. Use + to add one.
          </p>
        ) : null}
        {data.exercises.length > 0 ? (
          <>
            <ul className="space-y-2">
              {data.exercises.map((row) => (
                <li key={row.id} className="motion-enter">
                  <ExerciseCard
                    row={row}
                    unit={weightUnit}
                    previous={data.previousByExercise?.[row.exercise.id]}
                    editing={canLogSets}
                    onEditSet={async (setId, nextWeight, reps) => {
                      await saveSet({ setId, weightKg: nextWeight, reps })
                    }}
                    onAddSet={async (nextWeight, reps) => {
                      const next = await addSet({
                        workoutExerciseId: row.id,
                        weightKg: nextWeight,
                        reps,
                      })
                      return next?.exercises
                        .find((entry) => entry.id === row.id)
                        ?.workoutSets.at(-1)?.id
                    }}
                    onRemove={() => {
                      const snapshot = {
                        exerciseId: row.exercise.id,
                        name: row.exercise.name,
                        sets: restorableSets(row),
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
                  />
                </li>
              ))}
            </ul>
            {editing ? (
              <Button
                variant="quiet"
                className="mt-4 h-11 w-full justify-start"
                onClick={() => setAddOpen(true)}
              >
                <IconPlus className="mr-2" />
                Add exercise
              </Button>
            ) : null}
          </>
        ) : (
          <EmptyExercises onAdd={() => setAddOpen(true)} />
        )}
      </div>

      {sessionStatus === "not_started" ? (
        <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
          <Button
            size="lg"
            className="h-12 min-h-11 w-full text-base"
            onClick={handleStartFinishWorkout}
            disabled={sessionStartPending}
          >
            Start Workout
          </Button>
        </div>
      ) : sessionStatus == "finished" && !editing ? (
        <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
          <Button
            size="lg"
            className="h-12 min-h-11 w-full text-base"
            onClick={() => setShareOpen(true)}
          >
            Share
          </Button>
          <Button
            size="lg"
            variant="ghost-outline"
            className="mt-2 h-12 min-h-11 w-full text-base"
            onClick={handleStartFinishWorkout}
            disabled={sessionStartPending}
          >
            Repeat this workout
          </Button>
        </div>
      ) : null}

      <RenameSessionDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        draft={renameDraft}
        onDraftChange={setRenameDraft}
        onSave={handleRenameSession}
      />
      <DeleteSessionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteSession}
      />
      <ShareSheet
        open={shareOpen}
        onOpenChange={setShareOpen}
        data={buildShareCardData(data, weightUnit, {
          handle: shareHandle(auth?.user.name, auth?.user.email),
          heatmap: dash?.heatmap,
          streakCount: dash?.streak.count,
          streakUnit: dash?.streak.unit,
        })}
      />
      <AddExerciseDrawer
        open={addOpen}
        onOpenChange={setAddOpen}
        onSelect={(exercises) => {
          void addExercises({
            exerciseIds: exercises.map((exercise) => exercise.id),
          })
        }}
        isLoading={addExercisePending}
      />
    </div>
        )
      }
    </SessionLiveBoundary>
  )
}
