import { getOrCreateDailyMotivation } from "@/actions/motivation"
import { getPersonalRecords } from "@/actions/records"
import { getSessions } from "@/actions/sessions"
import { getUserStreak } from "@/actions/streak"
import type { HeatmapDatum } from "@/types/dashboard.types"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

// TODO: FIX ROUTE LOGIC NEED TO MAKE THIS ONE CLEAR AND SIMPLE.
const XP_FOR_LEVEL = (level: number) => Math.floor(100 * Math.pow(level, 1.5))

function sessionDay(iso: Date | string) {
  return new Date(iso).toLocaleDateString("en-CA") // still server TZ — see below
}

const XP_PER_SESSION = 40

export function levelProgress(totalXp: number) {
  const xp = Math.max(0, totalXp)
  let current = 1
  while (xp >= XP_FOR_LEVEL(current + 1)) current++

  const floor = current === 1 ? 0 : XP_FOR_LEVEL(current)
  const ceiling = XP_FOR_LEVEL(current + 1)

  return {
    current,
    xpIntoLevel: xp - floor,
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

  const currentSessions = await getSessions({
    userId: userId,
    position: "asc",
  })

  const streak = await getUserStreak({
    userId,
    date: currentDate,
    weekStartsOn: session.user.weekStartsOn as 0 | 1,
  })

  const records = await getPersonalRecords({ userId })
  const loggedSessions = currentSessions.filter((s) => s.setCount > 0)

  const heatData = Object.values(
    loggedSessions.reduce<Record<string, HeatmapDatum>>((acc, s) => {
      const date = sessionDay(s.lastDoneAt)
      acc[date] ??= { date, value: 0 }
      acc[date].value = Math.min(3, acc[date].value + 1)
      return acc
    }, {})
  )

  const storedXp = Number(session.user.totalExp) || 0
  const sessionXp = loggedSessions.length * XP_PER_SESSION

  const data = {
    sessions: {
      total: loggedSessions.length,
      thisWeeky: 3,
      weeklyTarget: 5,
    },
    streak: streak,
    level: levelProgress(Math.max(storedXp, sessionXp)),
    motivation: {
      lead: motivationMessages.lead,
      accent: motivationMessages.accent,
      author: motivationMessages.author,
    },
    heatmap: heatData,
    recentSessions: currentSessions,
    records,
  }

  return NextResponse.json(data, { status: 200 })
}
