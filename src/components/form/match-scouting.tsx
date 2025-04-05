/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Settings, Trash2, Upload } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { CycleField } from "./cycle-field";
import { DropdownField } from "./dropdown-field";
import { InputField } from "./input-field";
import { MissedField } from "./missed-field";
import { NotesField } from "./notes-field";
import { StopwatchField } from "./stopwatch-field";

import { submit } from "@/app/actions/submit";
import { ClearData } from "@/components/dialogs/clear-data";
import { Config } from "@/components/dialogs/config";
import { ExportData } from "@/components/dialogs/export-data";
import { QRCode } from "@/components/dialogs/qrcode";
import { ViewSubmissions } from "@/components/dialogs/view-submissions";
import { autonomous, misc, teleop } from "@/lib/match-scouting";
import { Button } from "~/button";
import { Form } from "~/form";
import { Tabs } from "~/tabs";

const formSchema = z.object({
  ...Object.fromEntries(autonomous.map((field) => [field.name, field.schema])),
  ...Object.fromEntries(teleop.map((field) => [field.name, field.schema])),
  ...Object.fromEntries(misc.map((field) => [field.name, field.schema])),
});

type FormData = z.infer<typeof formSchema>;

interface TField {
  name: string;
  schema: z.ZodTypeAny;
  type: string | string[];
}

const initialFormData: Partial<FormData> = {
  "Autonomous Cycles": {
    "Algae Net": 0,
    "Algae Processor": 0,
    "Coral Level 1": 0,
    "Coral Level 2": 0,
    "Coral Level 3": 0,
    "Coral Level 4": 0,
    "Cycle Times": [],
  },
  "Autonomous Missed": {
    Coral: 0,
    Processor: 0,
    Net: 0,
  },
  "Cage Level": undefined,
  "Cage Time": [],
  Defense: undefined,
  "Drive Team Ability": "",
  "Extra Notes": { tags: [], text: "" },
  Penalties: undefined,
  Preload: undefined,
  "Qualification Number": 0,
  Route: "",
  "Scoring Behind Reef": undefined,
  "Starting Position": undefined,
  "Team Name": "",
  "Team Number": 0,
  "Teleop Cycles": {
    "Algae Net": 0,
    "Algae Processor": 0,
    "Coral Level 1": 0,
    "Coral Level 2": 0,
    "Coral Level 3": 0,
    "Coral Level 4": 0,
    "Cycle Times": [],
  },
  "Teleop Missed": {
    Coral: 0,
    Processor: 0,
    Net: 0,
  },
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
    "clipboard" | "json" | "qrcode"
  >("qrcode");
  const [showViewSubmissionsDialog, setShowViewSubmissionsDialog] =
    useState(false);

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
    defaultValues: initialFormData,
    mode: "onSubmit",
    resolver: zodResolver(formSchema),
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
    "autonomous" | "misc" | "teleop" | string
  >("autonomous");

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const stopwatches = window.stopwatchRegistry?.[activeTab] || [];
      const cycleFields = window.cycleRegistry?.[activeTab] || {};
      const missedFields = window.missedRegistry?.[activeTab] || {};

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
          case "r":
          case "R":
            stopwatches.forEach((stopwatch) => {
              stopwatch.reset();
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
      } else if ((e.key === "1" || e.key === "!") && e.shiftKey) {
        if (missedFields.Coral) {
          missedFields.Coral();
        }
      } else if ((e.key === "2" || e.key === "@") && e.shiftKey) {
        if (missedFields.Processor) {
          missedFields.Processor();
        }
      } else if ((e.key === "3" || e.key === "#") && e.shiftKey) {
        if (missedFields.Net) {
          missedFields.Net();
        }
      }
    },
    [activeTab, form],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

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
        sheetID,
        spreadsheetID,
      }),
      {
        error: (error) => {
          console.error(
            "Form submission failed:",
            error instanceof Error ? error.message : "Unknown error occurred.",
          );
          return error instanceof Error
            ? error.message
            : "Unknown error occurred";
        },
        finally: () => {
          setIsSubmitting(false);
        },
        loading: "Submitting form...",
        success: (result) => {
          if (result.success) {
            resetForm();
            return "Form submitted successfully";
          }
          if (result.localSuccess) {
            resetForm();
            return `Data saved locally. ${result.message}`;
          }

          throw new Error(result.message || "Form submission failed");
        },
      },
    );
  }

  function onError(errors: any) {
    const errorMessages = Object.entries(errors).map(
      ([field, error]: [string, any]) => {
        return `${field}: ${error.message}`;
      },
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
      </div>,
    );

    const errorFields = Object.keys(errors);

    const autonomousFields = autonomous.map((field) => field.name);
    const teleopFields = teleop.map((field) => field.name);
    const miscFields = misc.map((field) => field.name);

    const autonomousErrors = errorFields.some((field) =>
      autonomousFields.includes(field),
    );
    const teleopErrors = errorFields.some((field) =>
      teleopFields.includes(field),
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
    let section: "autonomous" | "misc" | "teleop";
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
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 lg:grid-cols-4">
          <CycleField
            label="Level 1"
            name={`${fieldName}.Coral Level 1`}
            section={section}
          />
          <CycleField
            label="Level 2"
            name={`${fieldName}.Coral Level 2`}
            section={section}
          />
          <CycleField
            label="Level 3"
            name={`${fieldName}.Coral Level 3`}
            section={section}
          />
          <CycleField
            label="Level 4"
            name={`${fieldName}.Coral Level 4`}
            section={section}
          />
        </div>
        <h4 className="mt-4 text-sm font-semibold">Algae</h4>
        <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
          <CycleField
            label="Processor"
            name={`${fieldName}.Algae Processor`}
            section={section}
          />
          <CycleField
            label="Net"
            name={`${fieldName}.Algae Net`}
            section={section}
          />
          <StopwatchField
            label="Cycle Times"
            name={`${fieldName}.Cycle Times`}
            section={section}
          />
        </div>
      </>
    );
  }

  function renderMissedFields(fieldName: string) {
    let section: "autonomous" | "misc" | "teleop";
    if (fieldName === "Autonomous Missed") {
      section = "autonomous";
    } else if (fieldName === "Teleop Missed") {
      section = "teleop";
    } else {
      section = "misc";
    }

    return (
      <div className="mt-6">
        <h4 className="text-sm font-semibold">Missed</h4>
        <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
          <MissedField
            label="Coral"
            name={`${fieldName}.Coral`}
            section={section}
          />
          <MissedField
            label="Processor"
            name={`${fieldName}.Processor`}
            section={section}
          />
          <MissedField
            label="Net"
            name={`${fieldName}.Net`}
            section={section}
          />
        </div>
      </div>
    );
  }

  function renderField(field: TField) {
    switch (field.type) {
      case "cycles":
        return renderCycleFields(field.name);
      case "missed":
        return renderMissedFields(field.name);
      case "input":
        return (
          <InputField
            label={field.name}
            name={field.name}
            placeholder={`Enter ${field.name.toLowerCase()}`}
            type={field.schema instanceof z.ZodNumber ? "number" : "text"}
          />
        );
      case "stopwatch":
        return (
          <StopwatchField
            label={field.name}
            name={field.name}
            section={activeTab as "autonomous" | "misc" | "teleop"}
          />
        );
      default:
        if (Array.isArray(field.type)) {
          return (
            <DropdownField
              label={field.name}
              name={field.name}
              options={field.type}
              placeholder={
                field.schema instanceof z.ZodEnum &&
                field.schema._def.values.join() === "Yes,No"
                  ? `Select ${field.name.toLowerCase()} status`
                  : `Select ${field.name.toLowerCase()}`
              }
            />
          );
        }
        return null;
    }
  }

  function renderFields(fields: TField[]) {
    const regularFields = fields.filter(
      (field) => field.type !== "cycles" && field.type !== "missed",
    );
    const cycleFields = fields.filter((field) => field.type === "cycles");
    const missedFields = fields.filter((field) => field.type === "missed");

    return (
      <div className="space-y-6">
        {regularFields.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        {missedFields.length > 0 && (
          <div className="space-y-6">
            {missedFields.map((field) => (
              <div key={field.name}>{renderField(field)}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const loadForm = useCallback(
    (data: FormData) => {
      form.reset(data);
    },
    [form],
  );

  return (
    <>
      <Form {...form}>
        <form
          className="container mx-auto mt-10 space-y-8 px-4 sm:px-6 lg:px-8"
          onSubmit={form.handleSubmit(onSubmit, onError)}
        >
          <div className="block">
            <Tabs
              tabs={[
                { id: "autonomous", label: "Autonomous" },
                { id: "teleop", label: "Teleop" },
                { id: "misc", label: "Misc" },
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
          <div className="mt-4 space-y-4">
            {activeTab === "autonomous" && renderFields(autonomous)}
            {activeTab === "teleop" && renderFields(teleop)}
            {activeTab === "misc" && renderFields(misc)}
            <NotesField label="Extra Notes" name="Extra Notes" />
          </div>
          <div className="flex flex-col justify-between gap-y-4 pb-8 lg:flex-row">
            <div className="flex w-full items-center justify-between lg:justify-start lg:space-x-4">
              <Button
                onClick={() => setShowSpreadsheetIDDialog(true)}
                size="icon"
                type="button"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                disabled={storedSubmissions.length === 0}
                onClick={handleExport}
                size="icon"
                type="button"
                variant="outline"
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                disabled={storedSubmissions.length === 0}
                onClick={handleClear}
                size="icon"
                type="button"
                variant="outline"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
              <Button onClick={resetForm} type="reset" variant="outline">
                Reset Form
              </Button>
            </div>
            <div className="flex items-center justify-between space-x-4 lg:justify-end">
              <Button
                className="flex items-center gap-2"
                onClick={() => setShowViewSubmissionsDialog(true)}
                type="button"
                variant="outline"
              >
                <span>Stored submissions: {storedSubmissions.length}</span>
              </Button>
              <Button disabled={isSubmitting} type="submit">
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
        JSONInput={JSONInput}
        onOpenChange={setShowSpreadsheetIDDialog}
        open={showSpreadsheetIDDialog}
        setJSONInput={setJSONInput}
        setSheetID={setSheetID}
        setSpreadsheetID={setSpreadsheetID}
        setTeams={setTeams}
        sheetID={sheetID}
        spreadsheetID={spreadsheetID}
      />
      <ExportData
        exportMethod={exportMethod}
        onOpenChange={setShowExportModal}
        open={showExportModal}
        selectedSubmissions={selectedSubmissions}
        setExportMethod={setExportMethod}
        setQRCodeData={setQRCodeData}
        setSelectedSubmissions={setSelectedSubmissions}
        setShowQRModal={setShowQRModal}
        storedSubmissions={storedSubmissions}
      />
      <QRCode
        onOpenChange={setShowQRModal}
        open={showQRModal}
        QRBgColour={QRBgColour}
        QRCodeData={QRCodeData}
        QRFgColour={QRFgColour}
        submissionsCount={storedSubmissions.length}
      />
      <ClearData
        onOpenChange={setShowClearDataDialog}
        open={showClearDataDialog}
        setStoredSubmissions={setStoredSubmissions}
        submissionsCount={storedSubmissions.length}
      />
      <ViewSubmissions
        loadForm={loadForm}
        onOpenChange={setShowViewSubmissionsDialog}
        open={showViewSubmissionsDialog}
        setStoredSubmissions={setStoredSubmissions}
        storedSubmissions={storedSubmissions}
      />
    </>
  );
}
