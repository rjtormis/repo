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
  if (!lead) return null

  const quote = `${lead} ${accent ?? ""}`.trim()
  const compact = quote.length > 50
  const credit = author?.trim() ? `— ${author.trim()}` : null

  return (
    <h2
      className={
        compact
          ? "min-w-0 text-base leading-snug font-semibold text-pretty"
          : "min-w-0 text-lg leading-snug font-semibold text-pretty"
      }
    >
      <span>
        {lead}
        {accent ? (
          <>
            {" "}
            <span className="text-success">{accent}</span>
          </>
        ) : null}
      </span>
      {credit ? (
        <cite className="mt-1 block text-xs font-normal italic text-muted-foreground">
          {credit}
        </cite>
      ) : null}
    </h2>
  )
}
