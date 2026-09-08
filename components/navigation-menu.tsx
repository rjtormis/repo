"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconBarbell,
  IconMenu2,
  IconSettings,
  IconUserCircle,
} from "@tabler/icons-react"

import { Logo } from "@/components/logo"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const rowClassName =
  "flex min-h-12 w-full items-center gap-3.5 rounded-lg px-3 text-start text-[15px] transition-colors hover:bg-muted active:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

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
          <Link
            href="/exercises"
            className={rowClassName}
            onClick={() => setOpen(false)}
          >
            <IconBarbell
              className="size-5 shrink-0 text-muted-foreground"
              stroke={1.5}
              aria-hidden
            />
            <span>Exercises</span>
          </Link>

          <div className="my-2 border-t border-border" aria-hidden />

          <Link
            href="/login"
            className={rowClassName}
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
          <Link
            href="/login"
            className="flex min-h-16 w-full items-center gap-3.5 rounded-lg px-3 text-start transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:bg-muted/80"
            onClick={() => setOpen(false)}
          >
            <IconUserCircle
              className="size-5 shrink-0 text-muted-foreground"
              stroke={1.5}
              aria-hidden
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px]">
                Sign in to sync
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                back up your history
              </span>
            </span>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}
