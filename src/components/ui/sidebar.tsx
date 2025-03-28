/* eslint-disable ts/no-redeclare */
"use client";

import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { PanelLeft } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

interface SidebarContext {
  isMobile: boolean
  open: boolean
  openMobile: boolean
  setOpen: (open: boolean) => void
  setOpenMobile: (open: boolean) => void
  state: "collapsed" | "expanded"
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<null | SidebarContext>(null);

function useSidebar() {
  const context = React.use(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

function SidebarProvider({ ref, children, className, defaultOpen = true, onOpenChange: setOpenProp, open: openProp, style, ...props }: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  open?: boolean
} & { ref?: React.RefObject<HTMLDivElement | null> }) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: ((value: boolean) => boolean) | boolean) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      }
      else {
        _setOpen(openState);
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile
      ? setOpenMobile((open) => !open)
      : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT
        && (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContext>(
    () => ({
      isMobile,
      open,
      openMobile,
      setOpen,
      setOpenMobile,
      state,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  );

  return (
    <SidebarContext value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          className={cn(
            "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
            className,
          )}
          ref={ref}
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext>
  );
}
SidebarProvider.displayName = "SidebarProvider";

function Sidebar({ ref, children, className, collapsible = "offcanvas", side = "left", variant = "sidebar", ...props }: React.ComponentProps<"div"> & {
  collapsible?: "icon" | "none" | "offcanvas"
  side?: "left" | "right"
  variant?: "floating" | "inset" | "sidebar"
} & { ref?: React.RefObject<HTMLDivElement | null> }) {
  const { isMobile, openMobile, setOpenMobile, state } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        className={cn(
          "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet onOpenChange={setOpenMobile} open={openMobile} {...props}>
        <SheetContent
          className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
          data-mobile="true"
          data-sidebar="sidebar"
          side={side}
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
        >
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="group peer hidden md:block text-sidebar-foreground"
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-side={side}
      data-state={state}
      data-variant={variant}
      ref={ref}
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        className={cn(
          "duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
            : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]",
        )}
      />
      <div
        className={cn(
          "duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
            : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className,
        )}
        {...props}
      >
        <div
          className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
          data-sidebar="sidebar"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
Sidebar.displayName = "Sidebar";

function SidebarTrigger({ ref, className, onClick, ...props }: React.ComponentProps<typeof Button> & { ref?: React.RefObject<React.ElementRef<typeof Button> | null> }) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      className={cn("h-7 w-7", className)}
      data-sidebar="trigger"
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      ref={ref}
      size="icon"
      variant="ghost"
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}
SidebarTrigger.displayName = "SidebarTrigger";

function SidebarRail({ ref, className, ...props }: React.ComponentProps<"button"> & { ref?: React.RefObject<HTMLButtonElement | null> }) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      aria-label="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className,
      )}
      data-sidebar="rail"
      onClick={toggleSidebar}
      ref={ref}
      tabIndex={-1}
      title="Toggle Sidebar"
      {...props}
    />
  );
}
SidebarRail.displayName = "SidebarRail";

function SidebarInset({ ref, className, ...props }: React.ComponentProps<"main"> & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <main
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background",
        "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}
SidebarInset.displayName = "SidebarInset";

function SidebarInput({ ref, className, ...props }: React.ComponentProps<typeof Input> & { ref?: React.RefObject<React.ElementRef<typeof Input> | null> }) {
  return (
    <Input
      className={cn(
        "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className,
      )}
      data-sidebar="input"
      ref={ref}
      {...props}
    />
  );
}
SidebarInput.displayName = "SidebarInput";

function SidebarHeader({ ref, className, ...props }: React.ComponentProps<"div"> & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      className={cn("flex flex-col gap-2 p-2", className)}
      data-sidebar="header"
      ref={ref}
      {...props}
    />
  );
}
SidebarHeader.displayName = "SidebarHeader";

function SidebarFooter({ ref, className, ...props }: React.ComponentProps<"div"> & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      className={cn("flex flex-col gap-2 p-2", className)}
      data-sidebar="footer"
      ref={ref}
      {...props}
    />
  );
}
SidebarFooter.displayName = "SidebarFooter";

function SidebarSeparator({ ref, className, ...props }: React.ComponentProps<typeof Separator> & { ref?: React.RefObject<React.ElementRef<typeof Separator> | null> }) {
  return (
    <Separator
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      data-sidebar="separator"
      ref={ref}
      {...props}
    />
  );
}
SidebarSeparator.displayName = "SidebarSeparator";

function SidebarContent({ ref, className, ...props }: React.ComponentProps<"div"> & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className,
      )}
      data-sidebar="content"
      ref={ref}
      {...props}
    />
  );
}
SidebarContent.displayName = "SidebarContent";

function SidebarGroup({ ref, className, ...props }: React.ComponentProps<"div"> & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      data-sidebar="group"
      ref={ref}
      {...props}
    />
  );
}
SidebarGroup.displayName = "SidebarGroup";

function SidebarGroupLabel({ ref, asChild = false, className, ...props }: React.ComponentProps<"div"> & { asChild?: boolean } & { ref?: React.RefObject<HTMLDivElement | null> }) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      className={cn(
        "duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className,
      )}
      data-sidebar="group-label"
      ref={ref}
      {...props}
    />
  );
}
SidebarGroupLabel.displayName = "SidebarGroupLabel";

function SidebarGroupAction({ ref, asChild = false, className, ...props }: React.ComponentProps<"button"> & { asChild?: boolean } & { ref?: React.RefObject<HTMLButtonElement | null> }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      data-sidebar="group-action"
      ref={ref}
      {...props}
    />
  );
}
SidebarGroupAction.displayName = "SidebarGroupAction";

function SidebarGroupContent({ ref, className, ...props }: React.ComponentProps<"div"> & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      className={cn("w-full text-sm", className)}
      data-sidebar="group-content"
      ref={ref}
      {...props}
    />
  );
}
SidebarGroupContent.displayName = "SidebarGroupContent";

function SidebarMenu({ ref, className, ...props }: React.ComponentProps<"ul"> & { ref?: React.RefObject<HTMLUListElement | null> }) {
  return (
    <ul
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      data-sidebar="menu"
      ref={ref}
      {...props}
    />
  );
}
SidebarMenu.displayName = "SidebarMenu";

function SidebarMenuItem({ ref, className, ...props }: React.ComponentProps<"li"> & { ref?: React.RefObject<HTMLLIElement | null> }) {
  return (
    <li
      className={cn("group/menu-item relative", className)}
      data-sidebar="menu-item"
      ref={ref}
      {...props}
    />
  );
}
SidebarMenuItem.displayName = "SidebarMenuItem";

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-8 text-sm",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
        sm: "h-7 text-xs",
      },
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
    },
  },
);

function SidebarMenuButton({ ref, asChild = false, className, isActive = false, size = "default", tooltip, variant = "default", ...props }: React.ComponentProps<"button"> & VariantProps<typeof sidebarMenuButtonVariants> & {
  asChild?: boolean
  isActive?: boolean
  tooltip?: React.ComponentProps<typeof TooltipContent> | string
} & { ref?: React.RefObject<HTMLButtonElement | null> }) {
  const Comp = asChild ? Slot : "button";
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      className={cn(sidebarMenuButtonVariants({ size, variant }), className)}
      data-active={isActive}
      data-sidebar="menu-button"
      data-size={size}
      ref={ref}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        align="center"
        hidden={state !== "collapsed" || isMobile}
        side="right"
        {...tooltip}
      />
    </Tooltip>
  );
}
SidebarMenuButton.displayName = "SidebarMenuButton";

function SidebarMenuAction({ ref, asChild = false, className, showOnHover = false, ...props }: React.ComponentProps<"button"> & {
  asChild?: boolean
  showOnHover?: boolean
} & { ref?: React.RefObject<HTMLButtonElement | null> }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover
        && "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className,
      )}
      data-sidebar="menu-action"
      ref={ref}
      {...props}
    />
  );
}
SidebarMenuAction.displayName = "SidebarMenuAction";

function SidebarMenuBadge({ ref, className, ...props }: React.ComponentProps<"div"> & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      className={cn(
        "absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      data-sidebar="menu-badge"
      ref={ref}
      {...props}
    />
  );
}
SidebarMenuBadge.displayName = "SidebarMenuBadge";

function SidebarMenuSkeleton({ ref, className, showIcon = false, ...props }: React.ComponentProps<"div"> & {
  showIcon?: boolean
} & { ref?: React.RefObject<HTMLDivElement | null> }) {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      className={cn("rounded-md h-8 flex gap-2 px-2 items-center", className)}
      data-sidebar="menu-skeleton"
      ref={ref}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 flex-1 max-w-[--skeleton-width]"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  );
}
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";

function SidebarMenuSub({ ref, className, ...props }: React.ComponentProps<"ul"> & { ref?: React.RefObject<HTMLUListElement | null> }) {
  return (
    <ul
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      data-sidebar="menu-sub"
      ref={ref}
      {...props}
    />
  );
}
SidebarMenuSub.displayName = "SidebarMenuSub";

const SidebarMenuSubItem = ({ ref, ...props }: React.ComponentProps<"li"> & { ref?: React.RefObject<HTMLLIElement | null> }) => <li ref={ref} {...props} />;
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";

function SidebarMenuSubButton({ ref, asChild = false, className, isActive, size = "md", ...props }: React.ComponentProps<"a"> & {
  asChild?: boolean
  isActive?: boolean
  size?: "md" | "sm"
} & { ref?: React.RefObject<HTMLAnchorElement | null> }) {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      data-active={isActive}
      data-sidebar="menu-sub-button"
      data-size={size}
      ref={ref}
      {...props}
    />
  );
}
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
