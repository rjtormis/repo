"use client"

import { useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import {
  IconBrandApple,
  IconBrandGoogle,
  IconLoader2,
  IconMail,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Phase = "idle" | "submitting" | "sent"

function isValidEmail(value: string): boolean {
  // UI-only gate — not a real auth check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function LoginScreen() {
  const emailId = useId()
  const errorId = useId()
  const confirmHeadingRef = useRef<HTMLHeadingElement>(null)

  const [email, setEmail] = useState("")
  const [phase, setPhase] = useState<Phase>("idle")
  const [error, setError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState("")

  useEffect(() => {
    if (phase === "sent") {
      confirmHeadingRef.current?.focus()
    }
  }, [phase])

  function resetToForm() {
    setPhase("idle")
    setError(null)
    setSentTo("")
  }

  function fakeSend(e: React.FormEvent) {
    e.preventDefault()
    const value = email.trim()
    setError(null)

    if (!value) {
      setError("Enter an email address to get a link.")
      return
    }
    if (!isValidEmail(value)) {
      setError("That doesn’t look like an email address.")
      return
    }

    setPhase("submitting")
    window.setTimeout(() => {
      setSentTo(value)
      setPhase("sent")
    }, 900)
  }

  function fakeOAuth() {
    setError(null)
    setPhase("submitting")
    window.setTimeout(() => {
      // UI only — no provider wired
      setPhase("idle")
    }, 900)
  }

  return (
    <div
      className={cn(
        "mx-auto flex min-h-dvh w-full max-w-sm flex-col",
        "px-4",
        "ps-[max(1rem,env(safe-area-inset-inline-start))]",
        "pe-[max(1rem,env(safe-area-inset-inline-end))]",
        "pt-[max(1.5rem,env(safe-area-inset-top))]",
        "pb-[max(1.5rem,env(safe-area-inset-bottom))]",
        // Keyboard-safe: page scrolls; nothing fixed to the visual viewport
        "overflow-y-auto overscroll-y-contain"
      )}
    >
      <div className="flex flex-1 flex-col justify-center py-8">
        <p className="mb-8 text-center text-sm text-muted-foreground">Repo</p>

        {phase === "sent" ? (
          <div className="flex flex-col items-center text-center">
            <IconMail
              className="mb-4 size-8 text-primary"
              stroke={1.5}
              aria-hidden
            />
            <h1
              ref={confirmHeadingRef}
              tabIndex={-1}
              className="text-2xl font-medium tracking-tight outline-none"
            >
              Check your email
            </h1>
            <p className="mt-3 max-w-[28ch] text-sm text-muted-foreground">
              We sent a sign-in link to{" "}
              <span className="font-mono text-foreground">{sentTo}</span>.
              Your logs on this device are unchanged.
            </p>
            <button
              type="button"
              onClick={resetToForm}
              className="mt-8 inline-flex min-h-11 items-center px-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <header className="mb-8 text-center">
              <h1 className="text-2xl font-medium tracking-tight">
                Sync your training
              </h1>
              <p className="mt-3 text-sm text-muted-foreground text-balance">
                Your logs stay on this device either way. Sign in to back them
                up and use another phone.
              </p>
            </header>

            <form onSubmit={fakeSend} className="space-y-4" noValidate>
              <div className="space-y-2">
                <label
                  htmlFor={emailId}
                  className="block text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <input
                  id={emailId}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={email}
                  disabled={phase === "submitting"}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError(null)
                  }}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                  className={cn(
                    "flex h-11 min-h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none",
                    "placeholder:text-muted-foreground",
                    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    // Neutral error — no destructive/red alarm styling
                    error && "border-foreground/40"
                  )}
                  placeholder="you@example.com"
                />
                {error ? (
                  <p
                    id={errorId}
                    role="alert"
                    className="text-sm text-muted-foreground"
                  >
                    {error}
                  </p>
                ) : null}
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={phase === "submitting"}
                className="h-12 min-h-11 w-full text-base"
              >
                {phase === "submitting" ? (
                  <>
                    <IconLoader2
                      className="size-4 animate-spin"
                      data-icon="inline-start"
                      aria-hidden
                    />
                    Sending…
                  </>
                ) : (
                  "Send magic link"
                )}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3" role="separator">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={phase === "submitting"}
                className="h-12 min-h-11 w-full shadow-none text-base"
                onClick={() => fakeOAuth()}
              >
                <IconBrandGoogle
                  className="size-4"
                  data-icon="inline-start"
                  aria-hidden
                />
                Continue with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={phase === "submitting"}
                className="h-12 min-h-11 w-full shadow-none text-base"
                onClick={() => fakeOAuth()}
              >
                <IconBrandApple
                  className="size-4"
                  data-icon="inline-start"
                  aria-hidden
                />
                Continue with Apple
              </Button>
            </div>
          </>
        )}
      </div>

      {phase !== "sent" ? (
        <div className="pt-4 text-center">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center px-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Keep using Repo without an account
          </Link>
        </div>
      ) : null}
    </div>
  )
}
