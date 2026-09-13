import { ImageResponse } from "next/og"
import { SITE } from "@/lib/meta-data"

const SIZE = { width: 1200, height: 630 } as const

const PATTERN = [
  [0, 1, 0, 1, 0, 0, 1],
  [0, 0, 2, 1, 0, 1, 0],
  [1, 2, 1, 0, 2, 1, 0],
  [0, 2, 3, 2, 1, 0, 2],
  [1, 3, 2, 3, 2, 1, 2],
] as const

const FILL = ["#383838", "#14874E", "#63D18F", "#AEE8C1"] as const

export function ogImageResponse() {
  return new ImageResponse(<OgCard />, SIZE)
}

function OgCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#0A0A0A",
        padding: 48,
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#141414",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 32,
          padding: "56px 64px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {PATTERN.map((week, c) => (
              <div
                key={c}
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                {week.map((level, r) => (
                  <div
                    key={r}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: FILL[level],
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div
            style={{
              color: "white",
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: -1,
            }}
          >
            {SITE.name}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              color: "white",
              fontSize: 72,
              fontWeight: 600,
              letterSpacing: -2,
              lineHeight: 1.05,
            }}
          >
            {SITE.tagline}
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 28,
              lineHeight: 1.35,
              maxWidth: 860,
            }}
          >
            {SITE.description}
          </div>
        </div>

        <div
          style={{
            color: "#8A8A8A",
            fontSize: 24,
            letterSpacing: 0.5,
          }}
        >
          repo.fit
        </div>
      </div>
    </div>
  )
}
