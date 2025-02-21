import "./globals.css";

import { Poppins } from "next/font/google";

import Providers from "@/components/providers";
import Header from "@/components/header";

import { metadata } from "@/config/metadata";

export { metadata };

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
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={poppins.className}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
