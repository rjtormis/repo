import {
  Body,
  Button,
  Container,
  Font,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  pixelBasedPreset,
  Section,
  Tailwind,
  Text,
} from "react-email"

/**
 * Compact contribution heatmap — same 5×7, column-major pattern as the app
 * logomark on a light surface. Table cells so it survives Outlook and Gmail.
 */

const CELL = 6
const GAP = 2
const COLS = 5
const ROWS = 7

/** 0 empty … 3 densest — denser toward recent weeks */
const PATTERN: number[][] = [
  [0, 1, 0, 1, 0, 0, 1],
  [0, 0, 2, 1, 0, 1, 0],
  [1, 2, 1, 0, 2, 1, 0],
  [0, 2, 3, 2, 1, 0, 2],
  [1, 3, 2, 3, 2, 1, 2],
]

/** Light-UI mark — same hex ramp as `LogoMark` */
const FILL_LIGHT = ["#dedede", "#73CCCC", "#39B3B3", "#008080"] as const

/** App `:root` tokens, hex for email clients */
const BACKGROUND = "#ffffff"
const FOREGROUND = "#0a0a0a"
const MUTED = "#737373"
const PRIMARY = "#007a55"
const PRIMARY_FG = "#ecfdf5"

const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
const MONO =
  "'Geist Mono', 'Courier New', Courier, ui-monospace, monospace"

export type AuthEmailVariant = "magic-link" | "verify" | "existing"

export type MagicLinkEmailProps = {
  url: string
  email?: string
  variant?: AuthEmailVariant
}

const COPY = {
  "magic-link": {
    preview: "Sign in to Repo",
    heading: "Sign in",
    button: "Sign in",
    ignore: "If you did not ask for this, you can ignore the email.",
    body: (email?: string) =>
      email ? (
        <>
          Tap below to sign in as{" "}
          <span style={{ fontFamily: MONO, color: FOREGROUND }}>{email}</span>.
          Last time’s weights and reps will be waiting.
        </>
      ) : (
        <>
          Tap below to sign in. Last time’s weights and reps will be waiting.
        </>
      ),
  },
  verify: {
    preview: "Verify your email",
    heading: "Verify your email",
    button: "Verify email",
    ignore: "If you did not create an account, you can ignore the email.",
    body: (email?: string) =>
      email ? (
        <>
          Tap below to confirm{" "}
          <span style={{ fontFamily: MONO, color: FOREGROUND }}>{email}</span>.
          Then you can sign in.
        </>
      ) : (
        <>Tap below to confirm this address. Then you can sign in.</>
      ),
  },
  existing: {
    preview: "You already have an account",
    heading: "You already have an account",
    button: "Sign in",
    ignore: "If you did not try to sign up, you can ignore the email.",
    body: (email?: string) =>
      email ? (
        <>
          This address is already registered. Tap below to sign in as{" "}
          <span style={{ fontFamily: MONO, color: FOREGROUND }}>{email}</span>.
          Last time’s weights and reps will be waiting.
        </>
      ) : (
        <>
          This address is already registered. Tap below to sign in. Last
          time’s weights and reps will be waiting.
        </>
      ),
  },
} as const

function HeatmapMark() {
  return (
    <table
      role="img"
      aria-label="Repo"
      cellPadding={0}
      cellSpacing={0}
      style={{ borderCollapse: "separate", borderSpacing: GAP }}
    >
      <tbody>
        {Array.from({ length: ROWS }, (_, r) => (
          <tr key={r}>
            {Array.from({ length: COLS }, (_, c) => (
              <td
                key={c}
                width={CELL}
                height={CELL}
                style={{
                  width: CELL,
                  height: CELL,
                  backgroundColor: FILL_LIGHT[PATTERN[c][r]],
                  borderRadius: 2,
                  fontSize: 0,
                  lineHeight: 0,
                }}
              >
                &nbsp;
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function MagicLinkEmail({
  url,
  email,
  variant = "magic-link",
}: MagicLinkEmailProps) {
  const copy = COPY[variant]
  return (
    <Html lang="en" dir="auto" style={{ height: "100%" }}>
      <Head>
        <Font
          fontFamily="Geist Mono"
          fallbackFontFamily="monospace"
          webFont={{
            url: "https://cdn.jsdelivr.net/fontsource/fonts/geist-mono@latest/latin-700-normal.woff2",
            format: "woff2",
          }}
          fontWeight={700}
          fontStyle="normal"
        />
        <style>
          {`html, body { height: 100% !important; margin: 0 !important; }
body > table { height: 100% !important; width: 100% !important; }`}
        </style>
      </Head>
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
        }}
      >
        <Body
          style={{
            backgroundColor: BACKGROUND,
            margin: 0,
            padding: 0,
            height: "100%",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          <Preview>{copy.preview}</Preview>
          <table
            width="100%"
            role="presentation"
            cellPadding={0}
            cellSpacing={0}
            style={{ height: "100%", width: "100%" }}
          >
            <tbody>
              <tr>
                <td
                  align="center"
                  valign="middle"
                  style={{ padding: "32px 20px" }}
                >
          <Container
            style={{
              maxWidth: 420,
              margin: "0 auto",
              padding: 0,
            }}
          >
            <Section style={{ textAlign: "center" }}>
              <table
                cellPadding={0}
                cellSpacing={0}
                role="presentation"
                style={{ margin: "0 auto" }}
              >
                <tbody>
                  <tr>
                    <td style={{ verticalAlign: "middle", paddingRight: 10 }}>
                      <HeatmapMark />
                    </td>
                    <td style={{ verticalAlign: "middle" }}>
                      <Text
                        style={{
                          margin: 0,
                          fontFamily: MONO,
                          fontSize: 16,
                          fontWeight: 700,
                          letterSpacing: "-0.02em",
                          lineHeight: "20px",
                          color: FOREGROUND,
                        }}
                      >
                        Repo
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Heading
              as="h1"
              style={{
                margin: "28px 0 0",
                fontFamily: SANS,
                fontSize: 24,
                fontWeight: 500,
                letterSpacing: "-0.03em",
                lineHeight: "30px",
                color: FOREGROUND,
                textAlign: "center",
              }}
            >
              {copy.heading}
            </Heading>

            <Text
              style={{
                margin: "12px 0 0",
                fontFamily: SANS,
                fontSize: 15,
                lineHeight: "22px",
                color: MUTED,
                textAlign: "center",
              }}
            >
              {copy.body(email)}
            </Text>

              <Section style={{ marginTop: 28, textAlign: "center" }}>
                <Button
                  href={url}
                  style={{
                    display: "inline-block",
                    backgroundColor: PRIMARY,
                    color: PRIMARY_FG,
                    fontFamily: SANS,
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: "20px",
                    textDecoration: "none",
                    textAlign: "center",
                    padding: "14px 28px",
                    borderRadius: 6,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  {copy.button}
                </Button>
              </Section>

              <Text
                style={{
                  margin: "20px 0 0",
                  fontFamily: SANS,
                  fontSize: 13,
                  lineHeight: "20px",
                  color: MUTED,
                  textAlign: "center",
                  wordBreak: "break-all",
                }}
              >
                Button not working?{" "}
                <Link href={url} style={{ color: PRIMARY }}>
                  {url}
                </Link>
              </Text>

              <Text
                style={{
                  margin: "16px 0 0",
                  fontFamily: SANS,
                  fontSize: 13,
                  lineHeight: "20px",
                  color: MUTED,
                  textAlign: "center",
                }}
              >
                {copy.ignore}
              </Text>
          </Container>
                </td>
              </tr>
            </tbody>
          </table>
        </Body>
      </Tailwind>
    </Html>
  )
}

MagicLinkEmail.PreviewProps = {
  url: "https://repo.app/auth/magic-link?token=preview",
  email: "you@example.com",
} satisfies MagicLinkEmailProps
