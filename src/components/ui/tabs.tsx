"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

function TabsList({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
  ref?: React.RefObject<React.ElementRef<typeof TabsPrimitive.List> | null>;
}) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}
TabsList.displayName = TabsPrimitive.List.displayName;

function TabsTrigger({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
  ref?: React.RefObject<React.ElementRef<typeof TabsPrimitive.Trigger> | null>;
}) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

function TabsContent({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & {
  ref?: React.RefObject<React.ElementRef<typeof TabsPrimitive.Content> | null>;
}) {
  return (
    <TabsPrimitive.Content
      className={cn(
        "mt-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
