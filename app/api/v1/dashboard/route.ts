import { NextResponse } from "next/server"

export async function GET() {
  const data = {
    sessions: {
      total: 55,
      thisWeeky: 3,
      weeklyTarget: 5,
    },
    streak: {
      unit: "day",
      count: 3,
      isAtRisk: true,
    },
    level: {
      current: 14,
      xpIntoLevel: 2200,
      xpForNextLevel: 2240,
    },
    motivation: {
      lead: "Make today",
      accent: "count.",
      author: null,
    },
    heatmap: [
      { date: "2026-09-09", volume: 4200 },
      // 365 entries
    ],
    recentSessions: [
      {
        id: "...",
        name: "Upper Body Hypertrophy — Week 3 Deload",
        exercises: ["Bench Press", "Overhead Press", "Barbell Row"],
        exerciseCount: 8,
        setCount: 24,
        lastDoneAt: "2026-08-31",
      },
    ],
  }

  return NextResponse.json(data, { status: 200 })
}
