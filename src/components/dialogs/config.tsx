"use client";

import { useDropzone } from "react-dropzone";

import { toast } from "sonner";

import { FileTextIcon, Upload } from "lucide-react";

import { Button } from "~/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/dialog";
import { Input } from "~/input";
import { Label } from "~/label";
import { Textarea } from "~/textarea";

type TConfigProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spreadsheetID: string;
  setSpreadsheetID: (id: string) => void;
  sheetID: string;
  setSheetID: (id: string) => void;
  JSONInput: string;
  setJSONInput: (input: string) => void;
  setTeams: (teams: Record<string, string>) => void;
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

export function Config({
  open,
  onOpenChange,
  spreadsheetID,
  setSpreadsheetID,
  sheetID,
  setSheetID,
  JSONInput,
  setJSONInput,
  setTeams,
}: TConfigProps) {
  function handleConfigSave() {
    try {
      localStorage.setItem("spreadsheetID", spreadsheetID);
      localStorage.setItem("sheetID", sheetID);
      const parsedData = JSONInput ? JSON.parse(JSONInput) : null;
      setTeams(parsedData);
      localStorage.setItem("teams", JSON.stringify(parsedData));
      onOpenChange(false);
      setJSONInput("");
      toast.success("Configuration saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save configuration");
    }
  }

  function formatJSON() {
    try {
      const parsedJSON = JSON.parse(JSONInput);
      const formattedJSON = JSON.stringify(parsedJSON, null, 2);
      setJSONInput(formattedJSON);
      toast.success("JSON formatted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Invalid JSON format");
    }
  }

  function handleFileDrop(files: File[]) {
    const file = files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const content = e.target?.result as string;
        setJSONInput(content);
        toast.success(`File "${file.name}" loaded successfully`);
      };
      reader.onerror = () => {
        toast.error("Failed to read file");
      };
      reader.readAsText(file);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
  );
}
