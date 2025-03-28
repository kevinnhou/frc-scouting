import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
  },
);

function Alert({ ref, className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants> & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      className={cn(alertVariants({ variant }), className)}
      ref={ref}
      role="alert"
      {...props}
    />
  );
}
Alert.displayName = "Alert";

function AlertTitle({ ref, className, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { ref?: React.RefObject<HTMLParagraphElement | null> }) {
  return (
    <h5
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      ref={ref}
      {...props}
    />
  );
}
AlertTitle.displayName = "AlertTitle";

function AlertDescription({ ref, className, ...props }: React.HTMLAttributes<HTMLParagraphElement> & { ref?: React.RefObject<HTMLParagraphElement | null> }) {
  return (
    <div
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      ref={ref}
      {...props}
    />
  );
}
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription, AlertTitle };
