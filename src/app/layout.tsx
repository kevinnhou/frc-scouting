import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { JetBrains_Mono, Poppins } from "next/font/google";

import Providers from "@/components/providers";
import Header from "@/components/header";

import { metadata } from "@/config/metadata";

export { metadata };

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={jetbrainsMono.className}
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
