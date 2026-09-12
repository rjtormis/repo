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
        source: "/exercises",
        destination: "/dashboard/exercises",
        permanent: true,
      },
      {
        source: "/exercises/:id",
        destination: "/dashboard/exercises/:id",
        permanent: true,
      },
      {
        source: "/sessions",
        destination: "/dashboard/sessions",
        permanent: true,
      },
      {
        source: "/session/:id",
        destination: "/dashboard/session/:id",
        permanent: true,
      },
      {
        source: "/leaderboard",
        destination: "/dashboard/leaderboard",
        permanent: true,
      },
      {
        source: "/settings",
        destination: "/dashboard/settings",
        permanent: true,
      },
    ]
  },
}

export default withSerwist(nextConfig)
