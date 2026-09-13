import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

const publicPaths = [
  "/",
  "/login",
  "/sign-up",
  "/privacy",
  "/terms-and-condition",
  "/manifest.webmanifest",
  "/sw.js",
  "/icon.png",
  "/apple-icon.png",
  "/apple-touch-icon.png",
  "/sitemap.xml",
  "/robots.txt",
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = getSessionCookie(request)
  const isPublic = publicPaths.some((path) =>
    path === "/"
      ? pathname === "/"
      : pathname === path || pathname.startsWith(`${path}/`)
  )

  if (!sessionCookie && !isPublic) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest\\.webmanifest|sw\\.js|sitemap\\.xml|robots\\.txt|icons/|.*\\..*).*)",
  ],
}
