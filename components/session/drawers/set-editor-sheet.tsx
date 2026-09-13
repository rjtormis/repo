"use client"

import { useEffect, useRef, useState } from "react"
import { IconMinus, IconPlus, IconTrash, IconX } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  displayToKg,
  kgToDisplay,
  stepDisplayWeight,
  type WeightUnit,
} from "@/lib/units"

function parseDisplayWeight(value: string): number | null {
  const typed = Number(value)
  if (value.trim() === "" || !Number.isFinite(typed)) return null
  return typed
}

function parseReps(value: string): number | null {
  const typed = Number(value)
  if (!Number.isFinite(typed) || typed < 1) return null
  return Math.round(typed)
}

export function SetEditorSheet({
  open,
  title,
  unit,
  weightKg,
  reps,
  canRemove = false,
  onOpenChange,
  onCommit,
  onRemove,
}: {
  open: boolean
  title: string
  unit: WeightUnit
  weightKg: number | null
  reps: number
  canRemove?: boolean
  onOpenChange: (open: boolean) => void
  onCommit: (weightKg: number | null, reps: number) => Promise<void>
  onRemove?: () => Promise<void>
}) {
  const [weight, setWeight] = useState("")
  const [repDraft, setRepDraft] = useState("")
  const [busy, setBusy] = useState(false)
  const valuesRef = useRef({ weightKg, reps })
  const committedRef = useRef({ weightKg, reps })

  useEffect(() => {
    if (!open) return
    setWeight(weightKg == null ? "" : String(kgToDisplay(weightKg, unit)))
    setRepDraft(String(reps))
    valuesRef.current = { weightKg, reps }
    committedRef.current = { weightKg, reps }
  }, [open, weightKg, reps, unit])

  function parsed() {
    const display = parseDisplayWeight(weight)
    const nextWeight = display == null ? null : displayToKg(display, unit)
    const nextReps = parseReps(repDraft)
    return { nextWeight, nextReps }
  }

  async function commit(nextWeight: number | null, nextReps: number) {
    const last = committedRef.current
    if (last.weightKg === nextWeight && last.reps === nextReps) return
    committedRef.current = { weightKg: nextWeight, reps: nextReps }
    valuesRef.current = committedRef.current
    setBusy(true)
    try {
      await onCommit(nextWeight, nextReps)
    } finally {
      setBusy(false)
    }
  }

  async function flush() {
    const { nextWeight, nextReps } = parsed()
    if (nextReps == null) return
    await commit(nextWeight, nextReps)
  }

  function applyWeight(nextDisplay: number | null) {
    setWeight(nextDisplay == null ? "" : String(nextDisplay))
    const { nextReps } = parsed()
    const repsNow = nextReps ?? valuesRef.current.reps
    const nextWeight =
      nextDisplay == null ? null : displayToKg(nextDisplay, unit)
    valuesRef.current = { weightKg: nextWeight, reps: repsNow }
    void commit(nextWeight, repsNow)
  }

  function applyReps(nextReps: number) {
    setRepDraft(String(nextReps))
    const { nextWeight } = parsed()
    const weightNow = nextWeight
    valuesRef.current = { weightKg: weightNow, reps: nextReps }
    void commit(weightNow, nextReps)
  }

  const displayWeight = parseDisplayWeight(weight)
  const displayReps = parseReps(repDraft) ?? valuesRef.current.reps

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (next) {
          onOpenChange(true)
          return
        }
        void flush().finally(() => onOpenChange(false))
      }}
    >
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mx-auto w-full max-w-lg gap-0 rounded-t-xl px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]"
      >
        <div
          className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/30"
          aria-hidden
        />
        <div className="mb-4 flex items-center gap-1">
          <SheetTitle className="min-w-0 flex-1 truncate text-base">
            {title}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Changes apply as you edit. Dismiss the sheet when you are done.
          </SheetDescription>
          {canRemove && onRemove ? (
            <Button
              variant="quiet"
              size="icon-touch"
              aria-label="Remove set"
              disabled={busy}
              onClick={() => {
                void onRemove()
              }}
            >
              <IconTrash className="size-5" stroke={1.5} />
            </Button>
          ) : null}
          <SheetClose
            render={
              <Button variant="quiet" size="icon-touch" aria-label="Close" />
            }
          >
            <IconX className="size-5.5" stroke={1.5} />
          </SheetClose>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StepperField
            label={`weight (${unit})`}
            value={weight}
            inputMode="decimal"
            decreaseLabel={`Decrease weight by ${unit === "lb" ? 5 : 2.5} ${unit}`}
            increaseLabel={`Increase weight by ${unit === "lb" ? 5 : 2.5} ${unit}`}
            onChange={setWeight}
            onBlur={() => {
              void flush()
            }}
            onStep={(direction) => {
              applyWeight(stepDisplayWeight(displayWeight, unit, direction))
            }}
          />
          <StepperField
            label="reps"
            value={repDraft}
            inputMode="numeric"
            decreaseLabel="Decrease reps by 1"
            increaseLabel="Increase reps by 1"
            decreaseDisabled={displayReps <= 1}
            onChange={setRepDraft}
            onBlur={() => {
              void flush()
            }}
            onStep={(direction) => {
              applyReps(Math.max(1, displayReps + direction))
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}

function StepperField({
  label,
  value,
  inputMode,
  decreaseLabel,
  increaseLabel,
  decreaseDisabled,
  onChange,
  onBlur,
  onStep,
}: {
  label: string
  value: string
  inputMode: "decimal" | "numeric"
  decreaseLabel: string
  increaseLabel: string
  decreaseDisabled?: boolean
  onChange: (value: string) => void
  onBlur: () => void
  onStep: (direction: 1 | -1) => void
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-[11px] text-muted-foreground">{label}</p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-touch"
          aria-label={decreaseLabel}
          disabled={decreaseDisabled}
          onClick={() => onStep(-1)}
        >
          <IconMinus className="size-5" stroke={1.5} />
        </Button>
        <Input
          inputMode={inputMode}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          className="h-11 min-w-0 flex-1 px-1 text-center font-mono text-sm tabular-nums"
        />
        <Button
          type="button"
          variant="outline"
          size="icon-touch"
          aria-label={increaseLabel}
          onClick={() => onStep(1)}
        >
          <IconPlus className="size-5" stroke={1.5} />
        </Button>
      </div>
    </div>
  )
}
