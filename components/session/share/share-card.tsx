import type { Ref } from "react"
import { LogoMark } from "@/components/logo"
import type { ShareCardData } from "@/components/session/share/types"

const HEAT = ["#2a2a2a", "#1f6b40", "#3db872", "#9be7b6"] as const

export function ShareCard({
  data,
  cardRef,
}: {
  data: ShareCardData
  cardRef?: Ref<HTMLDivElement>
}) {
  return (
    <div
      ref={cardRef}
      dir="ltr"
      className="flex w-[360px] flex-col bg-[#0a0a0a] p-5"
    >
      <article className="flex min-h-[540px] flex-col rounded-[28px] bg-[#212121] px-6 pt-6 pb-5 text-white">
        <div className="flex items-center gap-2">
          <LogoMark className="size-5" onNavy title="Repo" />
          <span className="font-mono text-sm font-semibold tracking-tight">
            Repo
          </span>
        </div>

        <p className="mt-7 text-[11px] font-medium tracking-[0.14em] text-white/45 uppercase">
          {data.dateLabel}
          {data.durationLabel ? ` · ${data.durationLabel}` : ""}
        </p>
        <h1 className="mt-2 text-[40px] leading-none font-semibold tracking-tight">
          {data.name}
        </h1>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <ShareStat label="Exercises" value={String(data.exerciseCount)} />
          <ShareStat label="Sets" value={String(data.setCount)} />
          <ShareStat label="Volume" value={data.volumeLabel} />
        </div>

        {data.record ? (
          <div className="mt-6 rounded-xl bg-[#163d28] px-3.5 py-3">
            <p className="text-[10px] font-medium tracking-[0.16em] text-[#9be7b6] uppercase">
              New record
            </p>
            <p className="mt-1 truncate text-sm font-medium">
              {data.record.exerciseName}
              <span className="text-white/55">
                {" · "}
                {data.record.detail}
              </span>
            </p>
          </div>
        ) : null}

        <div className="mt-auto pt-10">
          <p className="text-[10px] font-medium tracking-[0.14em] text-white/40 uppercase">
            {data.monthsLabel}
            {data.streakLabel ? ` · ${data.streakLabel}` : ""}
          </p>
          <ShareHeatmap levels={data.heatmap} />
          <p className="mt-5 font-mono text-[11px] text-white/35">
            repo.fit/u/{data.handle ?? "you"}
          </p>
        </div>
      </article>
    </div>
  )
}

function ShareStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium tracking-[0.14em] text-white/40 uppercase">
        {label}
      </p>
      <p className="mt-1 font-mono text-2xl leading-none font-medium tabular-nums">
        {value}
      </p>
    </div>
  )
}

function ShareHeatmap({ levels }: { levels: number[] }) {
  const weeks = 26
  const days = 7

  return (
    <div className="mt-3 flex gap-[3px]" aria-hidden>
      {Array.from({ length: weeks }, (_, week) => (
        <div key={week} className="flex flex-col gap-[3px]">
          {Array.from({ length: days }, (_, day) => {
            const level = levels[week * days + day] ?? 0
            return (
              <span
                key={day}
                className="size-[7px] rounded-[1.5px]"
                style={{ background: HEAT[level] ?? HEAT[0] }}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
