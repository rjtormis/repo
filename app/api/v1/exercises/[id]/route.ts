import { getExerciseDetail } from "@/actions/exercises"
import { getServerSession } from "@/lib/session"
import { NextResponse } from "next/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ message: "Please sign in." }, { status: 401 })
  }

  const { id } = await params
  const detail = await getExerciseDetail(id)
  if (!detail) {
    return NextResponse.json({ message: "Exercise not found." }, { status: 404 })
  }

  return NextResponse.json(detail)
}
