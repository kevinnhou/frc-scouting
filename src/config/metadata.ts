import type { Metadata } from "next"

import { site } from "@/config/site"

export const metadata: Metadata = {
  abstract: site.description,
  alternates: {
    canonical: "/",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: site.name.default,
  },
  applicationName: site.name.default,
  authors: [{ name: site.name.short, url: site.author.links }],
  creator: site.author.name,
  description: site.description,
  formatDetection: {
    telephone: false,
  },
  keywords: site.keywords.join(", "),
  manifest: "/manifest.webmanifest",
  metadataBase: new URL("https://frc-scouting.vercel.app/"),
  openGraph: {
    description: site.description,
    images: [
      {
        height: 630,
        url: "/opengraph-image.png",
        width: 1200,
      },
    ],
    locale: "en-AU",
    siteName: site.name.default,
    title: site.name.default,
    type: "website",
    url: "/opengraph-image.png",
  },
  robots: {
    follow: true,
    googleBot: {
      "follow": true,
      "index": true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    index: true,
  },
  title: site.name.default,
  twitter: {
    card: "summary_large_image",
    description: site.description,
    images: ["/twitter-image.png"],
    title: site.name.default,
  },
}
