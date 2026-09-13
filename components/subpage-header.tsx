"use client"

import Link from "next/link"
import { IconChevronLeft } from "@tabler/icons-react"
import { NavigationMenu } from "@/components/navigation-menu"
import { Button } from "@/components/ui/button"

export function SubpageHeader({
  title,
  children,
  menu = false,
  backHref = "/",
  hideTitle = false,
}: {
  title: string
  children?: React.ReactNode
  menu?: boolean
  backHref?: string
  hideTitle?: boolean
}) {
  return (
    <header className="flex min-h-11 items-center gap-1 pb-3">
      <Button
        variant="quiet"
        size="icon-touch"
        render={<Link href={backHref} />}
        aria-label="Back"
      >
        <IconChevronLeft className="size-5.5 rtl:rotate-180" stroke={1.5} />
      </Button>
      <h1
        className={
          hideTitle
            ? "sr-only"
            : "min-w-0 flex-1 truncate text-base font-medium"
        }
      >
        {title}
      </h1>
      {children}
      {menu ? <NavigationMenu /> : null}
    </header>
  )
}
