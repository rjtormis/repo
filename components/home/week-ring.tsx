export function WeekRing({ done, goal }: { done: number; goal: number }) {
  const size = 108
  const stroke = 7
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = goal <= 0 ? 0 : Math.min(1, done / goal)
  const offset = c * (1 - pct)

  return (
    <div className="flex shrink-0 flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          role="img"
          aria-hidden
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--heat-empty)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--success)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-[1.65rem] leading-none font-semibold tracking-tight tabular-nums">
            {done}
            <span className="text-base font-medium text-muted-foreground">
              /{goal}
            </span>
          </span>
          <span className="mt-1 text-[11px] leading-none text-muted-foreground">
            this week
          </span>
        </div>
      </div>
      <span className="sr-only">{`${done} of ${goal} sessions this week`}</span>
    </div>
  )
}
