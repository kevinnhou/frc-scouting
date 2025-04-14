"use client";

import { FileTextIcon, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "~/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/ui/dialog";
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
      className="col-span-4 cursor-pointer rounded-md border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:border-gray-400"
    >
      <input {...getInputProps()} />
      <Upload className="mt-2 mb-6 h-8 w-8 place-self-center text-gray-400" />
      {isDragActive ? (
        <div className="font-medium">Drop your JSON file here...</div>
      ) : (
        <div className="font-medium">Upload a JSON file</div>
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
      <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-[425px]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Form Configuration</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid gap-4 py-4">
            <div className="grid items-center gap-4">
              <Label className="w-full">Spreadsheet ID or URL</Label>
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
            <div className="grid items-center gap-4">
              <Label className="w-full">Sheet ID</Label>
              <Input
                onChange={(e) => setSheetID(e.target.value)}
                placeholder="Enter Sheet ID"
                value={sheetID}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="col-span-4">Teams</Label>
              <Textarea
                className="col-span-4 max-h-[200px] overflow-y-auto"
                onChange={(e) => setJSONInput(e.target.value)}
                placeholder='{"teamNumber":"teamName","11146":"Barker Redbacks",...}'
                rows={4}
                value={JSONInput}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="col-span-4">Upload JSON</Label>
              <Dropzone
                accept={{ "application/json": [".json"] }}
                onDrop={handleFileDrop}
              />
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-shrink-0 justify-between border-t pt-4">
          <Button onClick={formatJSON} variant="outline">
            <FileTextIcon className="mr-2 h-4 w-4" />
            Format JSON
          </Button>
          <Button onClick={handleConfigSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
