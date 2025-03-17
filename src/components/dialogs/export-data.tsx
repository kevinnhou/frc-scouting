/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Download, FileTextIcon, QrCode } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/dialog";
import { Label } from "~/label";

type ExportDataProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportMethod: "qrcode" | "clipboard" | "json";
  setExportMethod: (method: "qrcode" | "clipboard" | "json") => void;
  selectedSubmissions: number[];
  setSelectedSubmissions: (indices: number[]) => void;
  storedSubmissions: any[];
  setQRCodeData: (data: string) => void;
  setShowQRModal: (show: boolean) => void;
};

const MAX_QR_SIZE = 2400;

export function ExportData({
  open,
  onOpenChange,
  exportMethod,
  setExportMethod,
  selectedSubmissions,
  setSelectedSubmissions,
  storedSubmissions,
  setQRCodeData,
  setShowQRModal,
}: ExportDataProps) {
  function handleMethodChange(method: "qrcode" | "clipboard" | "json") {
    setExportMethod(method);
  }

  function handleSelection(index: number) {
    setSelectedSubmissions(
      selectedSubmissions.includes(index)
        ? selectedSubmissions.filter((i) => i !== index)
        : [...selectedSubmissions, index]
    );
  }

  function handleSelectAll() {
    if (selectedSubmissions.length === storedSubmissions.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(storedSubmissions.map((_, index) => index));
    }
  }

  function getSelectedData() {
    return selectedSubmissions
      .sort((a, b) => a - b)
      .map((index) => storedSubmissions[index]);
  }

  function getDataSize(data: unknown) {
    return new Blob([JSON.stringify(data)]).size;
  }

  function exportData() {
    const selectedData = getSelectedData();

    if (selectedData.length === 0) {
      toast.error("No submissions selected");
      return;
    }

    const dataSize = getDataSize(selectedData);

    if (exportMethod === "qrcode" && dataSize > MAX_QR_SIZE) {
      toast.error(
        `Data size (${dataSize} bytes) exceeds QR code capacity (${MAX_QR_SIZE} bytes). Please select fewer submissions or use another export method.`
      );
      return;
    }

    switch (exportMethod) {
      case "qrcode":
        setQRCodeData(JSON.stringify(selectedData));
        setShowQRModal(true);
        break;
      case "clipboard":
        navigator.clipboard
          .writeText(JSON.stringify(selectedData))
          .then(() => toast.success("Data copied to clipboard"))
          .catch(() => toast.error("Failed to copy data to clipboard"));
        break;
      case "json":
        const blob = new Blob([JSON.stringify(selectedData, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `rec-scouting-data.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("JSON file downloaded");
        break;
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription className="tracking-wide font-sans">
            Select submissions and export method
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-4">
            <Label>Export Method</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={exportMethod === "qrcode" ? "default" : "outline"}
                onClick={() => handleMethodChange("qrcode")}
                className="flex-1"
              >
                <QrCode className="h-4 w-4 mr-2" />
                QR Code
              </Button>
              <Button
                variant={exportMethod === "clipboard" ? "default" : "outline"}
                onClick={() => handleMethodChange("clipboard")}
                className="flex-1"
              >
                <FileTextIcon className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </Button>
              <Button
                variant={exportMethod === "json" ? "default" : "outline"}
                onClick={() => handleMethodChange("json")}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <Label>Submissions</Label>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedSubmissions.length === storedSubmissions.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
            <div className="max-h-60 overflow-y-auto border rounded-md p-2">
              {storedSubmissions.length > 0 ? (
                storedSubmissions.map((submission, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                    onClick={() => handleSelection(index)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubmissions.includes(index)}
                      onChange={() => handleSelection(index)}
                      className="h-4 w-4"
                    />
                    <span>
                      Team {String(submission["Team Number"])} - Match{" "}
                      {String(submission["Qualification Number"])}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No submissions available
                </div>
              )}
            </div>
            {exportMethod === "qrcode" && (
              <div className="text-xs text-muted-foreground mt-2">
                QR codes have limited capacity. Select fewer submissions if
                export fails.
              </div>
            )}
            <div className="text-sm mt-2">
              Selected: {selectedSubmissions.length} of{" "}
              {storedSubmissions.length} submissions
              {selectedSubmissions.length > 0 && (
                <span className="ml-2">
                  ({getDataSize(getSelectedData())} bytes)
                </span>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={exportData}>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
