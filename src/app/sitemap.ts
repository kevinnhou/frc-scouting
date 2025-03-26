import type { MetadataRoute } from "next"

import { site } from "@/config/site"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      lastModified: new Date(),
      priority: 1,
      url: site.links.url,
    },
    {
      lastModified: new Date(),
      priority: 0.8,
      url: `${site.links.url}/match`,
    },
  ]
}
