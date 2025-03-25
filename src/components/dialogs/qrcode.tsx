"use client";

import { QRCodeSVG } from "qrcode.react";

import { Button } from "~/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/dialog";

type TQRCodeProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  QRCodeData: string;
  QRBgColour: string;
  QRFgColour: string;
  submissionsCount: number;
};

export function QRCode({
  open,
  onOpenChange,
  QRCodeData,
  QRBgColour,
  QRFgColour,
  submissionsCount,
}: TQRCodeProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
          <DialogDescription>
            Scan to access {submissionsCount} form submission
            {submissionsCount !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center py-6">
          <QRCodeSVG
            value={QRCodeData}
            bgColor={QRBgColour}
            fgColor={QRFgColour}
            size={256}
          />
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
