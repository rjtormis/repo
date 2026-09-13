import { completedSets, sessionSetCount, sessionVolume, weightKg } from "@/components/session/lib"
import type { ShareCardData, ShareCardExtras, ShareCardRecord } from "@/components/session/share/types"
import { formatWeight, type WeightUnit } from "@/lib/units"
import type { HeatmapDatum } from "@/types/dashboard.types"
import type { WorkoutSessionDetail } from "@/types/session.types"

const SHARE_WEEKS = 26
const SHARE_DAYS = 7
const SHARE_CELLS = SHARE_WEEKS * SHARE_DAYS

export function shareHandle(name?: string | null, email?: string | null) {
  const raw =
    name?.trim().split(/\s+/)[0] || email?.split("@")[0] || "you"
  return raw.toLowerCase().replace(/[^a-z0-9]/g, "") || "you"
}

export function buildShareCardData(
  session: WorkoutSessionDetail,
  unit: WeightUnit,
  extras: ShareCardExtras = {}
): ShareCardData {
  const start = new Date(session.startedAt ?? session.createdAt)
  const end = session.endedAt
    ? new Date(session.endedAt)
    : lastCompletedAt(session)

  return {
    name: session.name,
    dateLabel: formatShareDate(start),
    durationLabel: formatShareDuration(start, end),
    exerciseCount: session.exercises.length,
    setCount: sessionSetCount(session),
    volumeLabel: formatWeight(sessionVolume(session), unit, { unit: false }),
    record: sessionRecord(session, unit),
    heatmap: heatmapLevels(extras.heatmap, start),
    monthsLabel: "Last 6 months",
    streakLabel: extras.streakCount
      ? `${extras.streakCount} ${extras.streakUnit === "day" ? "day" : "week"} streak`
      : null,
    handle: extras.handle ?? null,
  }
}

function formatShareDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
    .format(date)
    .toUpperCase()
}

function formatShareDuration(start: Date, end: Date | null) {
  if (!end) return null
  const minutes = Math.round((end.getTime() - start.getTime()) / 60_000)
  if (minutes < 1 || minutes > 180) return null
  return `${minutes} MIN`
}

function lastCompletedAt(session: WorkoutSessionDetail) {
  const iso = session.exercises
    .flatMap((row) => completedSets(row))
    .map((setLog) => setLog.completedAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1)
  return iso ? new Date(iso) : null
}

function sessionRecord(
  session: WorkoutSessionDetail,
  unit: WeightUnit
): ShareCardRecord | null {
  let best: ShareCardRecord | null = null
  let bestKg = 0

  for (const row of session.exercises) {
    const previous = session.previousByExercise?.[row.exercise.id]
    if (!previous) continue

    for (const setLog of completedSets(row)) {
      const kg = weightKg(setLog.weight)
      if (kg == null || kg <= previous.weightKg || kg <= bestKg) continue
      bestKg = kg
      best = {
        exerciseName: row.exercise.name,
        detail: `${formatWeight(kg, unit)} × ${setLog.reps}`,
      }
    }
  }

  return best
}

function heatmapLevels(data: HeatmapDatum[] | undefined, end: Date) {
  const levels = Array.from({ length: SHARE_CELLS }, () => 0)
  if (!data?.length) return levels

  const byDay = new Map<string, number>()
  for (const item of data) {
    const key = toDayKey(new Date(item.date))
    byDay.set(key, (byDay.get(key) ?? 0) + item.value)
  }

  const cursor = startOfWeek(end, 0)
  cursor.setDate(cursor.getDate() - (SHARE_WEEKS - 1) * 7)

  for (let week = 0; week < SHARE_WEEKS; week++) {
    for (let day = 0; day < SHARE_DAYS; day++) {
      const value = byDay.get(toDayKey(cursor)) ?? 0
      levels[week * SHARE_DAYS + day] =
        value <= 0 ? 0 : Math.min(3, Math.round(value))
      cursor.setDate(cursor.getDate() + 1)
    }
  }

  return levels
}

function startOfWeek(date: Date, weekStartsOn: 0 | 1) {
  const next = new Date(date)
  next.setHours(12, 0, 0, 0)
  const shift = (next.getDay() - weekStartsOn + 7) % 7
  next.setDate(next.getDate() - shift)
  return next
}

function toDayKey(date: Date) {
  return date.toLocaleDateString("en-CA")
}
