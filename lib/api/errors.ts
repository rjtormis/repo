export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export const Unauthorized = (msg = "Sign in to Repo") =>
  new ApiError(msg, 401, "UNAUTHORIZED")

export const Forbidden = (msg = "You don't have access to this") =>
  new ApiError(msg, 403, "FORBIDDEN")

export const NotFound = (msg = "Not found") =>
  new ApiError(msg, 404, "NOT_FOUND")

export const BadRequest = (msg = "Invalid request") =>
  new ApiError(msg, 400, "BAD_REQUEST")

export const Conflict = (msg = "That already exists") =>
  new ApiError(msg, 409, "CONFLICT")
