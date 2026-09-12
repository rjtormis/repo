import { formatWeight, type WeightUnit } from "@/lib/units"

export function SessionStats({
  exerciseCount,
  setCount,
  volume,
  unit,
}: {
  exerciseCount: number
  setCount: number
  volume: number
  unit: WeightUnit
}) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      <Stat label="Exercises" value={String(exerciseCount)} />
      <Stat label="Sets" value={String(setCount)} />
      <Stat label="Volume" value={formatWeight(volume, unit)} />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-(--radius) bg-surface-1 p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-mono text-[17px] tabular-nums">
        {value}
      </p>
    </div>
  )
}
