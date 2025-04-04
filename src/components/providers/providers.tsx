import { cookies } from "next/headers";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

import { ActiveThemeProvider } from "./active-theme";
import { ToasterProvider } from "./toast-provider";

export default async function Providers({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const activeTheme = cookieStore.get("active_theme")?.value;

  return (
    <ThemeProvider
      attribute="class"
      disableTransitionOnChange
      defaultTheme="light"
    >
      <ActiveThemeProvider initialTheme={activeTheme}>
        <ToasterProvider />
        {children}
      </ActiveThemeProvider>
    </ThemeProvider>
  );
}
