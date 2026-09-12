import { cn } from "@/lib/utils"
import type { VolumePoint } from "@/types/session.types"

export function VolumeTrend({
  points,
  currentId,
}: {
  points: VolumePoint[]
  currentId: string
}) {
  if (points.length < 3) return null
  const peak = Math.max(...points.map((point) => point.volume), 1)

  return (
    <section className="mt-4" aria-label="Volume trend">
      <p className="mb-2 text-[11px] text-muted-foreground">Volume</p>
      <div className="flex h-12 items-end gap-1 rounded-xl bg-surface-1 px-3 py-2">
        {points.map((point) => {
          const current = point.sessionId === currentId
          const height = Math.max(6, Math.round((point.volume / peak) * 32))
          return (
            <span
              key={point.sessionId}
              className={cn(
                "min-w-0 flex-1 rounded-t-sm",
                current ? "bg-success" : "bg-muted-foreground/30"
              )}
              style={{ height }}
              aria-label={current ? "This session" : "Earlier session"}
            />
          )
        })}
      </div>
    </section>
  )
}
