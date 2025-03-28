"use client";

import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as React from "react";

import { cn } from "@/lib/utils";

function Separator({ ref, className, decorative = true, orientation = "horizontal", ...props }: React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & { ref?: React.RefObject<React.ElementRef<typeof SeparatorPrimitive.Root> | null> }) {
  return (
    <SeparatorPrimitive.Root
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className,
      )}
      decorative={decorative}
      orientation={orientation}
      ref={ref}
      {...props}
    />
  );
}
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
