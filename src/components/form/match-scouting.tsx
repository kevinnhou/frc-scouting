/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useCallback, useState } from "react";
import { usePathname } from "next/navigation";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { autonomous, teleop, misc } from "@/lib/match-scouting";
import { submit } from "@/app/actions/submit";

import { AlertCircle, Settings, Trash2, Upload } from "lucide-react";

import { Button } from "~/button";
import { Form } from "~/form";
import { Tabs, TabsList, TabsTrigger } from "~/tabs";

import { CycleField } from "./cycle-field";
import { DropdownField } from "./dropdown-field";
import { InputField } from "./input-field";
import { NotesField } from "./notes-field";
import { StopwatchField } from "./stopwatch-field";

import { Config } from "@/components/dialogs/config";
import { ClearData } from "@/components/dialogs/clear-data";
import { ExportData } from "@/components/dialogs/export-data";
import { QRCode } from "@/components/dialogs/qrcode";

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

export function MatchScoutingForm() {
  const pathname = usePathname();
  const [networkOffline, setNetworkOffline] = useState(false);
  const isOffline = pathname?.includes("~offline") || networkOffline;

  useEffect(() => {
    setNetworkOffline(!navigator.onLine);

    const handleOnline = () => setNetworkOffline(false);
    const handleOffline = () => setNetworkOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const [showSpreadsheetIDDialog, setShowSpreadsheetIDDialog] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showClearDataDialog, setShowClearDataDialog] = useState(false);
  const [spreadsheetID, setSpreadsheetID] = useState("");
  const [sheetID, setSheetID] = useState("");
  const [teams, setTeams] = useState<Record<string, string>>({});
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
    mode: "onSubmit",
  });

  useEffect(() => {
    const teamNumber = form.watch("Team Number");
    if (teamNumber && teams && Object.keys(teams).length > 0) {
      const teamName = teams[teamNumber.toString()];
      if (teamName) {
        form.setValue("Team Name", teamName);
        toast.info(`Team found: ${teamName}`);
      } else {
        form.setValue("Team Name", "");
      }
    }
  }, [form, teams, form.watch("Team Number")]);

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

    if (isOffline) {
      toast.success("Data saved locally");
      resetForm();
      return;
    }

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

  function onError(errors: any) {
    const errorMessages = Object.entries(errors).map(
      ([field, error]: [string, any]) => {
        return `${field}: ${error.message}`;
      }
    );

    toast.error(
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium">Missing required fields</span>
        </div>
        <ul className="list-disc pl-5 text-sm">
          {errorMessages.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      </div>
    );

    const errorFields = Object.keys(errors);

    const autonomousFields = autonomous.map((field) => field.name);
    const teleopFields = teleop.map((field) => field.name);
    const miscFields = misc.map((field) => field.name);

    const autonomousErrors = errorFields.some((field) =>
      autonomousFields.includes(field)
    );
    const teleopErrors = errorFields.some((field) =>
      teleopFields.includes(field)
    );
    const miscErrors = errorFields.some((field) => miscFields.includes(field));

    if (autonomousErrors) {
      setActiveTab("autonomous");
    } else if (teleopErrors) {
      setActiveTab("teleop");
    } else if (miscErrors) {
      setActiveTab("misc");
    }
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

  function handleClear() {
    setShowClearDataDialog(true);
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

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className="space-y-8"
        >
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
          <div className="flex justify-between place-items-center pb-8">
            <div className="flex items-center space-x-4">
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
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground hidden md:block">
                Stored submissions: {storedSubmissions.length}
              </span>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Submitting..."
                  : isOffline
                    ? "Save Locally"
                    : "Submit"}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      <Config
        open={showSpreadsheetIDDialog}
        onOpenChange={setShowSpreadsheetIDDialog}
        spreadsheetID={spreadsheetID}
        setSpreadsheetID={setSpreadsheetID}
        sheetID={sheetID}
        setSheetID={setSheetID}
        JSONInput={JSONInput}
        setJSONInput={setJSONInput}
        setTeams={setTeams}
      />

      <ExportData
        open={showExportModal}
        onOpenChange={setShowExportModal}
        exportMethod={exportMethod}
        setExportMethod={setExportMethod}
        selectedSubmissions={selectedSubmissions}
        setSelectedSubmissions={setSelectedSubmissions}
        storedSubmissions={storedSubmissions}
        setQRCodeData={setQRCodeData}
        setShowQRModal={setShowQRModal}
      />

      <QRCode
        open={showQRModal}
        onOpenChange={setShowQRModal}
        QRCodeData={QRCodeData}
        QRBgColour={QRBgColour}
        QRFgColour={QRFgColour}
        submissionsCount={storedSubmissions.length}
      />

      <ClearData
        open={showClearDataDialog}
        onOpenChange={setShowClearDataDialog}
        submissionsCount={storedSubmissions.length}
        setStoredSubmissions={setStoredSubmissions}
      />
    </>
  );
}
