import { getExerciseDetail } from "@/actions/exercises"
import { NotFound, Unauthorized } from "@/lib/api/errors"
import { withErrorHandler } from "@/lib/api/handler"
import { getServerSession } from "@/lib/session"
import { NextResponse } from "next/server"

export const GET = withErrorHandler(
  async (
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const session = await getServerSession()
    if (!session) throw Unauthorized()

    const { id } = await params
    const detail = await getExerciseDetail(id)
    if (!detail) throw NotFound("Exercise not found")

    return NextResponse.json(detail)
  }
)
