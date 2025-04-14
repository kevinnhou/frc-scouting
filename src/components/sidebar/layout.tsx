"use client";

import { usePathname } from "next/navigation";
import type React from "react";

import { AppSidebar } from "./app-sidebar";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "~/ui/sidebar";

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar =
    pathname === "/dashboard" ||
    pathname === "/scout" ||
    pathname.includes("offline");

  if (!showSidebar) {
    return <div className="min-h-svh">{children}</div>;
  }

  return (
    <SidebarProvider>
      <SidebarTrigger />
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
