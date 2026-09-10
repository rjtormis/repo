import { addDays, startOfWeekLocal, toDateKey } from "@/lib/dates"
import { getUserSessions } from "./sessions"

const weekKey = (d: Date, weekStartsOn: 0 | 1) =>
  toDateKey(startOfWeekLocal(d, weekStartsOn))

export async function getUserStreak({
  userId,
  date, // "2026-09-10" from the client
  weekStartsOn,
}: {
  userId: string
  date: string
  weekStartsOn: 0 | 1
}) {
  const sessions = await getUserSessions({ userId, position: "desc" })
  const weeksWithWork = new Set(
    sessions
      .filter((s) => s.setCount > 0)
      .map((s) => weekKey(new Date(s.lastDoneAt), weekStartsOn))
  )

  const today = new Date(`${date}T12:00:00`)
  let cursor = startOfWeekLocal(today, weekStartsOn)
  const thisWeek = weekKey(cursor, weekStartsOn)
  const trainedThisWeek = weeksWithWork.has(thisWeek)

  if (!trainedThisWeek) cursor = addDays(cursor, -7)

  let count = 0
  for (let w = 0; w < 52; w++) {
    if (!weeksWithWork.has(weekKey(cursor, weekStartsOn))) break
    count += 1
    cursor = addDays(cursor, -7)
  }

  return {
    unit: "week" as const,
    count,
    isAtRisk: count > 0 && !trainedThisWeek,
  }
}
