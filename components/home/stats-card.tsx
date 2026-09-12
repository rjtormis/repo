import { IconFlame } from "@tabler/icons-react"
import { MotivationLine } from "@/components/home/motivation-line"
import { WeekRing } from "@/components/home/week-ring"
import { formatXp } from "@/components/home/lib"

type Motivation = {
  lead?: string
  accent?: string
  author?: string | null
}

type Level = {
  current?: number
  xpIntoLevel?: number
  xpForNextLevel?: number
}

export function StatsCard({
  streak,
  motivation,
  sessions,
  sessionsReady,
  weekDone,
  weekGoal,
  level,
  xpToNext,
}: {
  streak: number
  motivation?: Motivation
  sessions: number
  sessionsReady: boolean
  weekDone: number
  weekGoal: number
  level?: Level
  xpToNext: number
}) {
  return (
    <section className="mb-4 rounded-3xl bg-surface-1 p-4">
      {streak > 0 ? (
        <p className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-bg-success px-2.5 py-1 text-[12px] font-medium text-text-success">
          <IconFlame className="size-3.5" stroke={1.75} aria-hidden />
          <span className="font-mono tabular-nums">{streak}</span>
          {" week streak"}
        </p>
      ) : null}
      <MotivationLine
        lead={motivation?.lead}
        accent={motivation?.accent}
        author={motivation?.author}
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xl leading-none font-semibold tabular-nums">
            {sessionsReady ? sessions : "\u00a0"}
          </p>
          <p className="mt- text-sm text-muted-foreground">
            {sessions === 1 ? "Session done" : "Sessions done"}
          </p>
        </div>
        <WeekRing done={weekDone} goal={weekGoal} />
      </div>
      <div className="mt-4 flex items-center gap-3 border-t border-border pt-3">
        <p className="shrink-0 font-mono text-sm tabular-nums">
          Lv {level?.current}
        </p>
        <div
          className="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-heat-empty"
          role="progressbar"
          aria-valuenow={level?.xpIntoLevel ?? 0}
          aria-valuemin={0}
          aria-valuemax={level?.xpForNextLevel ?? 0}
          aria-label={`Level ${level?.current}, ${formatXp(
            (level?.xpForNextLevel ?? 0) - (level?.xpIntoLevel ?? 0)
          )} to level ${(level?.current ?? 0) + 1}`}
        >
          <div
            className="h-full rounded-full bg-success"
            style={{
              width: `${
                level?.xpForNextLevel
                  ? Math.min(
                      100,
                      ((level.xpIntoLevel ?? 0) / level.xpForNextLevel) * 100
                    )
                  : 0
              }%`,
            }}
          />
        </div>
        <p className="shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
          {formatXp(xpToNext)}
        </p>
      </div>
    </section>
  )
}
