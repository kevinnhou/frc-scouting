import * as React from "react";

import { cn } from "@/lib/utils";

function Table({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableElement> & {
  ref?: React.RefObject<HTMLTableElement | null>;
}) {
  return (
    <div className="relative w-full overflow-auto">
      <table
        className={cn("w-full caption-bottom text-sm", className)}
        ref={ref}
        {...props}
      />
    </div>
  );
}
Table.displayName = "Table";

function TableHeader({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.RefObject<HTMLTableSectionElement | null>;
}) {
  return (
    <thead className={cn("[&_tr]:border-b", className)} ref={ref} {...props} />
  );
}
TableHeader.displayName = "TableHeader";

function TableBody({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.RefObject<HTMLTableSectionElement | null>;
}) {
  return (
    <tbody
      className={cn("[&_tr:last-child]:border-0", className)}
      ref={ref}
      {...props}
    />
  );
}
TableBody.displayName = "TableBody";

function TableFooter({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.RefObject<HTMLTableSectionElement | null>;
}) {
  return (
    <tfoot
      className={cn(
        "border-t bg-muted/50 font-medium last:[&>tr]:border-b-0",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}
TableFooter.displayName = "TableFooter";

function TableRow({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & {
  ref?: React.RefObject<HTMLTableRowElement | null>;
}) {
  return (
    <tr
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}
TableRow.displayName = "TableRow";

function TableHead({
  ref,
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement> & {
  ref?: React.RefObject<HTMLTableCellElement | null>;
}) {
  return (
    <th
      className={cn(
        "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}
TableHead.displayName = "TableHead";

function TableCell({
  ref,
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & {
  ref?: React.RefObject<HTMLTableCellElement | null>;
}) {
  return (
    <td
      className={cn(
        "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}
TableCell.displayName = "TableCell";

function TableCaption({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement> & {
  ref?: React.RefObject<HTMLTableCaptionElement | null>;
}) {
  return (
    <caption
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      ref={ref}
      {...props}
    />
  );
}
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};
