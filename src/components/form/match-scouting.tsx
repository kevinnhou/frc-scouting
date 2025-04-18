/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
/* eslint-disable react-web-api/no-leaked-event-listener */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { CycleField } from "./cycle";
import { DropdownField } from "./dropdown";
import { InputField } from "./input";
import { MissedField } from "./missed";
import { NotesField } from "./notes";
import { StopwatchField } from "./stopwatch";

import { submit } from "@/app/actions/submit";
import { autonomous, misc, teleop } from "@/lib/match-scouting";
import { FieldDialog } from "~/dialogs/field-view";
import { Button } from "~/ui/button";
import { Form } from "~/ui/form";
import { ReleaseButton } from "~/ui/release-button";
import { Tabs } from "~/ui/tabs";

const formSchema = z.object({
  ...Object.fromEntries(autonomous.map((field) => [field.name, field.schema])),
  ...Object.fromEntries(teleop.map((field) => [field.name, field.schema])),
  ...Object.fromEntries(misc.map((field) => [field.name, field.schema])),
});

type FormData = z.infer<typeof formSchema>;

interface Field {
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line ts/no-unused-vars
  const [storedSubmissions, setStoredSubmissions] = useState<FormData[]>([]);

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

  const form = useForm<FormData>({
    defaultValues: initialFormData,
    mode: "onSubmit",
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    loadSubmissions();

    function handleStorage(event: StorageEvent) {
      if (event.key === "formSubmissions") {
        loadSubmissions();
      }
    }

    function handleLoadData(event: CustomEvent) {
      form.reset(event.detail);
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener("loadFormData", handleLoadData as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "loadFormData",
        handleLoadData as EventListener,
      );
    };
  }, [loadSubmissions, form]);

  useEffect(() => {
    const teamNumber = form.watch("Team Number");
    if (teamNumber) {
      try {
        const teamsData = localStorage.getItem("teams");
        if (teamsData) {
          const teams = JSON.parse(teamsData);
          if (teams && Object.keys(teams).length > 0) {
            const teamName = teams[teamNumber.toString()];
            if (teamName) {
              form.setValue("Team Name", teamName);
              toast.info(`Team found: ${teamName}`);
            } else {
              form.setValue("Team Name", "");
            }
          }
        }
      } catch (error) {
        console.error("Error parsing teams data:", error);
      }
    }
  }, [form, form.watch("Team Number")]);

  const [activeTab, setActiveTab] = useState<
    "autonomous" | "misc" | "teleop" | string
  >("autonomous");

  useEffect(() => {
    const event = new CustomEvent("tabChange", { detail: activeTab });
    window.dispatchEvent(event);
  }, [activeTab]);

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
    [activeTab],
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

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "formSubmissions",
        newValue: JSON.stringify(updatedSubmissions),
      }),
    );

    if (isOffline) {
      toast.success("Data saved locally");
      resetForm();
      return;
    }

    setIsSubmitting(true);

    toast.promise(
      submit({
        ...data,
        sheetID: localStorage.getItem("sheetID") || "",
        spreadsheetID: localStorage.getItem("spreadsheetID") || "",
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

  function renderField(field: Field) {
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

  function renderFields(fields: Field[]) {
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

  return (
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
        <div className="flex justify-end gap-y-4 pb-8 xl:justify-between">
          <div className="hidden w-full items-center xl:flex">
            <FieldDialog />
          </div>
          <div className="flex items-center justify-between space-x-4">
            <ReleaseButton
              onClick={resetForm}
              type="reset"
              aria-label="Reset form"
            >
              Reset Form
            </ReleaseButton>
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
  );
}
