"use client"

import { useEffect, useState } from "react"
import { formatHomeDate, greetingForHour } from "@/components/home/lib"
import { NavigationMenu } from "@/components/navigation-menu"
import { Segmented } from "@/components/ui/segmented"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CELL_GAP,
  HEAT_LEVELS,
  HEAT_SWATCH,
  PAGE_PAD_STYLE,
  PAGE_PAD_X,
} from "@/components/home/constants"
import { cn } from "@/lib/utils"

const HEAT_WEEKS = 26
const HEAT_DAYS = 7
const PICKUP_CARDS = 3

function Bone({ className, ...props }: React.ComponentProps<typeof Skeleton>) {
  return <Skeleton className={cn("bg-surface-2", className)} {...props} />
}

function skeletonHeatLevel(week: number, day: number) {
  const n = (week * 13 + day * 7) % 11
  const recent = week > HEAT_WEEKS - 8
  if (n < 5) return 0
  if (n < 8) return 1
  if (n < 10) return recent ? 2 : 1
  return recent ? 3 : 2
}

export function HomeSkeleton() {
  const [clock, setClock] = useState<Date | null>(null)

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setClock(new Date())
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  const greeting = clock ? greetingForHour(clock.getHours()) : null
  const dateLabel = clock ? formatHomeDate(clock) : null

  return (
    <div
      className="relative mx-auto min-h-dvh w-full max-w-lg min-w-0 bg-background"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading dashboard</span>
      <div
        className={cn(
          "flex min-w-0 flex-col overflow-x-hidden",
          "pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))]"
        )}
        style={PAGE_PAD_STYLE}
      >
        <header className="mb-4">
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            {dateLabel ?? "\u00a0"}
          </p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <h1 className="min-w-0 text-xl leading-tight font-semibold">
              {greeting ?? "\u00a0"}
            </h1>
            <NavigationMenu />
          </div>
        </header>

        <section className="mb-4 rounded-3xl bg-surface-1 p-4">
          <Bone className="mb-2.5 h-6.5 w-30.5 rounded-full bg-bg-success" />
          <div className="space-y-2">
            <Bone className="h-6 w-[92%]" />
            <Bone className="h-5 w-[58%]" />
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <Bone className="h-7 w-10" />
              <Bone className="mt-2 h-4 w-29" />
            </div>
            <div
              className="size-20 shrink-0 rounded-full border-[6px] border-heat-empty"
              aria-hidden
            />
          </div>
          <div className="mt-4 flex items-center gap-3 border-t border-border pt-3">
            <Bone className="h-4 w-10" />
            <div className="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-heat-empty">
              <div className="h-full w-2/5 animate-pulse rounded-full bg-success" />
            </div>
            <Bone className="h-3 w-14" />
          </div>
        </section>

        <section className="mb-4 min-w-0" dir="ltr" aria-hidden>
          <div className="mb-1 flex w-full">
            <div
              className="w-7.5 shrink-0"
              style={{ marginInlineEnd: CELL_GAP }}
            />
            <div className="flex min-w-0 flex-1 justify-between">
              {Array.from({ length: 6 }, (_, i) => (
                <Bone key={i} className="h-3 w-7" />
              ))}
            </div>
          </div>
          <div className="flex w-full">
            <div
              className="grid w-7.5 shrink-0"
              style={{
                marginInlineEnd: CELL_GAP,
                gap: CELL_GAP,
                gridTemplateRows: "repeat(7, minmax(0, 1fr))",
              }}
            >
              {Array.from({ length: HEAT_DAYS }, (_, day) => (
                <div key={day} className="flex items-center justify-end">
                  {day === 0 || day === 6 ? null : (
                    <Bone className="h-2.5 w-full" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex min-w-0 flex-1" style={{ gap: CELL_GAP }}>
              {Array.from({ length: HEAT_WEEKS }, (_, week) => (
                <div
                  key={week}
                  className="flex min-w-0 flex-1 flex-col"
                  style={{ gap: CELL_GAP }}
                >
                  {Array.from({ length: HEAT_DAYS }, (_, day) => (
                    <span
                      key={day}
                      className={cn(
                        "w-full rounded-xs",
                        HEAT_LEVELS[skeletonHeatLevel(week, day)]
                      )}
                      style={{ height: 11 }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 flex items-center justify-end gap-1.5 text-xs text-foreground/55">
            <span>less</span>
            {HEAT_SWATCH.map((color, i) => (
              <span
                key={color}
                className="inline-block size-3 rounded-xs"
                style={{
                  backgroundColor: color,
                  boxShadow:
                    i === 0
                      ? "inset 0 0 0 1px color-mix(in oklab, var(--foreground) 18%, transparent)"
                      : undefined,
                }}
                aria-hidden
              />
            ))}
            <span>more</span>
          </div>
        </section>

        <section className="mb-4">
          <Segmented
            aria-label="Workouts or records"
            value="workouts"
            onChange={() => {}}
            options={[
              { value: "workouts", label: "Workouts" },
              { value: "records", label: "Records" },
            ]}
            disabled
            className="mb-4"
          />
          <div className="mb-3 flex justify-end">
            <Bone className="h-5.5 w-19 rounded-full" />
          </div>
          <ul className="space-y-2.5">
            {Array.from({ length: PICKUP_CARDS }, (_, i) => (
              <li
                key={i}
                className={cn(
                  "flex min-h-11 flex-col gap-1 rounded-xl bg-surface-1 px-3.5 py-3.5",
                  i === 0 && "ring-2 ring-primary ring-inset"
                )}
              >
                <div className="flex items-center gap-2">
                  <Bone className="h-5 min-w-0 flex-1" />
                  <Bone className="size-5 shrink-0 rounded-sm" />
                </div>
                <Bone className="h-3 w-3/4" />
                <div className="mt-1 flex items-center justify-between gap-3">
                  <Bone className="h-3 w-28" />
                  <Bone className="h-3 w-16" />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 bg-background">
        <div
          className="mx-auto w-full max-w-lg border-t border-border pt-3"
          style={{
            paddingInlineStart: `max(${PAGE_PAD_X}px, env(safe-area-inset-inline-start, 0px))`,
            paddingInlineEnd: `max(${PAGE_PAD_X}px, env(safe-area-inset-inline-end, 0px))`,
            paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
          }}
        >
          <Skeleton className="h-12 w-full bg-primary" />
        </div>
      </div>
    </div>
  )
}

export default HomeSkeleton
