import { getSessions } from "@/actions/sessions"
import { Unauthorized } from "@/lib/api/errors"
import { withErrorHandler } from "@/lib/api/handler"
import { getServerSession } from "@/lib/session"
import { NextResponse } from "next/server"

export const GET = withErrorHandler(async () => {
  const session = await getServerSession()
  if (!session) throw Unauthorized()

  const sessions = await getSessions({
    userId: session.user.id,
    position: "asc",
  })

  return NextResponse.json(sessions)
})
