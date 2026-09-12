"use client"

import { useEffect, useState } from "react"
import { IconDownload, IconShare2, IconX } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

declare global {
  interface Window {
    __pwaInstallEvent?: InstallPromptEvent
  }
}

const DISMISS_KEY = "repo-pwa-install-v2"

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  )
}

function platform() {
  const ua = navigator.userAgent
  if (/iphone|ipad|ipod/i.test(ua)) return "ios" as const
  if (/android/i.test(ua)) return "android" as const
  return "desktop" as const
}

function takeInstallEvent() {
  return window.__pwaInstallEvent ?? null
}

export function PwaInstallPrompt() {
  const [kind, setKind] = useState<"ios" | "android" | null>(null)
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(
    null
  )

  useEffect(() => {
    if (isStandalone() || sessionStorage.getItem(DISMISS_KEY)) return

    const current = platform()
    if (current === "ios") {
      setKind("ios")
      return
    }
    if (current !== "android") return

    setKind("android")
    setInstallEvent(takeInstallEvent())

    const onPrompt = (event: Event) => {
      event.preventDefault()
      const next = event as InstallPromptEvent
      window.__pwaInstallEvent = next
      setInstallEvent(next)
    }
    const onInstalled = () => {
      sessionStorage.setItem(DISMISS_KEY, "1")
      setInstallEvent(null)
      setKind(null)
    }
    window.addEventListener("beforeinstallprompt", onPrompt)
    window.addEventListener("appinstalled", onInstalled)
    void navigator.serviceWorker?.ready.then(() => {
      setInstallEvent(takeInstallEvent())
    })

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  if (kind === "ios") {
    return (
      <div className="border-b border-border bg-muted px-4 py-3">
        <div className="mx-auto flex w-full max-w-lg items-start gap-3">
          <IconShare2 className="mt-0.5 size-5 shrink-0" stroke={1.5} />
          <p className="min-w-0 flex-1 text-sm">
            Open this link in Safari, tap Share, then Add to Home Screen.
          </p>
          <button
            type="button"
            aria-label="Dismiss"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-background"
            onClick={() => {
              sessionStorage.setItem(DISMISS_KEY, "1")
              setKind(null)
            }}
          >
            <IconX className="size-5" stroke={1.5} />
          </button>
        </div>
      </div>
    )
  }

  if (kind !== "android" || !installEvent) return null

  return (
    <div className="border-b border-border bg-muted px-4 py-3">
      <div className="mx-auto flex w-full max-w-lg items-center gap-3">
        <p className="min-w-0 flex-1 text-sm font-medium">Add Repo to your phone</p>
        <Button
          className="min-h-11 shrink-0"
          onClick={async () => {
            await installEvent.prompt()
            const choice = await installEvent.userChoice
            if (choice.outcome === "accepted") {
              sessionStorage.setItem(DISMISS_KEY, "1")
              setInstallEvent(null)
              setKind(null)
            }
          }}
        >
          <IconDownload className="size-4" stroke={1.5} />
          Install app
        </Button>
      </div>
    </div>
  )
}
