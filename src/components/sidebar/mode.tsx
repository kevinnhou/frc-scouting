/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */

"use client";

import { BarChart3, ClipboardEdit } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { SidebarGroup, SidebarGroupContent, useSidebar } from "~/ui/sidebar";

export function ModeSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useSidebar();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isCollapsed = isClient ? state === "collapsed" : false;
  const isOffline = isClient ? pathname?.includes("offline") : false;

  const modes = [
    {
      name: "Data Entry",
      description: "Input and manage data",
      icon: ClipboardEdit,
      route: isOffline ? "/scout/~offline" : "/scout",
    },
    {
      name: "Data Analysis",
      description: "View dashboards and analytics",
      icon: BarChart3,
      route: isOffline ? "/dashboard/~offline" : "/dashboard",
    },
  ];

  function handleModeChange(route: string) {
    router.push(route);
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <div className="flex flex-col gap-2 px-1">
          {modes.map((mode) => {
            const isActive = isClient
              ? pathname?.startsWith(mode.route)
              : false;

            return (
              <button
                key={mode.name}
                onClick={() => handleModeChange(mode.route)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive &&
                    "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
                  isCollapsed && "justify-center px-2",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-sidebar-border",
                  )}
                >
                  <mode.icon className="h-4 w-4" />
                </div>

                {!isCollapsed && (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{mode.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {mode.description}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
