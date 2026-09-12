"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IconChevronLeft, IconPlus } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  DeleteSessionDialog,
  RenameSessionDialog,
} from "@/components/session/dialogs"
import { AddExerciseDrawer } from "@/components/session/add-exercise-drawer"
import { EmptyExercises } from "@/components/session/empty-exercises"
import { ExerciseCard } from "@/components/session/exercise-card"
import { SessionHeader } from "@/components/session/header"
import {
  formatHeaderDate,
  sessionSetCount,
  sessionStatusOf,
  sessionVolume,
} from "@/components/session/lib"
import type { SessionStatus } from "@/types/session.types"
import { VolumeTrend } from "@/components/session/volume-trend"
import { SessionStats } from "@/components/session/stats-row"
import {
  useAddExercisesToSession,
  useGetSpecificSession,
  useRenameSession,
  useAddWorkoutSet,
  useUpdateWorkoutSet,
  useDeleteSpecificSession,
  useUpdateWorkoutStartedAt,
} from "@/hooks/tanstack/session"
import { useUserPrefs } from "@/lib/user-prefs"

export function SessionDetail({ sessionId }: { sessionId: string }) {
  const router = useRouter()

  const { weightUnit } = useUserPrefs()
  const { data, isPending, isError } = useGetSpecificSession(sessionId)
  const { mutateAsync } = useRenameSession(sessionId)
  const { mutateAsync: updateSessionStart, isPending: sessionStartPending } =
    useUpdateWorkoutStartedAt(sessionId)
  const { mutateAsync: addExercises } = useAddExercisesToSession(sessionId)
  const { mutateAsync: saveSet } = useUpdateWorkoutSet(sessionId)
  const { mutateAsync: addSet } = useAddWorkoutSet(sessionId)
  const { mutateAsync: deleteSession } = useDeleteSpecificSession(sessionId)

  const [name, setName] = useState("")
  const [editing, setEditing] = useState(false)
  const [renameDraft, setRenameDraft] = useState("")
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>(
    "not_started"
  )

  useEffect(() => {
    if (!data) return
    setName(data.name)
    setSessionStatus(sessionStatusOf(data))
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
    router.push("/")
  }

  const handleStartFinishWorkout = async () => {
    const next = await updateSessionStart(sessionStatus)
    setSessionStatus(sessionStatusOf(next))
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex min-w-0 items-start gap-1">
          <Link
            href="/"
            aria-label="Back"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <IconChevronLeft className="size-5.5 rtl:rotate-180" stroke={1.5} />
          </Link>
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

  const displayName = name || data.name
  const canLogSets = sessionStatus === "in_progress" || editing

  function openRename() {
    setRenameDraft(displayName)
    setRenameOpen(true)
  }

  return (
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
                <li key={row.id}>
                  <ExerciseCard
                    row={row}
                    unit={weightUnit}
                    previous={data.previousByExercise?.[row.exercise.id]}
                    editing={canLogSets}
                    onEditSet={async (setId, nextWeight, reps) => {
                      await saveSet({ setId, weightKg: nextWeight, reps })
                    }}
                    onAddSet={async (nextWeight, reps) => {
                      await addSet({
                        workoutExerciseId: row.id,
                        weightKg: nextWeight,
                        reps,
                      })
                    }}
                  />
                </li>
              ))}
            </ul>
            <Button
              variant="ghost"
              className="mt-4 w-full"
              onClick={() => setAddOpen(true)}
            >
              <IconPlus className="mr-2" />
              Add exercise
            </Button>
          </>
        ) : (
          <EmptyExercises onAdd={() => setAddOpen(true)} />
        )}
      </div>

      {data.exercises.length > 0 ? (
        <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
          <Button
            size="lg"
            className="h-12 min-h-11 w-full text-base"
            onClick={handleStartFinishWorkout}
            disabled={sessionStartPending}
          >
            {sessionStatus === "finished"
              ? "Duplicate Workout"
              : sessionStatus === "in_progress"
                ? "Finish Workout"
                : sessionStatus === "not_started"
                  ? "Start Workout"
                  : null}
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
      <AddExerciseDrawer
        open={addOpen}
        onOpenChange={setAddOpen}
        onSelect={(exercises) => {
          void addExercises({
            exerciseIds: exercises.map((exercise) => exercise.id),
          })
        }}
      />
    </div>
  )
}
