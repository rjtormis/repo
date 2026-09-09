"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  IconBarbell,
  IconChartBar,
  IconHistory,
  IconLogout,
  IconMenu2,
  IconSettings,
  IconUserCircle,
} from "@tabler/icons-react"

import { Logo } from "@/components/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

const rowClassName =
  "flex min-h-12 w-full items-center gap-3.5 rounded-lg px-3 text-start text-[15px] transition-colors hover:bg-muted active:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

const NAV_ITEMS = [
  { href: "/exercises", label: "Exercises", icon: IconBarbell },
  { href: "/sessions", label: "Sessions", icon: IconHistory },
  { href: "/leaderboard", label: "Leaderboard", icon: IconChartBar },
] as const

function pathIsActive(pathname: string, href: string) {
  if (href === "/sessions") {
    return pathname === "/sessions" || pathname.startsWith("/session/")
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

function initialsFrom(name: string, email: string) {
  const source = name.trim() || email.trim()
  const parts = source.split(/[\s@._-]+/).filter(Boolean)
  const letters = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`
  return (letters || "?").toUpperCase()
}

function AccountFooter({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [signingOut, setSigningOut] = useState(false)

  async function signOut() {
    if (signingOut) return
    setSigningOut(true)
    await authClient.signOut()
    onClose()
    router.push("/login")
  }

  if (isPending) {
    return (
      <div
        className="flex min-h-16 items-center gap-3.5 px-3"
        aria-hidden
      >
        <div className="size-10 shrink-0 rounded-full bg-muted" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="h-3.5 w-24 rounded-sm bg-muted" />
          <div className="h-2.5 w-32 rounded-sm bg-muted" />
        </div>
      </div>
    )
  }

  const user = session?.user
  if (!user) {
    return (
      <Link
        href="/login"
        className="flex min-h-16 w-full items-center gap-3.5 rounded-lg px-3 text-start transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:bg-muted/80"
        onClick={onClose}
      >
        <IconUserCircle
          className="size-5 shrink-0 text-muted-foreground"
          stroke={1.5}
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px]">Sign in to sync</span>
          <span className="block truncate text-xs text-muted-foreground">
            back up your history
          </span>
        </span>
      </Link>
    )
  }

  const name = user.name?.trim() || user.email.split("@")[0]

  return (
    <div className="flex min-h-16 w-full items-center gap-3 rounded-lg px-3">
      <Avatar size="lg" className="size-10">
        {user.image ? (
          <AvatarImage src={user.image} alt={name} />
        ) : null}
        <AvatarFallback aria-hidden>
          {initialsFrom(name, user.email)}
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0 flex-1 text-start">
        <span className="block truncate text-[15px]">{name}</span>
        <span className="block truncate font-mono text-xs text-muted-foreground">
          {user.email}
        </span>
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 shrink-0 text-muted-foreground"
        disabled={signingOut}
        aria-label="Log out"
        onClick={signOut}
      >
        <IconLogout className="size-5" stroke={1.5} aria-hidden />
      </Button>
    </div>
  )
}

export function NavigationMenu() {
  const pathname = usePathname()
  const previousPathname = useRef(pathname)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (previousPathname.current === pathname) return
    previousPathname.current = pathname
    const frame = requestAnimationFrame(() => setOpen(false))
    return () => cancelAnimationFrame(frame)
  }, [pathname])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            type="button"
            aria-label="Open menu"
            className="inline-flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:bg-muted/80"
          />
        }
      >
        <IconMenu2 className="size-5.5" stroke={1.5} />
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        className="gap-0 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
      >
        <SheetTitle className="sr-only">Navigation</SheetTitle>

        <div className="px-3 pt-4 pb-1">
          <Link
            href="/"
            className="inline-flex rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            onClick={() => setOpen(false)}
          >
            <Logo markClassName="size-9" />
          </Link>
        </div>

        <nav aria-label="Main navigation" className="p-3 pt-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = pathIsActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(rowClassName, active && "bg-muted")}
                onClick={() => setOpen(false)}
              >
                <Icon
                  className="size-5 shrink-0 text-muted-foreground"
                  stroke={1.5}
                  aria-hidden
                />
                <span>{item.label}</span>
              </Link>
            )
          })}

          <div className="my-2 border-t border-border" aria-hidden />

          <Link
            href="/settings"
            aria-current={pathIsActive(pathname, "/settings") ? "page" : undefined}
            className={cn(
              rowClassName,
              pathIsActive(pathname, "/settings") && "bg-muted"
            )}
            onClick={() => setOpen(false)}
          >
            <IconSettings
              className="size-5 shrink-0 text-muted-foreground"
              stroke={1.5}
              aria-hidden
            />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="mt-auto border-t border-border px-3 py-2">
          <AccountFooter onClose={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
