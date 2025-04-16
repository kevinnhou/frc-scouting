import type { Metadata } from "next";

import { site } from "@/config/site";

export function generateSEOMetadata({
  title,
  description,
  keywords,
  openGraph,
  canonicalUrlRelative,
  extraTags,
}: Metadata & {
  canonicalUrlRelative?: string;
  extraTags?: Record<string, any>;
} = {}): Metadata {
  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/"
      : site.links.url;

  return {
    title: title || site.name.default,
    description: description || site.description,
    keywords: keywords || [site.keywords.join(", ")],
    applicationName: site.name.default,
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: (openGraph?.title || site.name.default) as string,
      description: openGraph?.description || site.description,
      url: (openGraph?.url || baseUrl) as string,
      siteName: (openGraph?.title || site.name.short) as string,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      title: openGraph?.title || site.name.default,
      description: openGraph?.description || site.description,
      card: "summary_large_image",
      creator: "@kevinnhou",
    },
    ...(canonicalUrlRelative && {
      alternates: { canonical: canonicalUrlRelative },
    }),
    ...extraTags,
  };
}

export function generateStructuredData() {
  return {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: site.name.default,
      description: site.description,
      applicationCategory: "SportsApplication",
      operatingSystem: "iOS, Android",
      author: {
        "@type": "Person",
        name: site.author,
      },
      datePublished: "2025-01-01",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.7",
        ratingCount: "42",
        bestRating: "5",
        worstRating: "3",
      },
      requiresSubscription: false,
      installUrl: site.links.url,
    }),
  };
}
