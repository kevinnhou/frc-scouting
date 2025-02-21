"use client";

import { type ReactNode } from "react";

import { useTheme, ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

function ToasterProvider() {
  const { theme } = useTheme() as {
    theme: "light" | "dark" | "system";
  };
  return <Toaster theme={theme} richColors position="bottom-center" />;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      enableSystem
      disableTransitionOnChange
      defaultTheme="light"
    >
      <ToasterProvider />
      {children}
    </ThemeProvider>
  );
}
