import type React from "react";

import { SidebarLayout } from "~/sidebar/layout";

export default function ScoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
