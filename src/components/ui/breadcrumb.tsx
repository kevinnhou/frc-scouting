import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

function Breadcrumb({ ref, ...props }: React.ComponentPropsWithoutRef<"nav"> & {
  separator?: React.ReactNode
} & { ref?: React.RefObject<HTMLElement | null> }) {
  return <nav aria-label="breadcrumb" ref={ref} {...props} />;
}
Breadcrumb.displayName = "Breadcrumb";

function BreadcrumbList({ ref, className, ...props }: React.ComponentPropsWithoutRef<"ol"> & { ref?: React.RefObject<HTMLOListElement | null> }) {
  return (
    <ol
      className={cn(
        "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}
BreadcrumbList.displayName = "BreadcrumbList";

function BreadcrumbItem({ ref, className, ...props }: React.ComponentPropsWithoutRef<"li"> & { ref?: React.RefObject<HTMLLIElement | null> }) {
  return (
    <li
      className={cn("inline-flex items-center gap-1.5", className)}
      ref={ref}
      {...props}
    />
  );
}
BreadcrumbItem.displayName = "BreadcrumbItem";

function BreadcrumbLink({ ref, asChild, className, ...props }: React.ComponentPropsWithoutRef<"a"> & {
  asChild?: boolean
} & { ref?: React.RefObject<HTMLAnchorElement | null> }) {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      className={cn("transition-colors hover:text-foreground", className)}
      ref={ref}
      {...props}
    />
  );
}
BreadcrumbLink.displayName = "BreadcrumbLink";

function BreadcrumbPage({ ref, className, ...props }: React.ComponentPropsWithoutRef<"span"> & { ref?: React.RefObject<HTMLSpanElement | null> }) {
  return (
    <span
      aria-current="page"
      aria-disabled="true"
      className={cn("font-normal text-foreground", className)}
      ref={ref}
      role="link"
      {...props}
    />
  );
}
BreadcrumbPage.displayName = "BreadcrumbPage";

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      aria-hidden="true"
      className={cn("[&>svg]:w-3.5 [&>svg]:h-3.5", className)}
      role="presentation"
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      className={cn("flex h-9 w-9 items-center justify-center", className)}
      role="presentation"
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More</span>
    </span>
  );
}
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis";

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
