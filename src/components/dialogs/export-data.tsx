"use client"

import { Download, FileTextIcon, QrCode } from "lucide-react"
import { toast } from "sonner"

import { Button } from "~/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/dialog"
import { Label } from "~/label"

interface TExportDataProps {
  exportMethod: "clipboard" | "json" | "qrcode"
  onOpenChange: (open: boolean) => void
  open: boolean
  selectedSubmissions: number[]
  setExportMethod: (method: "clipboard" | "json" | "qrcode") => void
  setQRCodeData: (data: string) => void
  setSelectedSubmissions: (indices: number[]) => void
  setShowQRModal: (show: boolean) => void
  storedSubmissions: any[]
}

const MAX_QR_SIZE = 2400

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
}: TExportDataProps) {
  function handleMethodChange(method: "clipboard" | "json" | "qrcode") {
    setExportMethod(method)
  }

  function handleSelection(index: number) {
    setSelectedSubmissions(
      selectedSubmissions.includes(index)
        ? selectedSubmissions.filter(i => i !== index)
        : [...selectedSubmissions, index],
    )
  }

  function handleSelectAll() {
    if (selectedSubmissions.length === storedSubmissions.length) {
      setSelectedSubmissions([])
    }
    else {
      setSelectedSubmissions(storedSubmissions.map((_, index) => index))
    }
  }

  function getSelectedData() {
    return selectedSubmissions
      .sort((a, b) => a - b)
      .map(index => storedSubmissions[index])
  }

  function getDataSize(data: unknown) {
    return new Blob([JSON.stringify(data)]).size
  }

  function exportData() {
    const selectedData = getSelectedData()

    if (selectedData.length === 0) {
      toast.error("No submissions selected")
      return
    }

    const dataSize = getDataSize(selectedData)

    if (exportMethod === "qrcode" && dataSize > MAX_QR_SIZE) {
      toast.error(
        `Data size (${dataSize} bytes) exceeds QR code capacity (${MAX_QR_SIZE} bytes). Please select fewer submissions or use another export method.`,
      )
      return
    }

    switch (exportMethod) {
      case "clipboard":
        navigator.clipboard
          .writeText(JSON.stringify(selectedData))
          .then(() => toast.success("Data copied to clipboard"))
          .catch(() => toast.error("Failed to copy data to clipboard"))
        break
      case "json":
      { const blob = new Blob([JSON.stringify(selectedData, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `rec-scouting-data.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("JSON file downloaded")
      break }
      case "qrcode":
        setQRCodeData(JSON.stringify(selectedData))
        setShowQRModal(true)
        break
    }

    onOpenChange(false)
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
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
                className="flex-1"
                onClick={() => handleMethodChange("qrcode")}
                variant={exportMethod === "qrcode" ? "default" : "outline"}
              >
                <QrCode className="h-4 w-4 mr-2" />
                QR Code
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleMethodChange("clipboard")}
                variant={exportMethod === "clipboard" ? "default" : "outline"}
              >
                <FileTextIcon className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleMethodChange("json")}
                variant={exportMethod === "json" ? "default" : "outline"}
              >
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <Label>Submissions</Label>
              <Button onClick={handleSelectAll} size="sm" variant="outline">
                {selectedSubmissions.length === storedSubmissions.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
            <div className="max-h-60 overflow-y-auto border rounded-md p-2">
              {storedSubmissions.length > 0
                ? (
                    storedSubmissions.map((submission, index) => (
                      <div
                        className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                        key={index}
                        onClick={() => handleSelection(index)}
                      >
                        <input
                          checked={selectedSubmissions.includes(index)}
                          className="h-4 w-4"
                          onChange={() => handleSelection(index)}
                          type="checkbox"
                        />
                        <span>
                          Team
                          {" "}
                          {String(submission["Team Number"])}
                          {" "}
                          - Match
                          {" "}
                          {String(submission["Qualification Number"])}
                        </span>
                      </div>
                    ))
                  )
                : (
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
              Selected:
              {" "}
              {selectedSubmissions.length}
              {" "}
              of
              {" "}
              {storedSubmissions.length}
              {" "}
              submissions
              {selectedSubmissions.length > 0 && (
                <span className="ml-2">
                  (
                  {getDataSize(getSelectedData())}
                  {" "}
                  bytes)
                </span>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={exportData}>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
