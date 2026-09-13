import type { MetadataRoute } from "next"
import { SITE } from "@/lib/meta-data"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/session/", "/settings", "/api/"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  }
}
