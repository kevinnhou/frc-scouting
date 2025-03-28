"use client";

import { QRCodeSVG } from "qrcode.react";

import { Button } from "~/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/dialog";

interface TQRCodeProps {
  onOpenChange: (open: boolean) => void
  open: boolean
  QRBgColour: string
  QRCodeData: string
  QRFgColour: string
  submissionsCount: number
}

export function QRCode({
  onOpenChange,
  open,
  QRBgColour,
  QRCodeData,
  QRFgColour,
  submissionsCount,
}: TQRCodeProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
          <DialogDescription>
            Scan to access
            {" "}
            {submissionsCount}
            {" "}
            form submission
            {submissionsCount !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center py-6">
          <QRCodeSVG
            bgColor={QRBgColour}
            fgColor={QRFgColour}
            size={256}
            value={QRCodeData}
          />
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
