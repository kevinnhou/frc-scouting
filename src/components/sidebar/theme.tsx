"use client";

import { CheckIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { useThemeConfig } from "@/components/providers/active-theme";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { baseColours } from "@/lib/colours";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const { activeTheme, setActiveTheme } = useThemeConfig();
  const { setTheme, resolvedTheme: theme } = useTheme();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className="px-2 py-2">
      <div className="flex flex-col gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "flex w-full items-center gap-2",
                isCollapsed ? "justify-center px-2" : "justify-start px-3",
              )}
            >
              <span
                className="size-3 rounded-full"
                style={{
                  backgroundColor:
                    baseColours.find((c) => c.name === activeTheme)
                      ?.activeColour[theme === "dark" ? "dark" : "light"] || "",
                }}
              />
              {!isCollapsed && (
                <span className="truncate">
                  {baseColours.find((c) => c.name === activeTheme)?.label}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top">
            {baseColours.map((colour) => (
              <DropdownMenuItem
                key={colour.name}
                onClick={() => setActiveTheme(colour.name)}
                className="flex items-center gap-2"
              >
                <span
                  className="size-4 rounded-full"
                  style={{
                    backgroundColor:
                      colour.activeColour[theme === "dark" ? "dark" : "light"],
                  }}
                />
                <span>{colour.label}</span>
                {activeTheme === colour.name && (
                  <CheckIcon className="ml-auto size-4" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={cn(
            "flex w-full items-center gap-2",
            isCollapsed ? "justify-center px-2" : "justify-start px-3",
          )}
        >
          {theme === "dark" ? (
            <>
              <MoonIcon className="size-4" />
              {!isCollapsed && <span>Dark</span>}
            </>
          ) : (
            <>
              <SunIcon className="size-4" />
              {!isCollapsed && <span>Light</span>}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
