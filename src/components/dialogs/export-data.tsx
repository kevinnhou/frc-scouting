"use client";

import { Download, FileTextIcon, QrCode, Sheet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { exportToGoogleSheets } from "@/app/actions/export-sheets";
import { Button } from "~/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/ui/dialog";
import { Label } from "~/ui/label";
import { RadioGroup, RadioGroupItem } from "~/ui/radio-group";
import { ScrollArea } from "~/ui/scroll-area";

interface ExportDataProps {
  exportMethod: "clipboard" | "json" | "qrcode" | "sheets";
  onOpenChange: (open: boolean) => void;
  open: boolean;
  selectedSubmissions: number[];
  setExportMethod: (method: "clipboard" | "json" | "qrcode" | "sheets") => void;
  setQRCodeData: (data: string) => void;
  setSelectedSubmissions: (indices: number[]) => void;
  setShowQRModal: (show: boolean) => void;
  storedSubmissions: any[];
}

const MAX_QR_SIZE = 2400;

export function ExportData({
  exportMethod,
  onOpenChange,
  open,
  selectedSubmissions,
  setExportMethod,
  setQRCodeData,
  setSelectedSubmissions,
  setShowQRModal,
  storedSubmissions,
}: ExportDataProps) {
  const [isExporting, setIsExporting] = useState(false);

  function handleMethodChange(
    method: "clipboard" | "json" | "qrcode" | "sheets",
  ) {
    setExportMethod(method);
  }

  function handleSelection(index: number) {
    setSelectedSubmissions(
      selectedSubmissions.includes(index)
        ? selectedSubmissions.filter((i) => i !== index)
        : [...selectedSubmissions, index],
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

  async function exportData() {
    const selectedData = getSelectedData();

    if (selectedData.length === 0) {
      toast.error("No submissions selected");
      return;
    }

    const dataSize = getDataSize(selectedData);

    if (exportMethod === "qrcode" && dataSize > MAX_QR_SIZE) {
      toast.error(
        `Data size (${dataSize} bytes) exceeds QR code capacity (${MAX_QR_SIZE} bytes). Please select fewer submissions or use another export method.`,
      );
      return;
    }

    switch (exportMethod) {
      case "clipboard":
        navigator.clipboard
          .writeText(JSON.stringify(selectedData))
          .then(() => toast.success("Data copied to clipboard"))
          .catch(() => toast.error("Failed to copy data to clipboard"));
        break;
      case "json": {
        const blob = new Blob([JSON.stringify(selectedData, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "rec-scouting-data.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("JSON file downloaded");
        break;
      }
      case "qrcode":
        setQRCodeData(JSON.stringify(selectedData));
        setShowQRModal(true);
        break;
      case "sheets":
        setIsExporting(true);
        try {
          const spreadsheetID = localStorage.getItem("spreadsheetID") || "";
          const sheetID = localStorage.getItem("sheetID") || "";

          if (!spreadsheetID || !sheetID) {
            toast.error(
              "Spreadsheet details are missing. Please configure your spreadsheet ID and sheet ID in settings.",
            );
            setIsExporting(false);
            return;
          }

          const result = await exportToGoogleSheets({
            submissions: selectedData,
            spreadsheetID,
            sheetID,
          });

          if (result.success) {
            toast.success(
              result.message || "Data exported to Google Sheets successfully",
            );
          } else {
            toast.error(
              result.message || "Failed to export data to Google Sheets",
            );
          }
        } catch (error) {
          console.error("Export to Google Sheets failed:", error);
          toast.error("Failed to export data to Google Sheets");
        } finally {
          setIsExporting(false);
        }
        break;
    }

    if (exportMethod !== "sheets") {
      onOpenChange(false);
    }
  }

  const exportMethods = [
    {
      id: "qrcode",
      label: "QR Code",
      icon: <QrCode className="h-4 w-4" />,
    },
    {
      id: "clipboard",
      label: "Copy to Clipboard",
      icon: <FileTextIcon className="h-4 w-4" />,
    },
    {
      id: "json",
      label: "Download JSON",
      icon: <Download className="h-4 w-4" />,
    },
    {
      id: "sheets",
      label: "Google Sheets",
      icon: <Sheet className="h-4 w-4" />,
    },
  ];

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-hidden p-0 sm:max-w-lg md:max-w-xl">
        <DialogHeader className="px-4 pt-5 sm:px-6">
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Select submissions and export method
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 px-4 py-2 sm:px-6">
          <div>
            <Label className="text-sm font-medium">Export Method</Label>
            <RadioGroup
              value={exportMethod}
              onValueChange={(value) => handleMethodChange(value as any)}
              className="mt-2 grid gap-2 sm:grid-cols-2"
            >
              {exportMethods.map((method) => (
                <div
                  key={method.id}
                  className={`flex items-center space-x-2 rounded-md border transition-colors hover:bg-accent ${
                    exportMethod === method.id
                      ? "border-primary bg-accent/40"
                      : "border-input"
                  }`}
                >
                  <RadioGroupItem
                    value={method.id}
                    id={method.id}
                    className="sr-only"
                  />
                  <div
                    className="flex w-full cursor-pointer items-center justify-between p-3"
                    onClick={() => handleMethodChange(method.id as any)}
                  >
                    <div className="flex items-center space-x-2">
                      {method.icon}
                      <Label
                        htmlFor={method.id}
                        className="cursor-pointer font-medium"
                      >
                        {method.label}
                      </Label>
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
            {exportMethod === "qrcode" && (
              <p className="mt-4 text-xs text-muted-foreground">
                QR codes have limited capacity. Select fewer submissions if
                export fails.
              </p>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-sm font-medium">Submissions</Label>
              <Button
                onClick={handleSelectAll}
                size="sm"
                variant="outline"
                className="h-8 px-2 text-xs"
              >
                {selectedSubmissions.length === storedSubmissions.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>

            <ScrollArea className="h-[180px] rounded-md border">
              {storedSubmissions.length > 0 ? (
                <div className="p-1">
                  {storedSubmissions.map((submission, index) => (
                    <div
                      className="flex cursor-pointer items-center space-x-2 rounded-md p-2 hover:bg-accent"
                      key={index}
                      onClick={() => handleSelection(index)}
                    >
                      <input
                        checked={selectedSubmissions.includes(index)}
                        className="h-4 w-4"
                        onChange={() => handleSelection(index)}
                        type="checkbox"
                      />
                      <span className="text-sm">
                        Team {String(submission["Team Number"])} - Match{" "}
                        {String(submission["Qualification Number"])}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
                  No submissions available
                </div>
              )}
            </ScrollArea>

            <div className="mt-2 text-xs">
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

        <DialogFooter className="border-t p-4 sm:px-6">
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              disabled={isExporting || selectedSubmissions.length === 0}
              onClick={exportData}
              className="sm:w-auto"
            >
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
