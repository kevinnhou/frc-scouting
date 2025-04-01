"use client";

import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import * as React from "react";

import { cn } from "@/lib/utils";

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

function HoverCardContent({
  ref,
  align = "center",
  className,
  sideOffset = 4,
  ...props
}: React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content> & {
  ref?: React.RefObject<React.ElementRef<
    typeof HoverCardPrimitive.Content
  > | null>;
}) {
  return (
    <HoverCardPrimitive.Content
      align={align}
      className={cn(
        "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        className,
      )}
      ref={ref}
      sideOffset={sideOffset}
      {...props}
    />
  );
}
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardContent, HoverCardTrigger };
