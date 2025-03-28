"use client";


import * as LabelPrimitive from "@radix-ui/react-label";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

function Label({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants> & { ref?: React.RefObject<React.ElementRef<typeof LabelPrimitive.Root> | null> }) {
  return (
    <LabelPrimitive.Root
      className={cn(labelVariants(), className)}
      ref={ref}
      {...props}
    />
  );
}
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
