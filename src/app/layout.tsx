import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import type { Viewport } from "next";
import { JetBrains_Mono, Poppins } from "next/font/google";

import Header from "@/components/header";
import Providers from "@/components/providers";
import { metadata } from "@/config/metadata";

export { metadata };

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      className={jetbrainsMono.className}
      dir="ltr"
      lang="en"
      suppressHydrationWarning
    >
      <body className={`${poppins.variable}`}>
        <Providers>
          <Header />
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
