"use client";

import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const ContextMenu = ContextMenuPrimitive.Root;

const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

const ContextMenuGroup = ContextMenuPrimitive.Group;

const ContextMenuPortal = ContextMenuPrimitive.Portal;

const ContextMenuSub = ContextMenuPrimitive.Sub;

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

function ContextMenuSubTrigger({ ref, children, className, inset, ...props }: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean
} & { ref?: React.RefObject<React.ElementRef<typeof ContextMenuPrimitive.SubTrigger> | null> }) {
  return (
    <ContextMenuPrimitive.SubTrigger
      className={cn(
        "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        inset && "pl-8",
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </ContextMenuPrimitive.SubTrigger>
  );
}
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName;

function ContextMenuSubContent({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent> & { ref?: React.RefObject<React.ElementRef<typeof ContextMenuPrimitive.SubContent> | null> }) {
  return (
    <ContextMenuPrimitive.SubContent
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName;

function ContextMenuContent({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content> & { ref?: React.RefObject<React.ElementRef<typeof ContextMenuPrimitive.Content> | null> }) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        ref={ref}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName;

function ContextMenuItem({ ref, className, inset, ...props }: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean
} & { ref?: React.RefObject<React.ElementRef<typeof ContextMenuPrimitive.Item> | null> }) {
  return (
    <ContextMenuPrimitive.Item
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;

function ContextMenuCheckboxItem({ ref, checked, children, className, ...props }: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem> & { ref?: React.RefObject<React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem> | null> }) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      checked={checked}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}
ContextMenuCheckboxItem.displayName
  = ContextMenuPrimitive.CheckboxItem.displayName;

function ContextMenuRadioItem({ ref, children, className, ...props }: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem> & { ref?: React.RefObject<React.ElementRef<typeof ContextMenuPrimitive.RadioItem> | null> }) {
  return (
    <ContextMenuPrimitive.RadioItem
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <Circle className="h-4 w-4 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName;

function ContextMenuLabel({ ref, className, inset, ...props }: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean
} & { ref?: React.RefObject<React.ElementRef<typeof ContextMenuPrimitive.Label> | null> }) {
  return (
    <ContextMenuPrimitive.Label
      className={cn(
        "px-2 py-1.5 text-sm font-semibold text-foreground",
        inset && "pl-8",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName;

function ContextMenuSeparator({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator> & { ref?: React.RefObject<React.ElementRef<typeof ContextMenuPrimitive.Separator> | null> }) {
  return (
    <ContextMenuPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      ref={ref}
      {...props}
    />
  );
}
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName;

function ContextMenuShortcut({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
ContextMenuShortcut.displayName = "ContextMenuShortcut";

export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
};
