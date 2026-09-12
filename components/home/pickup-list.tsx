import Link from "next/link"
import { IconChevronRight } from "@tabler/icons-react"
import {
  daysSince,
  exercisePreview,
  formatAgo,
  sessionSize,
} from "@/components/home/lib"
import type { SessionCard } from "@/components/home/types"
import { cn } from "@/lib/utils"

export function PickupList({ cards }: { cards: SessionCard[] }) {
  if (cards.length === 0) return null

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <span className="shrink-0 rounded-full bg-surface-2 px-2 py-1 font-mono text-[11px] text-secondary-foreground tabular-nums">
          {cards.length} {cards.length === 1 ? "workout" : "workouts"}
        </span>
      </div>
      <ul className="space-y-2.5">
        {cards.map((card, index) => {
          const isSuggested = index === 0
          return (
            <li key={card.id}>
              <Link
                href={`/session/${card.id}`}
                className={cn(
                  "flex min-h-11 flex-col gap-1 rounded-xl bg-surface-1 px-3.5 py-3.5 transition-colors",
                  "hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  isSuggested ? "ring-2 ring-primary ring-inset" : "ring-0"
                )}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <h3
                    className="min-w-0 flex-1 truncate text-base font-medium"
                    title={card.name}
                  >
                    {card.name}
                  </h3>
                  <IconChevronRight
                    className={cn(
                      "size-5 shrink-0 rtl:rotate-180",
                      isSuggested ? "text-primary" : "text-muted-foreground"
                    )}
                    stroke={1.5}
                    aria-hidden
                  />
                </div>
                <p
                  className="min-w-0 truncate font-mono text-xs text-muted-foreground"
                  title={card.exercises.join(" · ")}
                >
                  {exercisePreview(card.exercises)}
                </p>
                <div className="mt-1 flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
                  <span className="min-w-0 truncate font-mono tabular-nums">
                    {sessionSize(card)}
                  </span>
                  <span className="shrink-0 font-mono tabular-nums">
                    {formatAgo(daysSince(new Date(card.lastDoneAt)))}
                  </span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
