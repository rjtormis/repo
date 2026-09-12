import { getAllExercises } from "@/actions/exercises"
import { Unauthorized } from "@/lib/api/errors"
import { withErrorHandler } from "@/lib/api/handler"
import { getServerSession } from "@/lib/session"
import { NextRequest, NextResponse } from "next/server"

export const GET = withErrorHandler(async (request: NextRequest) => {
  const session = await getServerSession()
  if (!session) throw Unauthorized()

  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")
  const cursor = searchParams.get("cursor")
  const muscleGroup = searchParams.get("muscleGroup")
  const commonOnly = searchParams.get("commonOnly") !== "0"

  const exercises = await getAllExercises({
    query: query ?? undefined,
    cursor: cursor ?? undefined,
    muscleGroup,
    commonOnly,
  })

  return NextResponse.json(exercises, { status: 200 })
})
