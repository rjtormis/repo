import type { Ref } from "react"
import { LogoMark } from "@/components/logo"
import {
  SHARE_HEATMAP_MIN_SESSIONS,
  SHARE_STORY_HEIGHT,
  SHARE_STORY_SAFE_Y,
  SHARE_STORY_WIDTH,
  type ShareCardData,
  type ShareVariant,
} from "@/components/session/share/types"

const HEAT = ["#2a2a2a", "#1f6b40", "#3db872", "#9be7b6"] as const

export function ShareCard({
  data,
  variant = "session",
  cardRef,
}: {
  data: ShareCardData
  variant?: ShareVariant
  cardRef?: Ref<HTMLDivElement>
}) {
  return (
    <div
      ref={cardRef}
      dir="ltr"
      className="flex shrink-0 flex-col bg-[#0A0A0A] px-4"
      style={{
        width: SHARE_STORY_WIDTH,
        height: SHARE_STORY_HEIGHT,
        paddingTop: SHARE_STORY_SAFE_Y,
        paddingBottom: SHARE_STORY_SAFE_Y,
      }}
    >
      <article className="flex min-h-0 flex-1 flex-col rounded-[22px] border border-white/10 bg-[#141414] px-5 pt-5 pb-4 text-white">
        <ShareBrand />
        {variant === "pr" ? (
          <PrBody data={data} />
        ) : (
          <SessionBody data={data} />
        )}
      </article>
    </div>
  )
}

function ShareBrand() {
  return (
    <div className="flex items-center gap-2">
      <LogoMark className="size-5" onNavy title="Repo" />
      <span className="font-mono text-sm font-semibold tracking-tight">
        Repo
      </span>
    </div>
  )
}

function SessionHeading({ data }: { data: ShareCardData }) {
  return (
    <>
      <p className="mt-6 text-[11px] font-medium tracking-[0.14em] text-white/45 uppercase">
        {data.dateLabel}
        {data.durationLabel ? ` · ${data.durationLabel}` : ""}
      </p>
      <h1 className="mt-1.5 line-clamp-2 min-w-0 text-[34px] leading-[1.05] font-semibold tracking-tight wrap-break-word">
        {data.name}
      </h1>
    </>
  )
}

function SessionBody({ data }: { data: ShareCardData }) {
  if (data.sessionCount < SHARE_HEATMAP_MIN_SESSIONS) {
    return <SessionHeroBody data={data} />
  }

  const streakUnit = data.streakUnit === "day" ? "day" : "week"

  return (
    <>
      <SessionHeading data={data} />

      <div className="mt-7 grid w-full shrink-0 grid-cols-3 gap-x-3">
        <ShareStat label="Exercises" value={String(data.exerciseCount)} />
        <ShareStat label="Sets" value={String(data.setCount)} />
        <ShareStat
          label="Volume"
          value={data.volumeAmount}
          unit={data.volumeUnit}
        />
      </div>

      {data.streakCount != null ? (
        <div className="mt-7 shrink-0">
          <ShareStat
            label={`${streakUnit} streak`}
            value={String(data.streakCount)}
          />
        </div>
      ) : null}

      <div className="mt-7 flex min-h-0 flex-1 flex-col">
        <p className="shrink-0 text-[10px] font-medium tracking-[0.14em] text-white/40 uppercase">
          {data.monthsLabel}
        </p>
        <ShareHeatmap levels={data.heatmap} />
        <ShareUrl handle={data.handle} />
      </div>
    </>
  )
}

function SessionHeroBody({ data }: { data: ShareCardData }) {
  const details = [
    `${data.exerciseCount} ${data.exerciseCount === 1 ? "exercise" : "exercises"}`,
    `${data.setCount} ${data.setCount === 1 ? "set" : "sets"}`,
  ].join(" · ")

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SessionHeading data={data} />

      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <p className="font-mono text-[72px] leading-none font-medium tracking-tight tabular-nums">
          {data.volumeAmount}
          <span className="text-[28px] font-medium text-white/70">
            {" "}
            {data.volumeUnit}
          </span>
        </p>
        <p className="mt-3 font-mono text-[22px] leading-none font-medium text-white/80 tabular-nums">
          {details}
        </p>
      </div>

      <ShareUrl handle={data.handle} />
    </div>
  )
}

function PrBody({ data }: { data: ShareCardData }) {
  const record = data.record
  if (!record) {
    return (
      <div className="flex min-h-0 flex-1 flex-col justify-between pt-10">
        <div>
          <h1 className="text-[34px] leading-none font-semibold tracking-tight">
            No record this session
          </h1>
          <p className="mt-3 max-w-[16rem] text-sm leading-5 text-white/45">
            Beat last time’s weight on a completed set and this card writes
            itself.
          </p>
        </div>
        <ShareUrl handle={data.handle} />
      </div>
    )
  }

  const previous = record.previous
  const previousLine = previous
    ? [
        `${previous.amount} ${previous.unit}`,
        previous.reps != null ? `× ${previous.reps}` : null,
        previous.dateLabel,
      ]
        .filter(Boolean)
        .join(" · ")
    : null

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p className="mt-10 text-[11px] font-medium tracking-[0.16em] text-[#9be7b6] uppercase">
        New record
      </p>
      <h1 className="mt-2 text-[34px] leading-none font-semibold tracking-tight text-balance">
        {record.exerciseName}
      </h1>

      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <p className="font-mono text-[72px] leading-none font-medium tracking-tight tabular-nums">
          {record.weightAmount}
          <span className="text-[28px] font-medium text-white/70">
            {" "}
            {record.weightUnit}
          </span>
        </p>
        <p className="mt-3 font-mono text-[28px] leading-none font-medium text-white/80 tabular-nums">
          × {record.reps} reps
        </p>
      </div>

      <div>
        {previousLine ? (
          <>
            <p className="text-[10px] font-medium tracking-[0.14em] text-white/40 uppercase">
              Previous best
            </p>
            <p className="mt-1.5 font-mono text-sm text-white/55 tabular-nums">
              {previousLine}
            </p>
          </>
        ) : (
          <p className="text-sm text-white/40">First weighted record.</p>
        )}
        <ShareUrl handle={data.handle} />
      </div>
    </div>
  )
}

function ShareUrl({ handle }: { handle: string | null }) {
  return (
    <p className="mt-4 font-mono text-[12px] text-[#8A8A8A]">
      repo.fit/u/{handle ?? "you"}
    </p>
  )
}

function ShareStat({
  label,
  value,
  unit,
}: {
  label: string
  value: string
  unit?: string
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium tracking-[0.14em] text-white/40 uppercase">
        {label}
      </p>
      <p className="mt-1 whitespace-nowrap font-mono text-2xl leading-none font-medium tracking-tight tabular-nums">
        {value}
        {unit ? (
          <span className="text-[15px] font-medium text-white/70"> {unit}</span>
        ) : null}
      </p>
    </div>
  )
}

function ShareHeatmap({ levels }: { levels: number[] }) {
  const weeks = 26
  const days = 7

  return (
    <div
      className="mt-3 grid min-h-0 w-full flex-1"
      style={{
        gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${days}, minmax(0, 1fr))`,
        gap: 3,
      }}
      aria-hidden
    >
      {Array.from({ length: days }, (_, day) =>
        Array.from({ length: weeks }, (_, week) => {
          const level = levels[week * days + day] ?? 0
          return (
            <span
              key={`${week}-${day}`}
              className="min-h-0 min-w-0 rounded-[1.5px]"
              style={{ background: HEAT[level] ?? HEAT[0] }}
            />
          )
        })
      )}
    </div>
  )
}
