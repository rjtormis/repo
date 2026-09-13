import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { Geist_Mono, Inter } from "next/font/google"
import { SITE } from "@/lib/meta-data"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { PwaProvider } from "@/components/pwa/provider"
import TanStackQueryWrapper from "@/components/tanstack-query-wrapper"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
  adjustFontFallback: false,
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-geist-mono",
  display: "swap",
  adjustFontFallback: false,
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  manifest: "/manifest.webmanifest",
  keywords: [
    "gym tracker",
    "workout log",
    "lifting log",
    "progressive overload",
    "strength training",
  ],
  authors: [{ name: SITE.name, url: SITE.url }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    url: SITE.url,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: SITE.name,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#212121" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
}
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        inter.variable,
        fontMono.variable,
        inter.className,
        "bg-background font-sans antialiased"
      )}
    >
      <body
        className="min-h-dvh bg-background text-foreground"
        suppressHydrationWarning
      >
        <Script src="/pwa-capture.js" strategy="beforeInteractive" />
        <Analytics />
        <ThemeProvider>
          <PwaProvider>
            <TanStackQueryWrapper>{children}</TanStackQueryWrapper>
          </PwaProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
