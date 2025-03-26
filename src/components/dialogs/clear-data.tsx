"use client"

import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/alert-dialog"

interface TClearDataProps {
  onOpenChange: (open: boolean) => void
  open: boolean
  setStoredSubmissions: (submissions: any[]) => void
  submissionsCount: number
}

export function ClearData({
  onOpenChange,
  open,
  setStoredSubmissions,
  submissionsCount,
}: TClearDataProps) {
  function confirmClear() {
    localStorage.removeItem("formSubmissions")
    setStoredSubmissions([])
    onOpenChange(false)
    toast.success("All stored submissions cleared")
  }

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear All Submissions</AlertDialogTitle>
          <AlertDialogDescription className="tracking-wide font-sans">
            Are you sure you want to clear all
            {" "}
            {submissionsCount}
            {" "}
            stored
            submission
            {submissionsCount !== 1 ? "s" : ""}
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={confirmClear}
          >
            Clear All Data
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
