"use client";

import * as ToastPrimitives from "@radix-ui/react-toast";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

function ToastViewport({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport> & {
  ref?: React.RefObject<React.ElementRef<
    typeof ToastPrimitives.Viewport
  > | null>;
}) {
  return (
    <ToastPrimitives.Viewport
      className={cn(
        "fixed top-0 z-100 flex max-h-screen w-full flex-col-reverse p-4 sm:top-auto sm:right-0 sm:bottom-0 sm:flex-col md:max-w-[420px]",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full sm:data-[state=open]:slide-in-from-bottom-full",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
  },
);

function Toast({
  ref,
  className,
  variant,
  ...props
}: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
  VariantProps<typeof toastVariants> & {
    ref?: React.RefObject<React.ElementRef<typeof ToastPrimitives.Root> | null>;
  }) {
  return (
    <ToastPrimitives.Root
      className={cn(toastVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  );
}
Toast.displayName = ToastPrimitives.Root.displayName;

function ToastAction({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action> & {
  ref?: React.RefObject<React.ElementRef<typeof ToastPrimitives.Action> | null>;
}) {
  return (
    <ToastPrimitives.Action
      className={cn(
        "hover:group-[.destructive]:text-destructive-foreground inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors group-[.destructive]:border-muted/40 hover:bg-secondary hover:group-[.destructive]:border-destructive/30 hover:group-[.destructive]:bg-destructive focus:ring-1 focus:ring-ring focus:outline-hidden focus:group-[.destructive]:ring-destructive disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}
ToastAction.displayName = ToastPrimitives.Action.displayName;

function ToastClose({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close> & {
  ref?: React.RefObject<React.ElementRef<typeof ToastPrimitives.Close> | null>;
}) {
  return (
    <ToastPrimitives.Close
      className={cn(
        "absolute top-1 right-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 group-[.destructive]:text-red-300 hover:text-foreground hover:group-[.destructive]:text-red-50 focus:opacity-100 focus:ring-1 focus:outline-hidden focus:group-[.destructive]:ring-red-400 focus:group-[.destructive]:ring-offset-red-600",
        className,
      )}
      ref={ref}
      toast-close=""
      {...props}
    >
      <X className="h-4 w-4" />
    </ToastPrimitives.Close>
  );
}
ToastClose.displayName = ToastPrimitives.Close.displayName;

function ToastTitle({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title> & {
  ref?: React.RefObject<React.ElementRef<typeof ToastPrimitives.Title> | null>;
}) {
  return (
    <ToastPrimitives.Title
      className={cn("text-sm font-semibold [&+div]:text-xs", className)}
      ref={ref}
      {...props}
    />
  );
}
ToastTitle.displayName = ToastPrimitives.Title.displayName;

function ToastDescription({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description> & {
  ref?: React.RefObject<React.ElementRef<
    typeof ToastPrimitives.Description
  > | null>;
}) {
  return (
    <ToastPrimitives.Description
      className={cn("text-sm opacity-90", className)}
      ref={ref}
      {...props}
    />
  );
}
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

export {
  Toast,
  ToastAction,
  type ToastActionElement,
  ToastClose,
  ToastDescription,
  type ToastProps,
  ToastProvider,
  ToastTitle,
  ToastViewport,
};
