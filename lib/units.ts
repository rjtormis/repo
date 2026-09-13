export type WeightUnit = "kg" | "lb"

export const LB_PER_KG = 2.2046226218

export function parseWeightUnit(value: unknown): WeightUnit {
  return value === "lb" ? "lb" : "kg"
}

export function parseWeekStart(value: unknown): 0 | 1 {
  return value === 1 ? 1 : 0
}

export function parseWorkoutDays(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.min(7, Math.max(0, Math.round(n)))
}

function round(value: number, digits: number) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export function kgToDisplay(kg: number, unit: WeightUnit): number {
  if (unit === "lb") return round(kg * LB_PER_KG, 1)
  return round(kg, 1)
}

export function displayToKg(value: number, unit: WeightUnit): number {
  if (unit === "lb") return round(value / LB_PER_KG, 4)
  return round(value, 2)
}

export function weightDisplayStep(unit: WeightUnit): number {
  return unit === "lb" ? 5 : 2.5
}

export function stepDisplayWeight(
  current: number | null,
  unit: WeightUnit,
  direction: 1 | -1
): number | null {
  const step = weightDisplayStep(unit)
  if (current == null) return direction < 0 ? null : step
  const next = round((Math.round(current / step) + direction) * step, 1)
  return next <= 0 ? null : next
}

/** Epley. 1-rep sets are the weight itself. */
export function estimated1rmKg(weightKg: number, reps: number) {
  if (reps <= 1) return weightKg
  return weightKg * (1 + reps / 30)
}

export function formatWeight(
  kg: number | null | undefined,
  unit: WeightUnit,
  options?: { unit?: boolean }
): string {
  if (kg == null) return "BW"
  const amount = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(kgToDisplay(kg, unit))
  return options?.unit === false ? amount : `${amount} ${unit}`
}
