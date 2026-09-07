import { cn } from "@/lib/utils"

/** Screen shell: padded, no horizontal overflow, safe-area aware. */
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
        "mx-auto flex min-h-dvh w-full min-w-0 max-w-lg flex-col overflow-x-hidden px-4",
        "pt-[max(1rem,env(safe-area-inset-top,0px))]",
        "pb-[max(1rem,env(safe-area-inset-bottom,0px))]",
        "ps-[max(1rem,env(safe-area-inset-inline-start,0px))]",
        "pe-[max(1rem,env(safe-area-inset-inline-end,0px))]",
        className
      )}
    >
      {children}
    </div>
  )
}
