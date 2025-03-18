import { type Metadata } from "next";

import { site } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL("https://frc-scouting.vercel.app/"),
  alternates: {
    canonical: "/",
  },
  title: site.name.default,
  description: site.description,
  appleWebApp: {
    capable: true,
    title: site.name.default,
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  applicationName: site.name.default,
  authors: [{ name: site.name.short, url: site.author.links }],
  creator: site.author.name,
  keywords: site.keywords.join(", "),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: site.name.default,
    description: site.description,
    url: "/opengraph-image.png",
    siteName: site.name.default,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en-AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: site.name.default,
    description: site.description,
    images: ["/twitter-image.png"],
  },
  abstract: site.description,
};
