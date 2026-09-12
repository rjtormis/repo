import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { PwaProvider } from "@/components/pwa/provider"
import TanStackQueryWrapper from "@/components/tanstack-query-wrapper"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  // Name still open — "Repo" is a suggestion only
  title: "Workout log",
  description: "Last session under each set. Offline-first. No programs.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Repo",
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
        "bg-background antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body
        className="min-h-dvh bg-background text-foreground"
        suppressHydrationWarning
      >
        <Script src="/pwa-capture.js" strategy="beforeInteractive" />
        <ThemeProvider>
          <PwaProvider>
            <TanStackQueryWrapper>{children}</TanStackQueryWrapper>
          </PwaProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
