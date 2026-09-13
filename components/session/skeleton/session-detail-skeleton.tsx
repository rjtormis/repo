import Link from "next/link"
import { IconChevronLeft, IconDotsVertical } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

const TREND = [18, 24, 16, 28, 22, 32]
const CARDS = [
  { name: "w-[46%]", chips: 4 },
  { name: "w-[62%]", chips: 3 },
  { name: "w-[38%]", chips: 5 },
] as const

export function SessionDetailSkeleton() {
  return (
    <div
      className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading workout</span>
      <header>
        <div className="flex min-w-0 items-center gap-1">
          <Button
            variant="quiet"
            size="icon-touch"
            render={<Link href="/dashboard" />}
            aria-label="Back"
          >
            <IconChevronLeft className="size-5.5 rtl:rotate-180" stroke={1.5} />
          </Button>
          <div className="min-w-0 flex-1 pt-2">
            <Skeleton className="h-5 w-[48%]" />
            <Skeleton className="mt-2 h-3 w-24" />
          </div>
          <Button variant="quiet" size="icon-touch" disabled aria-hidden>
            <IconDotsVertical className="size-5.5" stroke={1.5} />
          </Button>
        </div>
      </header>

      <div className="mt-4 grid grid-cols-3 gap-2" aria-hidden>
        {["Exercises", "Sets", "Volume"].map((label) => (
          <div key={label} className="rounded-(--radius) bg-surface-1 p-3">
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <Skeleton className="mt-1 h-4.25 w-10" />
          </div>
        ))}
      </div>

      <section className="mt-4" aria-hidden>
        <p className="mb-2 text-[11px] text-muted-foreground">Volume</p>
        <div className="flex h-12 items-end gap-1 rounded-xl bg-surface-1 px-3 py-2">
          {TREND.map((height, i) => (
            <span
              key={i}
              className={
                i === TREND.length - 1
                  ? "min-w-0 flex-1 rounded-t-sm bg-success"
                  : "min-w-0 flex-1 rounded-t-sm bg-muted-foreground/30"
              }
              style={{ height }}
            />
          ))}
        </div>
      </section>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto pt-4" aria-hidden>
        <ul className="space-y-2">
          {CARDS.map((card, i) => (
            <li key={i} className="min-w-0 space-y-3 rounded-xl bg-surface-1 p-3">
              <Skeleton className={`h-5 ${card.name}`} />
              <div className="flex gap-2">
                {Array.from({ length: card.chips }, (_, chip) => (
                  <span
                    key={chip}
                    className="inline-flex h-11 w-13 shrink-0 flex-col items-center justify-center gap-1 rounded-md bg-success"
                  >
                    <Skeleton className="h-2 w-6 bg-success-foreground/25" />
                    <Skeleton className="h-3 w-5 bg-success-foreground/35" />
                  </span>
                ))}
              </div>
              <div className="flex items-end justify-between gap-3 border-t border-border pt-3">
                <Skeleton className="h-3 w-12" />
                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="h-2.5 w-10" />
                  <Skeleton className="h-3.5 w-14" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
        <Skeleton className="h-12 w-full bg-primary" />
      </div>
    </div>
  )
}
