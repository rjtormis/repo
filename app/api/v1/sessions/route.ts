import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getSpecificUserSession } from "@/actions/sessions"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
  const { id } = await params

  const workOutSession = await getSpecificUserSession({
    userId: session.user.id,
    sessionId: id,
  })
  console.log(workOutSession)

  return NextResponse.json(workOutSession, { status: 200 })
}
