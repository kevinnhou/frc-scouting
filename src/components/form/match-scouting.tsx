"use client";

import { useState } from "react";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { autonomous, teleop, misc } from "@/lib/match-scouting";
import { submit } from "@/app/actions/submit";

import { Button } from "~/button";
import { Form } from "~/form";
import { Tabs, TabsList, TabsTrigger } from "~/tabs";

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
  "Scoring Behind Reef": undefined,
  "Cage Level": undefined,
  "Cage Time": [],
  Penalties: "No",
  "Drive Team Ability": "",
  Defense: "No",
  "Extra Notes": { text: "", tags: [] },
};

export function MatchScoutingForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialFormData,
  });

  const [activeTab, setActiveTab] = useState<"autonomous" | "teleop" | "misc">(
    "autonomous"
  );

  async function onSubmit(data: FormData) {
    try {
      const result = await submit(data);
      if (result.success) {
        console.log("Form submitted successfully.");
        resetForm();
      }
    } catch (error) {
      console.error(
        "Form submission failed:",
        error instanceof Error ? error.message : "Unknown error occurred."
      );
    }
  }

  function resetForm() {
    form.reset(initialFormData);
  }

  function renderCycleFields(fieldName: string) {
    return (
      <div className="space-y-6">
        <>
          <h4 className="text-sm font-semibold mb-4">Coral</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <CycleField name={`${fieldName}.Coral Level 1`} label="Level 1" />
            <CycleField name={`${fieldName}.Coral Level 2`} label="Level 2" />
            <CycleField name={`${fieldName}.Coral Level 3`} label="Level 3" />
            <CycleField name={`${fieldName}.Coral Level 4`} label="Level 4" />
          </div>
        </>
        <>
          <h4 className="text-sm font-semibold mb-4">Algae</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CycleField
              name={`${fieldName}.Algae Processor`}
              label="Processor"
            />
            <CycleField name={`${fieldName}.Algae Net`} label="Net" />
            <StopwatchField
              name={`${fieldName}.Cycle Times`}
              label="Cycle Times"
            />
          </div>
        </>
      </div>
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
        return <StopwatchField name={field.name} label={field.name} />;
      case "notes":
        return <NotesField name={field.name} label={field.name} />;
      default:
        if (Array.isArray(field.type)) {
          return (
            <DropdownField
              name={field.name}
              label={field.name}
              placeholder={`Select ${field.name.toLowerCase()}`}
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
      <div className="space-y-8">
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="hidden md:block">
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
        <div className="mt-4">
          {activeTab === "autonomous" && renderFields(autonomous)}
          {activeTab === "teleop" && renderFields(teleop)}
          {activeTab === "misc" && renderFields(misc)}
        </div>
        <div className="flex justify-between mt-8">
          <Button type="button" variant="outline" onClick={resetForm}>
            Reset Form
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
}
