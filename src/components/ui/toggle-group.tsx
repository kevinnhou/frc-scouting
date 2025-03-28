/* eslint-disable react/no-unstable-context-value */
"use client";

import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

import { toggleVariants } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
});

function ToggleGroup({ ref, children, className, size, variant, ...props }: React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & { ref?: React.RefObject<React.ElementRef<typeof ToggleGroupPrimitive.Root> | null> }) {
  return (
    <ToggleGroupPrimitive.Root
      className={cn("flex items-center justify-center gap-1", className)}
      ref={ref}
      {...props}
    >
      <ToggleGroupContext value={{ size, variant }}>
        {children}
      </ToggleGroupContext>
    </ToggleGroupPrimitive.Root>
  );
}

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

function ToggleGroupItem({ ref, children, className, size, variant, ...props }: React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants> & { ref?: React.RefObject<React.ElementRef<typeof ToggleGroupPrimitive.Item> | null> }) {
  const context = React.use(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      className={cn(
        toggleVariants({
          size: context.size || size,
          variant: context.variant || variant,
        }),
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
