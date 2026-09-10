"use client"

import { useLayoutEffect, useRef, useState } from "react"

export function MotivationLine({
  lead,
  accent,
  author,
}: {
  lead?: string
  accent?: string
  author?: string | null
}) {
  const quoteRef = useRef<HTMLSpanElement>(null)
  const [wrapped, setWrapped] = useState(false)

  useLayoutEffect(() => {
    const el = quoteRef.current
    if (!el) return

    const measure = () => {
      const tops = new Set(
        [...el.getClientRects()].map((rect) => Math.round(rect.top))
      )
      setWrapped(tops.size > 1)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    const parent = el.parentElement
    if (parent) ro.observe(parent)
    return () => ro.disconnect()
  }, [lead, accent])

  if (!lead) {
    return (
      <h2 className="text-[1.65rem] leading-[1.15] font-semibold tracking-tight">
        {"\u00a0"}
      </h2>
    )
  }

  const credit = author?.trim() ? `- ${author.trim()}` : null

  return (
    <h2 className="text-[1.65rem] leading-[1.15] font-semibold tracking-tight">
      <span ref={quoteRef}>
        {lead}{" "}
        <span className="text-success">{accent}</span>
      </span>
      {credit ? (
        wrapped ? (
          <cite className="ms-1.5 inline-block align-baseline text-sm font-normal whitespace-nowrap italic text-muted-foreground">
            {credit}
          </cite>
        ) : (
          <cite className="mt-1 block text-sm font-normal italic text-muted-foreground">
            {credit}
          </cite>
        )
      ) : null}
    </h2>
  )
}
