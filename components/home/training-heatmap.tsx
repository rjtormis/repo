import type { RefObject } from "react"
import {
  HeatmapCalendar,
  type HeatmapCell,
} from "@/components/heatmap-calendar"
import type { HeatmapDatum } from "@/types/dashboard.types"
import {
  CELL_GAP,
  HEAT_LEVELS,
  HEAT_SWATCH,
} from "@/components/home/constants"

export function TrainingHeatmap({
  measureRef,
  monthsShown,
  ready,
  weekStartsOn,
  data,
  rangeDays,
  endDate,
  cellSize,
  onCellClick,
}: {
  measureRef: RefObject<HTMLDivElement | null>
  monthsShown: number
  ready: boolean
  weekStartsOn: 0 | 1
  data: HeatmapDatum[]
  rangeDays: number
  endDate: Date | null
  cellSize: number
  onCellClick: (cell: HeatmapCell) => void
}) {
  return (
    <section
      aria-label={`Training last ${monthsShown} months`}
      className="mb-4 min-w-0"
      dir="ltr"
    >
      <div
        ref={measureRef}
        className="w-full max-w-full min-w-0 overflow-hidden"
      >
        {ready && endDate ? (
          <div className="flex w-full max-w-full flex-col overflow-hidden">
            <HeatmapCalendar
              key={weekStartsOn}
              data={data}
              rangeDays={rangeDays}
              endDate={endDate}
              weekStartsOn={weekStartsOn}
              cellSize={cellSize}
              cellGap={CELL_GAP}
              fillWidth
              axisLabels={{
                showWeekdays: true,
                showMonths: true,
                weekdayIndices: [0, 1, 2, 3, 4, 5, 6],
              }}
              legend={false}
              levelClassNames={HEAT_LEVELS}
              getLevel={(value) => {
                if (value <= 0) return 0
                return Math.min(3, Math.round(value))
              }}
              onCellClick={onCellClick}
              renderTooltip={(cell) => {
                if (cell.disabled) return "Outside range"
                if (cell.future) return "Upcoming"
                if (cell.value <= 0) return `${cell.label}: no sessions`
                return (
                  <div className="text-sm">
                    <div className="font-medium">1 session</div>
                    <div className="text-muted-foreground">{cell.label}</div>
                  </div>
                )
              }}
              className="max-w-full overflow-hidden"
            />
            <div className="mt-2 flex items-center justify-end gap-1.5 text-xs text-foreground/55">
              <span>less</span>
              {HEAT_SWATCH.map((color, i) => (
                <span
                  key={color}
                  className="inline-block rounded-xs"
                  style={{
                    width: cellSize,
                    height: cellSize,
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
            <p className="mt-1 text-end text-[11px] leading-none text-foreground/45">
              Volume per day · tap a day to see that session
            </p>
          </div>
        ) : (
          <div
            className="w-full"
            style={{ height: 16 + 7 * 11 + 6 * CELL_GAP }}
            aria-hidden
          />
        )}
      </div>
    </section>
  )
}
