import withSerwistInit from "@serwist/next"
import type { NextConfig } from "next"

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: false,
})

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["*.ngrok-free.app"], // PWA request are only allowed from these list of domains
  async redirects() {
    return [
      {
        source: "/dashboard/exercises",
        destination: "/exercises",
        permanent: true,
      },
      {
        source: "/dashboard/exercises/:id",
        destination: "/exercises/:id",
        permanent: true,
      },
      {
        source: "/dashboard/sessions",
        destination: "/sessions",
        permanent: true,
      },
      {
        source: "/dashboard/session/:id",
        destination: "/session/:id",
        permanent: true,
      },
      {
        source: "/dashboard/leaderboard",
        destination: "/leaderboard",
        permanent: true,
      },
      {
        source: "/dashboard/settings",
        destination: "/settings",
        permanent: true,
      },
      {
        source: "/terms-and-condition",
        destination: "/terms",
        permanent: true,
      },
    ]
  },
}

export default withSerwist(nextConfig)
