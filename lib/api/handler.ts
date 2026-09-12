import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { ApiError } from "./errors"

export function withErrorHandler<Args extends unknown[]>(
  fn: (...args: Args) => Promise<NextResponse>
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await fn(...args)
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json(
          { success: false, message: err.message, code: err.code, data: null },
          { status: err.status }
        )
      }

      if (err instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            data: null,
            issues: err.flatten().fieldErrors,
          },
          { status: 400 }
        )
      }

      console.error(err)
      return NextResponse.json(
        { success: false, message: "Something went wrong", data: null },
        { status: 500 }
      )
    }
  }
}
