"use client"

import { useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconBrandGoogle, IconLoader2, IconMail } from "@tabler/icons-react"
import { Controller, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { authClient } from "@/lib/auth-client"
import { signUpSchema, type SignUpValues } from "@/schema/auth-schema"
import { cn } from "@/lib/utils"
import { toast } from "../ui/toast"

type Phase = "idle" | "submitting" | "sent"

const RESEND_WAIT_SECONDS = 60

export function SignUpScreen() {
  const emailId = useId()
  const passwordId = useId()
  const confirmHeadingRef = useRef<HTMLHeadingElement>(null)

  const [phase, setPhase] = useState<Phase>("idle")
  const [sentTo, setSentTo] = useState("")
  const [resendIn, setResendIn] = useState(0)
  const [resending, setResending] = useState(false)

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const submitting = phase === "submitting"

  useEffect(() => {
    if (phase === "sent") {
      confirmHeadingRef.current?.focus()
    }
  }, [phase])

  useEffect(() => {
    if (resendIn <= 0) return
    const timeout = window.setTimeout(() => {
      setResendIn((seconds) => seconds - 1)
    }, 1000)
    return () => window.clearTimeout(timeout)
  }, [resendIn])

  async function onSubmit(values: SignUpValues) {
    setPhase("submitting")
    const { error } = await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.email.split("@")[0] ?? values.email,
    })

    if (error) {
      setPhase("idle")
      form.setError("email", {
        type: "server",
        message: "Couldn’t create an account. Try again.",
      })
      return
    }

    setSentTo(values.email)
    setResendIn(RESEND_WAIT_SECONDS)
    setPhase("sent")
  }

  async function resendVerification() {
    if (!sentTo || resending || resendIn > 0) return

    setResending(true)
    const { error } = await authClient.sendVerificationEmail({
      email: sentTo,
      callbackURL: "/",
    })
    setResending(false)

    if (error) return

    setResendIn(RESEND_WAIT_SECONDS)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col overflow-y-auto overscroll-y-contain">
      <div
        className={cn(
          "flex min-h-dvh w-full flex-1 flex-col",
          "px-4",
          "ps-[max(1rem,env(safe-area-inset-inline-start,0px))]",
          "pe-[max(1rem,env(safe-area-inset-inline-end,0px))]",
          "pt-[max(1.5rem,env(safe-area-inset-top,0px))]",
          "pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]"
        )}
      >
        <div className="flex items-center justify-end pt-1">
          <ThemeToggle />
        </div>

        <div className="flex flex-1 flex-col justify-center py-8">
          <div className="mb-8 flex justify-center">
            <Logo markClassName="size-8" />
          </div>

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
              <p className="my-4 text-sm text-muted-foreground">
                We sent a verification link to{" "}
                <span className="font-mono text-foreground">{sentTo}</span>.
                Confirm it, then sign in.
              </p>

              <Button
                type="button"
                size="lg"
                disabled={resending || resendIn > 0}
                className="h-12 min-h-11 w-full text-base tabular-nums"
                onClick={resendVerification}
                aria-live="polite"
              >
                {resending ? (
                  <>
                    <IconLoader2
                      className="size-4.5 animate-spin"
                      data-icon="inline-start"
                      aria-hidden
                    />
                    Sending…
                  </>
                ) : resendIn > 0 ? (
                  `Resend in ${resendIn}s`
                ) : (
                  "Resend verification"
                )}
              </Button>
              <Link
                href="/login"
                className="mt-3 inline-flex min-h-11 items-center px-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Go to Sign In
              </Link>
            </div>
          ) : (
            <>
              <header className="mb-8 text-center">
                <h1 className="text-2xl font-medium tracking-tight">
                  Create your account
                </h1>
                <p className="mt-3 text-sm text-balance text-muted-foreground">
                  Track every lift. Watch the squares fill up.
                </p>
              </header>

              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
                noValidate
              >
                <FieldGroup>
                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        data-disabled={submitting || undefined}
                        className="gap-4 overflow-visible"
                      >
                        <FieldLabel htmlFor={emailId}>Email</FieldLabel>
                        <div className="w-full overflow-visible py-1">
                          <Input
                            {...field}
                            id={emailId}
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck={false}
                            disabled={submitting}
                            aria-invalid={fieldState.invalid || undefined}
                            placeholder="you@example.com"
                            className="h-11 min-h-11 bg-background px-3 text-base shadow-none md:text-base"
                          />
                        </div>
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </Field>
                    )}
                  />
                </FieldGroup>

                <FieldGroup>
                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        data-disabled={submitting || undefined}
                        className="gap-4 overflow-visible"
                      >
                        <FieldLabel htmlFor={passwordId}>Password</FieldLabel>
                        <div className="w-full overflow-visible py-1">
                          <Input
                            {...field}
                            id={passwordId}
                            type="password"
                            autoComplete="new-password"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck={false}
                            disabled={submitting}
                            aria-invalid={fieldState.invalid || undefined}
                            placeholder="At least 8 characters"
                            className="h-11 min-h-11 bg-background px-3 text-base shadow-none md:text-base"
                          />
                        </div>
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </Field>
                    )}
                  />
                </FieldGroup>

                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="h-12 min-h-11 w-full text-base"
                >
                  {submitting ? (
                    <>
                      <IconLoader2
                        className="size-4.5 animate-spin"
                        data-icon="inline-start"
                        aria-hidden
                      />
                      Creating…
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary underline-offset-4 hover:text-primary hover:underline"
                >
                  Log in
                </Link>
              </p>

              <div className="my-6 flex items-center gap-3" role="separator">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute end-0 -top-2 z-10 rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-secondary-foreground">
                  soon
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled
                  className="h-12 min-h-11 w-full text-base shadow-none"
                >
                  <IconBrandGoogle
                    className="size-5"
                    data-icon="inline-start"
                    aria-hidden
                  />
                  Continue with Google
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
