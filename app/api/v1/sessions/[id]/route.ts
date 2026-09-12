import { getSpecificSession } from "@/actions/sessions"
import { NotFound, Unauthorized } from "@/lib/api/errors"
import { withErrorHandler } from "@/lib/api/handler"
import { getServerSession } from "@/lib/session"
import { NextRequest, NextResponse } from "next/server"

export const GET = withErrorHandler(
  async (
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const session = await getServerSession()
    if (!session) throw Unauthorized()

    const { id } = await params
    const workOutSession = await getSpecificSession({
      userId: session.user.id,
      sessionId: id,
    })
    if (!workOutSession) throw NotFound("Workout not found")

    return NextResponse.json(workOutSession)
  }
)
