import { getAllExercises } from "@/actions/exercises"
import { getServerSession } from "@/lib/session"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const session = await getServerSession()

  if (!session) {
    return NextResponse.json(
      {
        message: "Please sign in to create workout",
      },
      { status: 400 }
    )
  }
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
}
