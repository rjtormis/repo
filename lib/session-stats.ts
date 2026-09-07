import { activityByDay } from "@/lib/demo-data"

function toKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** Current streak from logged-set calendar days. Neutral count — no guilt UX. */
export function currentStreak(today = new Date()): number {
  const cursor = new Date(today)
  cursor.setHours(12, 0, 0, 0)

  let streak = 0
  // If today has no sets yet, start from yesterday (still in a streak)
  if (!activityByDay[toKey(cursor)]) {
    cursor.setDate(cursor.getDate() - 1)
  }

  while (activityByDay[toKey(cursor)]) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export type HeatDay = {
  date: string
  count: number
  /** 0–4 provisional levels from set count — tonnage vs count still open. */
  level: number
}

export function yearHeatmap(today = new Date()): HeatDay[] {
  const end = new Date(today)
  end.setHours(12, 0, 0, 0)
  const start = new Date(end)
  start.setDate(start.getDate() - 364)

  // Align to week start (Sunday) so columns are weeks — mirrors GitHub layout
  const aligned = new Date(start)
  aligned.setDate(aligned.getDate() - aligned.getDay())

  const days: HeatDay[] = []
  const cursor = new Date(aligned)
  while (cursor <= end) {
    const key = toKey(cursor)
    const count = activityByDay[key] ?? 0
    let level = 0
    if (count >= 1) level = 1
    if (count >= 4) level = 2
    if (count >= 8) level = 3
    if (count >= 12) level = 4
    days.push({ date: key, count, level })
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}
