import Link from "next/link"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/privacy", label: "Privacy", id: "privacy" as const },
  { href: "/terms-and-condition", label: "Terms", id: "terms" as const },
]

export function LegalDocument({
  title,
  updated,
  current,
  children,
}: {
  title: string
  updated: string
  current: "privacy" | "terms"
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-background">
      <header
        className={cn(
          "sticky top-0 z-10 border-b border-border bg-background",
          "pt-[max(0.75rem,env(safe-area-inset-top,0px))]",
          "ps-[max(1.25rem,env(safe-area-inset-inline-start,0px))]",
          "pe-[max(1.25rem,env(safe-area-inset-inline-end,0px))]"
        )}
      >
        <div className="flex items-center justify-between py-3">
          <Link
            href="/"
            className="rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Logo markClassName="size-7" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main
        className={cn(
          "flex-1",
          "ps-[max(1.25rem,env(safe-area-inset-inline-start,0px))]",
          "pe-[max(1.25rem,env(safe-area-inset-inline-end,0px))]",
          "pb-[max(2.5rem,env(safe-area-inset-bottom,0px))]"
        )}
      >
        <article className="pt-8 selection:bg-primary/20">
          <h1 className="text-[1.65rem] leading-tight font-semibold text-pretty">
            {title}
          </h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground tabular-nums">
            Updated {updated}
          </p>

          <nav
            aria-label="Legal"
            className="mt-5 flex gap-1 border-b border-border"
          >
            {LINKS.map((link) => {
              const active = link.id === current
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative -mb-px min-h-11 px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "border-b-2 border-foreground font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-8">{children}</div>
        </article>

        <footer className="mt-14 border-t border-border pt-6 text-sm text-muted-foreground">
          <p>
            <Link
              href="/"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
            {" · "}
            {current === "privacy" ? (
              <Link
                href="/terms-and-condition"
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                Terms of Service
              </Link>
            ) : (
              <Link
                href="/privacy"
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                Privacy Policy
              </Link>
            )}
          </p>
        </footer>
      </main>
    </div>
  )
}

export function LegalSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-9 first:mt-0">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <div className="mt-2.5 space-y-3 text-[15px] leading-relaxed text-muted-foreground [&_strong]:font-medium [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  )
}

export function LegalList({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc space-y-1.5 ps-5">{children}</ul>
}

export function LegalMail({ address }: { address: string }) {
  return (
    <a
      href={`mailto:${address}`}
      className="font-mono text-foreground underline-offset-4 hover:underline"
    >
      {address}
    </a>
  )
}
