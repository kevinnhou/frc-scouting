"use client";

import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/alert-dialog";

type TClearDataProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submissionsCount: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setStoredSubmissions: (submissions: any[]) => void;
};

export function ClearData({
  open,
  onOpenChange,
  submissionsCount,
  setStoredSubmissions,
}: TClearDataProps) {
  function confirmClear() {
    localStorage.removeItem("formSubmissions");
    setStoredSubmissions([]);
    onOpenChange(false);
    toast.success("All stored submissions cleared");
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear All Submissions</AlertDialogTitle>
          <AlertDialogDescription className="tracking-wide font-sans">
            Are you sure you want to clear all {submissionsCount} stored
            submission
            {submissionsCount !== 1 ? "s" : ""}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmClear}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Clear All Data
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
