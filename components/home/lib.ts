"use client"
import {
  CELL_GAP,
  MAX_CELL,
  MIN_CELL,
  MIN_DAYS,
  TARGET_DAYS,
  WEEK_STARTS_ON,
} from "@/components/home/constants"
import type { SessionCard } from "@/components/home/types"
import { addDays, startOfDayLocal, startOfWeekLocal } from "@/lib/dates"

export function exactWeekColumns(
  end: Date,
  rangeDays: number,
  weekStartsOn: 0 | 1 = WEEK_STARTS_ON
): number {
  const endDay = startOfDayLocal(end)
  const start = addDays(endDay, -(rangeDays - 1))
  const firstWeek = startOfWeekLocal(start, weekStartsOn)
  const totalDays =
    Math.ceil((endDay.getTime() - firstWeek.getTime()) / 86400000) + 1
  return Math.ceil(totalDays / 7)
}

export function fitHeatmap(
  widthPx: number,
  end: Date | null,
  weekStartsOn: 0 | 1 = WEEK_STARTS_ON
): { rangeDays: number; cellSize: number } {
  if (widthPx <= 0) {
    return { rangeDays: TARGET_DAYS, cellSize: 11 }
  }

  let rangeDays = TARGET_DAYS
  const weeksFor = (days: number) =>
    end ? exactWeekColumns(end, days, weekStartsOn) : Math.ceil(days / 7)

  while (rangeDays > MIN_DAYS) {
    const weeks = Math.max(1, weeksFor(rangeDays))
    const cell = (widthPx - (weeks - 1) * CELL_GAP) / weeks
    if (cell >= MIN_CELL) {
      return {
        rangeDays,
        cellSize: Math.min(MAX_CELL, Math.max(MIN_CELL, Math.round(cell))),
      }
    }
    rangeDays = Math.max(MIN_DAYS, rangeDays - 7)
  }

  const weeks = Math.max(1, weeksFor(rangeDays))
  const cell = (widthPx - (weeks - 1) * CELL_GAP) / weeks
  return {
    rangeDays,
    cellSize: Math.min(MAX_CELL, Math.max(MIN_CELL, Math.round(cell))),
  }
}

export function monthsFromDays(days: number): number {
  return Math.max(1, Math.round(days / 30.44))
}

export function formatElapsed(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60_000))
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m}m`
  return `${h}h ${String(m).padStart(2, "0")}m`
}

export function formatAgo(days: number): string {
  if (days === 0) return "today"
  if (days === 1) return "1 day ago"
  return `${days} days ago`
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export function formatHomeDate(d: Date): string {
  const weekday = d.toLocaleDateString(undefined, { weekday: "long" })
  const month = d.toLocaleDateString(undefined, { month: "long" })
  return `${weekday}, ${month} ${d.getDate()}`.toUpperCase()
}

export function formatXp(n: number): string {
  return n.toLocaleString() + " XP"
}

const XP_PER_SESSION = 40
const XP_PER_LEVEL = 160

export function progressFromSessions(sessions: number) {
  const xp = Math.max(0, sessions) * XP_PER_SESSION
  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  const xpIntoLevel = xp % XP_PER_LEVEL
  return {
    level,
    xpIntoLevel,
    xpToNext: XP_PER_LEVEL - xpIntoLevel,
    nextLevel: level + 1,
    fill: xpIntoLevel / XP_PER_LEVEL,
  }
}

export function exercisePreview(labels: string[]): string {
  const shown = labels.slice(0, 3).join(" · ")
  const remaining = labels.length - 3
  return remaining > 0 ? `${shown}  +${remaining}` : shown
}

export function sessionSize(card: SessionCard): string {
  const exerciseLabel = card.exercises.length === 1 ? "exercise" : "exercises"
  const setLabel = card.setCount === 1 ? "set" : "sets"
  return `${card.exercises.length} ${exerciseLabel} · ${card.setCount} ${setLabel}`
}

const MS_PER_DAY = 86_400_000

export function daysSince(lastDoneAt: Date, today = new Date()): number {
  const a = new Date(lastDoneAt).setHours(0, 0, 0, 0)
  const b = new Date(today).setHours(0, 0, 0, 0)
  return Math.round((b - a) / MS_PER_DAY)
}

export function orderPickupCards(cards: SessionCard[]): SessionCard[] {
  const logged = cards.filter((card) => card.setCount > 0 && card.lastDoneAt)
  if (logged.length === 0) return []
  const sorted = [...logged].sort(
    (a, b) =>
      daysSince(new Date(b.lastDoneAt ?? 0)) -
      daysSince(new Date(a.lastDoneAt ?? 0))
  )
  const [suggested, ...rest] = sorted
  rest.sort(
    (a, b) =>
      daysSince(new Date(b.lastDoneAt ?? 0)) -
      daysSince(new Date(a.lastDoneAt ?? 0))
  )
  return [suggested, ...rest].slice(0, 3)
}
