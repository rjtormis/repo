"use client"

export function MotivationLine({
  lead,
  accent,
  author,
}: {
  lead?: string
  accent?: string
  author?: string | null
}) {
  if (!lead) {
    return (
      <h2 className="text-[clamp(1.2rem,5vw,1.65rem)] leading-snug font-semibold text-pretty">
        {"\u00a0"}
      </h2>
    )
  }

  const credit = author?.trim() ? `— ${author.trim()}` : null

  return (
    <h2 className="min-w-0 text-[clamp(1.2rem,5vw,1.65rem)] leading-snug font-semibold text-pretty">
      <span>
        {lead} <span className="text-success">{accent}</span>
      </span>
      {credit ? (
        <cite className="mt-1.5 block text-sm font-normal italic text-muted-foreground">
          {credit}
        </cite>
      ) : null}
    </h2>
  )
}
