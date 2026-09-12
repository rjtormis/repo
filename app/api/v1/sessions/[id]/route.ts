import { NextRequest, NextResponse } from "next/server"
import { getSpecificSession } from "@/actions/sessions"
import { getServerSession } from "@/lib/session"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession()

  if (!session) {
    return NextResponse.json(
      {
        message: "Please sign in to create workout",
      },
      { status: 400 }
    )
  }
  const { id } = await params

  const workOutSession = await getSpecificSession({
    userId: session.user.id,
    sessionId: id,
  })

  if (!workOutSession) {
    return NextResponse.json({ message: "Workout not found" }, { status: 404 })
  }

  return NextResponse.json(workOutSession)
}
