"use client";

import { FileTextIcon, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "~/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/ui/dialog";
import { Input } from "~/ui/input";
import { Label } from "~/ui/label";
import { Textarea } from "~/ui/textarea";

const spreadsheetIdSchema = z.string();
const sheetIdSchema = z.string();

const teamsSchema = z.record(z.string(), z.string());

interface FormConfigProps {
  JSONInput: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  setJSONInput: (input: string) => void;
  setSheetID: (id: string) => void;
  setSpreadsheetID: (id: string) => void;
  setTeams: (teams: Record<string, string>) => void;
  sheetID: string;
  spreadsheetID: string;
}

function Dropzone({
  accept,
  onDrop,
}: {
  accept: { [key: string]: string[] };
  onDrop: (acceptedFiles: File[]) => void;
}) {
  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept,
    onDrop,
  });

  return (
    <div
      {...getRootProps()}
      className="cursor-pointer rounded-md border border-dashed border-input p-4 text-center transition-colors hover:bg-accent/50"
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
      {isDragActive ? (
        <div className="text-sm font-medium">Drop your JSON file here...</div>
      ) : (
        <div className="text-sm font-medium">Upload a JSON file</div>
      )}
    </div>
  );
}

export function FormConfig({
  JSONInput,
  onOpenChange,
  open,
  setJSONInput,
  setSheetID,
  setSpreadsheetID,
  setTeams,
  sheetID,
  spreadsheetID,
}: FormConfigProps) {
  function parseJSON(json: string) {
    try {
      if (!json.trim()) {
        return { success: true, data: null };
      }

      const parsedData = JSON.parse(json);
      const result = teamsSchema.safeParse(parsedData);

      if (!result.success) {
        const errorMessage = result.error.errors
          .map((err) => `${err.path}: ${err.message}`)
          .join(", ");
        throw new Error(`Invalid team data format: ${errorMessage}`);
      }

      return { success: true, data: result.data };
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new TypeError("Invalid JSON syntax. Please check your input.");
      }
      throw error;
    }
  }

  function handleConfigSave() {
    try {
      const validSpreadsheetId = spreadsheetIdSchema.safeParse(spreadsheetID);
      const validSheetId = sheetIdSchema.safeParse(sheetID);

      if (!validSpreadsheetId.success) {
        toast.error(validSpreadsheetId.error.errors[0].message);
        return;
      }

      if (!validSheetId.success) {
        toast.error(validSheetId.error.errors[0].message);
        return;
      }

      localStorage.setItem("spreadsheetID", spreadsheetID);
      localStorage.setItem("sheetID", sheetID);

      const { data: newTeams } = parseJSON(JSONInput);

      if (!newTeams && !JSONInput.trim()) {
        onOpenChange(false);
        return;
      }

      let existingTeams = {};
      try {
        const existingData = localStorage.getItem("teams");
        if (existingData) {
          const parsedExisting = JSON.parse(existingData);
          const validExisting = teamsSchema.safeParse(parsedExisting);
          if (validExisting.success) {
            existingTeams = validExisting.data;
          } else {
            console.warn("Existing team data is invalid, starting fresh");
          }
        }
      } catch (e) {
        console.error("Error parsing existing team data:", e);
      }

      const mergedTeamData = newTeams
        ? { ...existingTeams, ...newTeams }
        : existingTeams;

      setTeams(mergedTeamData);
      localStorage.setItem("teams", JSON.stringify(mergedTeamData));

      onOpenChange(false);
      setJSONInput("");
      toast.success("Configuration saved successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save configuration",
      );
    }
  }

  function formatJSON() {
    try {
      if (!JSONInput.trim()) {
        toast.error("No JSON to format");
        return;
      }

      const { data } = parseJSON(JSONInput);
      if (data) {
        const formattedJSON = JSON.stringify(data, null, 2);
        setJSONInput(formattedJSON);
        toast.success("JSON formatted successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Invalid JSON format",
      );
    }
  }

  function handleFileDrop(files: File[]) {
    const file = files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const content = e.target?.result as string;
          parseJSON(content);
          setJSONInput(content);
          toast.success(`File "${file.name}" loaded successfully`);
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to parse file content",
          );
        }
      };
      reader.onerror = () => {
        toast.error("Failed to read file");
      };
      reader.readAsText(file);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-hidden p-0 sm:max-w-lg md:max-w-xl">
        <DialogHeader className="px-4 pt-5 sm:px-6">
          <DialogTitle>Form Configuration</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4 px-4 py-2 sm:px-6">
          <div className="grid gap-4">
            <div className="grid items-center gap-2">
              <Label className="text-sm font-medium">
                Spreadsheet ID or URL
              </Label>
              <Input
                onChange={(e) => {
                  const { value } = e.target;
                  if (value.includes("docs.google.com/spreadsheets/d/")) {
                    try {
                      const matches = value.match(/\/d\/([\w-]+)/);
                      if (matches && matches[1]) {
                        setSpreadsheetID(matches[1]);
                        toast.success("Extracted Spreadsheet ID from URL");
                      } else {
                        setSpreadsheetID(value);
                      }
                    } catch (error) {
                      console.error("Error extracting spreadsheet ID:", error);
                      setSpreadsheetID(value);
                    }
                  } else {
                    setSpreadsheetID(value);
                  }
                }}
                placeholder="Enter Spreadsheet ID or Google Sheets URL"
                value={spreadsheetID}
              />
            </div>
            <div className="grid items-center gap-2">
              <Label className="text-sm font-medium">Sheet ID</Label>
              <Input
                onChange={(e) => setSheetID(e.target.value)}
                placeholder="Enter Sheet ID"
                value={sheetID}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Teams</Label>
              <Textarea
                className="max-h-[200px] overflow-y-auto"
                onChange={(e) => setJSONInput(e.target.value)}
                placeholder='{"teamNumber":"teamName","11146":"Barker Redbacks",...}'
                rows={4}
                value={JSONInput}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Upload JSON</Label>
              <Dropzone
                accept={{ "application/json": [".json"] }}
                onDrop={handleFileDrop}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="border-t p-4 sm:px-6">
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button
              onClick={formatJSON}
              variant="outline"
              className="sm:w-auto"
            >
              <FileTextIcon className="mr-2 h-4 w-4" />
              Format JSON
            </Button>
            <Button onClick={handleConfigSave} className="sm:w-auto">
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
