"use client";

import { useEffect, useState, useCallback } from "react";

import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { QRCodeSVG } from "qrcode.react";

import { autonomous, teleop, misc } from "@/lib/match-scouting";
import { submit } from "@/app/actions/submit";

import {
  Download,
  FileTextIcon,
  QrCode,
  Settings,
  Trash2,
  Upload,
} from "lucide-react";

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
import { Button } from "~/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/dialog";
import { Form } from "~/form";
import { Input } from "~/input";
import { Label } from "~/label";
import { Tabs, TabsList, TabsTrigger } from "~/tabs";
import { Textarea } from "~/textarea";

import { CycleField } from "./cycle-field";
import { DropdownField } from "./dropdown-field";
import { InputField } from "./input-field";
import { NotesField } from "./notes-field";
import { StopwatchField } from "./stopwatch-field";

const formSchema = z.object({
  ...Object.fromEntries(autonomous.map((field) => [field.name, field.schema])),
  ...Object.fromEntries(teleop.map((field) => [field.name, field.schema])),
  ...Object.fromEntries(misc.map((field) => [field.name, field.schema])),
});

type TField = {
  name: string;
  type: string | string[];
  schema: z.ZodTypeAny;
};

type FormData = z.infer<typeof formSchema>;

const initialFormData: Partial<FormData> = {
  "Team Name": "",
  "Team Number": 0,
  "Qualification Number": 0,
  "Starting Position": undefined,
  Preload: undefined,
  Route: "",
  "Autonomous Cycles": {
    "Coral Level 1": 0,
    "Coral Level 2": 0,
    "Coral Level 3": 0,
    "Coral Level 4": 0,
    "Algae Processor": 0,
    "Algae Net": 0,
    "Cycle Times": [],
  },
  "Teleop Cycles": {
    "Coral Level 1": 0,
    "Coral Level 2": 0,
    "Coral Level 3": 0,
    "Coral Level 4": 0,
    "Algae Processor": 0,
    "Algae Net": 0,
    "Cycle Times": [],
  },
  "Cage Level": undefined,
  "Cage Time": [],
  "Drive Team Ability": "",
  Penalties: undefined,
  Defense: undefined,
  "Scoring Behind Reef": undefined,
  "Extra Notes": { text: "", tags: [] },
};

function Dropzone({
  onDrop,
  accept,
}: {
  onDrop: (acceptedFiles: File[]) => void;
  accept: { [key: string]: string[] };
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
  });

  return (
    <div
      {...getRootProps()}
      className="col-span-4 border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
    >
      <input {...getInputProps()} />
      <Upload className="h-8 w-8 text-gray-400 place-self-center mt-2 mb-6" />
      {isDragActive ? (
        <div className="font-medium">Drop your JSON file here...</div>
      ) : (
        <div className="font-medium">Upload a JSON file</div>
      )}
    </div>
  );
}

export function MatchScoutingForm() {
  const [showSpreadsheetIDDialog, setShowSpreadsheetIDDialog] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showClearDataDialog, setShowClearDataDialog] = useState(false);
  const [spreadsheetID, setSpreadsheetID] = useState("");
  const [sheetID, setSheetID] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [teams, setTeams] = useState({});
  const [JSONInput, setJSONInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [QRCodeData, setQRCodeData] = useState("");
  const [QRBgColour, setQRBgColour] = useState("#ffffff");
  const [QRFgColour, setQRFgColour] = useState("#000000");
  const [storedSubmissions, setStoredSubmissions] = useState<FormData[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedSubmissions, setSelectedSubmissions] = useState<number[]>([]);
  const [exportMethod, setExportMethod] = useState<
    "qrcode" | "clipboard" | "json"
  >("qrcode");

  const updateQRColours = useCallback(() => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    const bg = computedStyle.getPropertyValue("--background") || "#ffffff";
    const fg = computedStyle.getPropertyValue("--foreground") || "#000000";

    setQRBgColour(bg.startsWith("hsl") ? bg : "#ffffff");
    setQRFgColour(fg.startsWith("hsl") ? fg : "#000000");
  }, []);

  const loadSubmissions = useCallback(() => {
    try {
      const savedData = localStorage.getItem("formSubmissions");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (Array.isArray(parsedData)) {
          setStoredSubmissions(parsedData);
          return parsedData;
        }
      }
      return [];
    } catch (error) {
      console.error("Error loading stored submissions:", error);
      return [];
    }
  }, []);

  useEffect(() => {
    const storedSpreadsheetID = localStorage.getItem("spreadsheetID");
    if (storedSpreadsheetID) {
      setSpreadsheetID(storedSpreadsheetID);
    }

    const storedTeams = localStorage.getItem("teams");
    if (storedTeams) {
      setTeams(JSON.parse(storedTeams));
    }

    const storedSheetID = localStorage.getItem("sheetID");
    if (storedSheetID) {
      setSheetID(storedSheetID);
    }

    loadSubmissions();
    updateQRColours();
  }, [updateQRColours, loadSubmissions]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialFormData,
    mode: "onTouched",
  });

  const [activeTab, setActiveTab] = useState<
    "autonomous" | "teleop" | "misc" | string
  >("autonomous");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const stopwatches = window.stopwatchRegistry?.[activeTab] || [];
      const cycleFields = window.cycleRegistry?.[activeTab] || {};

      if (stopwatches.length > 0) {
        switch (e.key) {
          case " ":
            e.preventDefault();
            stopwatches.forEach((stopwatch) => {
              if (stopwatch.isRunning()) {
                stopwatch.pause();
              } else {
                stopwatch.start();
              }
            });
            break;
          case "s":
          case "S":
            stopwatches.forEach((stopwatch) => {
              if (stopwatch.isRunning() || stopwatch.hasTime()) {
                stopwatch.save();
              }
            });
            break;
          case "r":
          case "R":
            stopwatches.forEach((stopwatch) => {
              stopwatch.reset();
            });
            break;
        }
      }

      if (e.key >= "1" && e.key <= "4") {
        const fieldName = `Coral Level ${e.key}`;
        if (cycleFields[fieldName]) {
          cycleFields[fieldName]();
        }
      } else if (e.key === "p" || e.key === "P") {
        if (cycleFields["Algae Processor"]) {
          cycleFields["Algae Processor"]();
        }
      } else if (e.key === "n" || e.key === "N") {
        if (cycleFields["Algae Net"]) {
          cycleFields["Algae Net"]();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeTab]);

  async function onSubmit(data: FormData) {
    const currentSubmissions = loadSubmissions();
    const updatedSubmissions = [...currentSubmissions, data];
    localStorage.setItem("formSubmissions", JSON.stringify(updatedSubmissions));
    setStoredSubmissions(updatedSubmissions);

    setIsSubmitting(true);

    toast.promise(
      submit({
        ...data,
        spreadsheetID,
        sheetID,
      }),
      {
        loading: "Submitting form...",
        success: (result) => {
          if (result.success) {
            resetForm();
            return "Form submitted successfully";
          } else if (result.localSuccess) {
            resetForm();
            return "Data saved locally. " + result.message;
          } else {
            throw new Error(result.message || "Form submission failed");
          }
        },
        error: (error) => {
          console.error(
            "Form submission failed:",
            error instanceof Error ? error.message : "Unknown error occurred."
          );
          return error instanceof Error
            ? error.message
            : "Unknown error occurred";
        },
        finally: () => {
          setIsSubmitting(false);
        },
      }
    );
  }

  function resetForm() {
    form.reset(initialFormData);
  }

  function handleExport() {
    if (storedSubmissions.length === 0) {
      toast.error("No data to export");
      return;
    }

    updateQRColours();
    setSelectedSubmissions(storedSubmissions.map((_, index) => index));
    setShowExportModal(true);
  }

  function handleMethodChange(method: "qrcode" | "clipboard" | "json") {
    setExportMethod(method);
  }

  function handleSelection(index: number) {
    setSelectedSubmissions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }

  function handleSelectAll() {
    if (selectedSubmissions.length === storedSubmissions.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(storedSubmissions.map((_, index) => index));
    }
  }

  function handleClear() {
    setShowClearDataDialog(true);
  }

  function confirmClear() {
    localStorage.removeItem("formSubmissions");
    setStoredSubmissions([]);
    setShowClearDataDialog(false);
    toast.success("All stored submissions cleared");
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
    const MAX_QR_SIZE = 2953;

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
        a.download = `scouting-data-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("JSON file downloaded");
        break;
    }

    setShowExportModal(false);
  }

  function renderCycleFields(fieldName: string) {
    let section: "autonomous" | "teleop" | "misc";
    if (fieldName === "Autonomous Cycles") {
      section = "autonomous";
    } else if (fieldName === "Teleop Cycles") {
      section = "teleop";
    } else {
      section = "misc";
    }

    return (
      <>
        <h4 className="text-sm font-semibold">Coral</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4">
          <CycleField
            name={`${fieldName}.Coral Level 1`}
            label="Level 1"
            section={section}
          />
          <CycleField
            name={`${fieldName}.Coral Level 2`}
            label="Level 2"
            section={section}
          />
          <CycleField
            name={`${fieldName}.Coral Level 3`}
            label="Level 3"
            section={section}
          />
          <CycleField
            name={`${fieldName}.Coral Level 4`}
            label="Level 4"
            section={section}
          />
        </div>
        <h4 className="text-sm font-semibold mt-4">Algae</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
          <CycleField
            name={`${fieldName}.Algae Processor`}
            label="Processor"
            section={section}
          />
          <CycleField
            name={`${fieldName}.Algae Net`}
            label="Net"
            section={section}
          />
          <StopwatchField
            name={`${fieldName}.Cycle Times`}
            label="Cycle Times"
            section={section}
          />
        </div>
      </>
    );
  }

  function renderField(field: TField) {
    switch (field.type) {
      case "input":
        return (
          <InputField
            type={field.schema instanceof z.ZodNumber ? "number" : "text"}
            name={field.name}
            label={field.name}
            placeholder={`Enter ${field.name.toLowerCase()}`}
          />
        );
      case "cycles":
        return renderCycleFields(field.name);
      case "stopwatch":
        return (
          <StopwatchField
            name={field.name}
            label={field.name}
            section={activeTab as "autonomous" | "teleop" | "misc"}
          />
        );
      default:
        if (Array.isArray(field.type)) {
          return (
            <DropdownField
              name={field.name}
              label={field.name}
              placeholder={
                field.schema instanceof z.ZodEnum &&
                field.schema._def.values.join() === "Yes,No"
                  ? `Select ${field.name.toLowerCase()} status`
                  : `Select ${field.name.toLowerCase()}`
              }
              options={field.type}
            />
          );
        }
        return null;
    }
  }

  function renderFields(fields: TField[]) {
    const regularFields = fields.filter((field) => field.type !== "cycles");
    const cycleFields = fields.filter((field) => field.type === "cycles");

    return (
      <div className="space-y-6">
        {regularFields.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularFields.map((field) => (
              <div key={field.name}>{renderField(field)}</div>
            ))}
          </div>
        )}
        {cycleFields.length > 0 && (
          <div className="space-y-6">
            {cycleFields.map((field) => (
              <div key={field.name}>{renderField(field)}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function handleConfigSave() {
    try {
      localStorage.setItem("spreadsheetID", spreadsheetID);
      localStorage.setItem("sheetID", sheetID);
      const parsedData = JSONInput ? JSON.parse(JSONInput) : null;
      setTeams(parsedData);
      localStorage.setItem("teams", JSON.stringify(parsedData));
      setShowSpreadsheetIDDialog(false);
      setJSONInput("");
    } catch (error) {
      console.error(error);
    }
  }

  function handleFileDrop(files: File[]) {
    const file = files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const content = e.target?.result as string;
        setJSONInput(content);
      };
      reader.readAsText(file);
    }
  }

  function formatJSON() {
    try {
      const parsedJSON = JSON.parse(JSONInput);
      const formattedJSON = JSON.stringify(parsedJSON, null, 2);
      setJSONInput(formattedJSON);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="block">
            <Tabs
              defaultValue="autonomous"
              className="w-full mb-4"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="autonomous">Autonomous</TabsTrigger>
                <TabsTrigger value="teleop">Teleop</TabsTrigger>
                <TabsTrigger value="misc">Misc</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="mt-4 space-y-4">
            {activeTab === "autonomous" && renderFields(autonomous)}
            {activeTab === "teleop" && renderFields(teleop)}
            {activeTab === "misc" && renderFields(misc)}
            <NotesField name="Extra Notes" label="Extra Notes" />
          </div>
          <div className="flex justify-between mt-8">
            <div className="flex space-x-4">
              <Button
                type="button"
                onClick={() => setShowSpreadsheetIDDialog(true)}
                size="icon"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleExport}
                size="icon"
                disabled={storedSubmissions.length === 0}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                size="icon"
                disabled={storedSubmissions.length === 0}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
              <Button type="reset" variant="outline" onClick={resetForm}>
                Reset Form
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Stored submissions: {storedSubmissions.length}
              </span>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
      <Dialog
        open={showSpreadsheetIDDialog}
        onOpenChange={setShowSpreadsheetIDDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Form Configuration</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid items-center gap-4">
              <Label className="w-full">Spreadsheet ID</Label>
              <Input
                value={spreadsheetID}
                onChange={(e) => setSpreadsheetID(e.target.value)}
                placeholder="Enter Spreadsheet ID (from Sheet URL)"
              />
            </div>
            <div className="grid items-center gap-4">
              <Label className="w-full">Sheet ID</Label>
              <Input
                value={sheetID}
                onChange={(e) => setSheetID(e.target.value)}
                placeholder="Enter Sheet ID"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="col-span-4">Teams</Label>
              <Textarea
                value={JSONInput}
                onChange={(e) => setJSONInput(e.target.value)}
                className="col-span-4"
                rows={4}
                placeholder='{"teamNumber":"teamName","11146":"Barker Redbacks",...}'
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="col-span-4">Upload JSON</Label>
              <Dropzone
                onDrop={handleFileDrop}
                accept={{ "application/json": [".json"] }}
              />
            </div>
          </div>
          <div className="flex justify-between">
            <Button onClick={formatJSON} variant="outline">
              <FileTextIcon className="mr-2 h-4 w-4" />
              Format JSON
            </Button>
            <Button onClick={handleConfigSave}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
            <DialogDescription>
              Scan to access {storedSubmissions.length} form submission
              {storedSubmissions.length !== 1 ? "s" : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-6">
            <QRCodeSVG
              value={QRCodeData}
              bgColor={QRBgColour}
              fgColor={QRFgColour}
              size={256}
              level="M"
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setShowQRModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={showClearDataDialog}
        onOpenChange={setShowClearDataDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Submissions</AlertDialogTitle>
            <AlertDialogDescription className="tracking-wide font-sans">
              Are you sure you want to clear all {storedSubmissions.length}{" "}
              stored submission
              {storedSubmissions.length !== 1 ? "s" : ""}? This action cannot be
              undone.
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
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
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
            <Button variant="outline" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button onClick={exportData}>Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
