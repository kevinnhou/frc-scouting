"use client";

import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { Check, ChevronRight, Circle } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const MenubarMenu = MenubarPrimitive.Menu;

const MenubarGroup = MenubarPrimitive.Group;

const MenubarPortal = MenubarPrimitive.Portal;

const MenubarSub = MenubarPrimitive.Sub;

const MenubarRadioGroup = MenubarPrimitive.RadioGroup;

function Menubar({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root> & { ref?: React.RefObject<React.ElementRef<typeof MenubarPrimitive.Root> | null> }) {
  return (
    <MenubarPrimitive.Root
      className={cn(
        "flex h-9 items-center space-x-1 rounded-md border bg-background p-1 shadow-sm",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}
Menubar.displayName = MenubarPrimitive.Root.displayName;

function MenubarTrigger({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger> & { ref?: React.RefObject<React.ElementRef<typeof MenubarPrimitive.Trigger> | null> }) {
  return (
    <MenubarPrimitive.Trigger
      className={cn(
        "flex cursor-default select-none items-center rounded-sm px-3 py-1 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName;

function MenubarSubTrigger({ ref, children, className, inset, ...props }: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean
} & { ref?: React.RefObject<React.ElementRef<typeof MenubarPrimitive.SubTrigger> | null> }) {
  return (
    <MenubarPrimitive.SubTrigger
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
    </MenubarPrimitive.SubTrigger>
  );
}
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName;

function MenubarSubContent({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent> & { ref?: React.RefObject<React.ElementRef<typeof MenubarPrimitive.SubContent> | null> }) {
  return (
    <MenubarPrimitive.SubContent
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName;

function MenubarContent({ ref, align = "start", alignOffset = -4, className, sideOffset = 8, ...props }: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content> & { ref?: React.RefObject<React.ElementRef<typeof MenubarPrimitive.Content> | null> }) {
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        align={align}
        alignOffset={alignOffset}
        className={cn(
          "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        ref={ref}
        sideOffset={sideOffset}
        {...props}
      />
    </MenubarPrimitive.Portal>
  );
}
MenubarContent.displayName = MenubarPrimitive.Content.displayName;

function MenubarItem({ ref, className, inset, ...props }: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
  inset?: boolean
} & { ref?: React.RefObject<React.ElementRef<typeof MenubarPrimitive.Item> | null> }) {
  return (
    <MenubarPrimitive.Item
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
MenubarItem.displayName = MenubarPrimitive.Item.displayName;

function MenubarCheckboxItem({ ref, checked, children, className, ...props }: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem> & { ref?: React.RefObject<React.ElementRef<typeof MenubarPrimitive.CheckboxItem> | null> }) {
  return (
    <MenubarPrimitive.CheckboxItem
      checked={checked}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  );
}
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName;

function MenubarRadioItem({ ref, children, className, ...props }: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem> & { ref?: React.RefObject<React.ElementRef<typeof MenubarPrimitive.RadioItem> | null> }) {
  return (
    <MenubarPrimitive.RadioItem
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <Circle className="h-4 w-4 fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  );
}
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName;

function MenubarLabel({ ref, className, inset, ...props }: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
  inset?: boolean
} & { ref?: React.RefObject<React.ElementRef<typeof MenubarPrimitive.Label> | null> }) {
  return (
    <MenubarPrimitive.Label
      className={cn(
        "px-2 py-1.5 text-sm font-semibold",
        inset && "pl-8",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}
MenubarLabel.displayName = MenubarPrimitive.Label.displayName;

function MenubarSeparator({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator> & { ref?: React.RefObject<React.ElementRef<typeof MenubarPrimitive.Separator> | null> }) {
  return (
    <MenubarPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      ref={ref}
      {...props}
    />
  );
}
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName;

function MenubarShortcut({
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
MenubarShortcut.displayname = "MenubarShortcut";

export {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
};
