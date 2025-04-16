import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import type { Viewport } from "next";
import { JetBrains_Mono, Poppins } from "next/font/google";
import { cookies } from "next/headers";
import Script from "next/script";

import { generateSEOMetadata, generateStructuredData } from "@/config/metadata";
import { cn } from "@/lib/utils";
import { Providers } from "~/providers/providers";

export const metadata = generateSEOMetadata();

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

const jetbrainsMono = JetBrains_Mono({
  display: "swap",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

const poppins = Poppins({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const activeTheme = cookieStore.get("active_theme")?.value;
  return (
    <html
      className={jetbrainsMono.className}
      dir="ltr"
      lang="en"
      suppressHydrationWarning
    >
      <body
        className={cn(
          poppins.variable,
          "antialiased",
          activeTheme ? `theme-${activeTheme}` : "",
        )}
      >
        <Providers>
          <Script
            type="application/ld+json"
            // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
            dangerouslySetInnerHTML={generateStructuredData()}
          />
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
