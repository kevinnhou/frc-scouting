"use client";

import { type ReactNode } from "react";
import { JetBrains_Mono } from "next/font/google";

import { useTheme, ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

function ToasterProvider() {
  const { theme } = useTheme() as {
    theme: "light" | "dark" | "system";
  };
  return (
    <Toaster
      theme={theme}
      richColors
      position="bottom-center"
      className={jetbrainsMono.className}
    />
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      // enableSystem
      disableTransitionOnChange
      defaultTheme="light"
    >
      <ToasterProvider />
      {children}
    </ThemeProvider>
  );
}
