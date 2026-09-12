"use client"

import { cn } from "@/lib/utils"

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  "aria-label": ariaLabel,
  className,
  disabled,
}: {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
  "aria-label": string
  className?: string
  disabled?: boolean
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex min-h-11 w-full rounded-md border border-border bg-surface-1 p-0.5 dark:bg-background",
        className
      )}
    >
      {options.map((option) => {
        const selected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-10 min-w-0 flex-1 rounded-[calc(var(--radius)-2px)] px-2 text-sm transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "bg-surface-2 text-foreground ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground",
              disabled && "opacity-50"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
