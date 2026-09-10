import { getOrCreateDailyMotivation } from "@/actions/motivation"
import { getUserSessions } from "@/actions/sessions"
import { getUserStreak } from "@/actions/streak"
import { HeatmapDatum } from "@/components/heatmap-calendar"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

// TODO: FIX ROUTE LOGIC NEED TO MAKE THIS ONE CLEAR AND SIMPLE.
const XP_FOR_LEVEL = (level: number) => Math.floor(100 * Math.pow(level, 1.5))

function sessionDay(iso: Date | string) {
  return new Date(iso).toLocaleDateString("en-CA") // still server TZ — see below
}

export function levelProgress(totalXp: number) {
  let current = 1
  while (totalXp >= XP_FOR_LEVEL(current + 1)) current++

  const floor = XP_FOR_LEVEL(current)
  const ceiling = XP_FOR_LEVEL(current + 1)

  return {
    current,
    xpIntoLevel: totalXp - floor,
    xpForNextLevel: ceiling - floor,
  }
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return NextResponse.json(
      {
        message: "Please sign in to create workout",
      },
      { status: 400 }
    )
  }

  const { id: userId } = session.user

  const currentDate = request.nextUrl.searchParams.get("date") as string

  const { motivationMessages } = await getOrCreateDailyMotivation({
    userId,
    date: currentDate,
  })

  const xpForLevel = (level: number) => Math.floor(100 * Math.pow(level, 1.5))
  const levelFromXp = (xp: number) => {
    let level = 1
    while (xp >= xpForLevel(level + 1)) level++
    return level
  }

  const currentSessions = await getUserSessions({
    userId: userId,
    position: "asc",
  })

  const streak = await getUserStreak({
    userId,
    date: currentDate,
    weekStartsOn: session.user.weekStartsOn as 0 | 1,
  })

  const heatData = Object.values(
    currentSessions
      .filter((s) => s.setCount > 0)
      .reduce<Record<string, HeatmapDatum>>((acc, s) => {
        const date = sessionDay(s.lastDoneAt) // better: s.startedAt
        acc[date] ??= { date, value: 0 }
        acc[date].value = Math.min(3, acc[date].value + 1)
        return acc
      }, {})
  )

  const data = {
    sessions: {
      total: currentSessions.length,
      thisWeeky: 3,
      weeklyTarget: 5,
    },
    streak: streak,
    level: levelProgress(session!.user.totalExp as number),
    motivation: {
      lead: motivationMessages.lead,
      accent: motivationMessages.accent,
      author: motivationMessages.author,
    },
    heatmap: heatData,
    recentSessions: currentSessions,
  }

  return NextResponse.json(data, { status: 200 })
}
