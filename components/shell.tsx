import { cn } from "@/lib/utils"

export function Shell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4",
        "pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]",
        "ps-[max(1rem,env(safe-area-inset-inline-start))] pe-[max(1rem,env(safe-area-inset-inline-end))]",
        className
      )}
    >
      {children}
    </div>
  )
}
