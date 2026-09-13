import { getSessions, getSpecificSession } from "@/actions/sessions"
import { getUserStreak } from "@/actions/streak"
import {
  availableShareVariants,
  buildShareCardData,
  parseShareVariant,
  shareHandle,
} from "@/components/session/share/build-share-card"
import { BadRequest, NotFound, Unauthorized } from "@/lib/api/errors"
import { withErrorHandler } from "@/lib/api/handler"
import { getServerSession } from "@/lib/session"
import { parseWeekStart, parseWeightUnit } from "@/lib/units"
import type { HeatmapDatum } from "@/types/dashboard.types"
import type { WorkoutSessionDetail } from "@/types/session.types"
import { NextRequest, NextResponse } from "next/server"

export const GET = withErrorHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const authSession = await getServerSession()
    if (!authSession) throw Unauthorized()

    const variant = parseShareVariant(
      request.nextUrl.searchParams.get("variant")
    )
    if (!variant) throw BadRequest("Unknown share variant")

    const { id } = await params
    const workout = await getSpecificSession({
      userId: authSession.user.id,
      sessionId: id,
    })
    if (!workout) throw NotFound("Workout not found")
    const session = JSON.parse(
      JSON.stringify(workout)
    ) as WorkoutSessionDetail

    const unit = parseWeightUnit(authSession.user.weightUnit)
    const today = new Date().toLocaleDateString("en-CA")
    const [sessions, streak] = await Promise.all([
      getSessions({ userId: authSession.user.id, position: "desc" }),
      getUserStreak({
        userId: authSession.user.id,
        date: today,
        weekStartsOn: parseWeekStart(authSession.user.weekStartsOn),
      }),
    ])

    const heatmap = Object.values(
      sessions
        .filter((row) => row.setCount > 0)
        .reduce<Record<string, HeatmapDatum>>((acc, row) => {
          const date = new Date(row.lastDoneAt ?? Date.now()).toLocaleDateString(
            "en-CA"
          )
          acc[date] ??= { date, value: 0 }
          acc[date].value = Math.min(3, acc[date].value + 1)
          return acc
        }, {})
    )

    const data = buildShareCardData(session, unit, {
      handle: shareHandle(authSession.user.name, authSession.user.email),
      heatmap,
      streakCount: streak.count,
      streakUnit: streak.unit,
    })

    if (variant === "pr" && !data.record) {
      throw NotFound("No record in this session")
    }

    return NextResponse.json({
      variant,
      available: availableShareVariants(data),
      data,
    })
  }
)
