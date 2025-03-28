import type { MetadataRoute } from "next";

import { site } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#FFFFFF",
    description: site.description,
    display: "standalone",
    icons: [
      {
        sizes: "any",
        src: "/favicon.ico",
        type: "image/x-icon",
      },
      {
        purpose: "maskable",
        sizes: "192x192",
        src: "/icons/android-chrome-192x192.png",
        type: "image/png",
      },
      {
        sizes: "512x512",
        src: "/icons/icon-512x512.png",
        type: "image/png",
      },
    ],
    name: site.name.default,
    orientation: "portrait",
    short_name: site.name.short,
    start_url: "/",
    theme_color: "#FFFFFF",
  };
}
