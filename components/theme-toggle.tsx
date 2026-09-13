"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { IconMoon, IconSun } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="quiet"
      size="icon-touch"
      aria-label={
        mounted
          ? isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
          : "Toggle theme"
      }
      disabled={!mounted}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={className}
    >
      {mounted && isDark ? (
        <IconSun className="size-5.5" stroke={1.5} />
      ) : (
        <IconMoon className="size-5.5" stroke={1.5} />
      )}
    </Button>
  )
}
