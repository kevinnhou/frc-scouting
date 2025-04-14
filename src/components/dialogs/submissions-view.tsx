/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */

"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { autonomous, misc, teleop } from "@/lib/match-scouting";
import { SubmissionDetails } from "~/dialogs/submission-details";
import { SubmissionsList } from "~/dialogs/submission-lists";
import { Dialog, DialogContent } from "~/ui/dialog";

interface ViewSubmissionsProps {
  loadForm: (data: any) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  setStoredSubmissions: (submissions: any[]) => void;
  storedSubmissions: any[];
}

export function getFieldOptions(fieldPath: string) {
  const allFields = [...autonomous, ...teleop, ...misc];
  const field = allFields.find((f) => f.name === fieldPath);

  if (field && Array.isArray(field.type)) {
    return field.type;
  }

  return null;
}

export function getSchema(fieldPath: string) {
  const allFields = [...autonomous, ...teleop, ...misc];

  const parts = fieldPath.split(".");

  if (parts.length === 1) {
    const field = allFields.find((f) => f.name === fieldPath);
    return field?.schema;
  }

  const parentField = allFields.find((f) => f.name === parts[0]);

  if (!parentField) return null;

  if (parts[0] === "Autonomous Cycles" || parts[0] === "Teleop Cycles") {
    if (parts[1] === "Cycle Times") {
      return z.array(z.number().positive().multipleOf(0.01));
    }

    return z.number().int().min(0);
  }
  if (parts[0] === "Extra Notes") {
    if (parts[1] === "text") {
      return z.string();
    }
    if (parts[1] === "tags") {
      return z.array(z.string());
    }
  } else if (parts[0] === "Cage Time") {
    return z.array(z.number().positive().multipleOf(0.01));
  }

  return null;
}

export function validateValue(
  fieldPath: string,
  value: any,
): { error?: string; valid: boolean } {
  const schema = getSchema(fieldPath);

  if (!schema) {
    return { valid: true };
  }

  try {
    let parsedValue = value;

    if (typeof value === "string") {
      if (schema instanceof z.ZodNumber) {
        parsedValue = Number(value);
      } else if (schema instanceof z.ZodArray) {
        try {
          parsedValue = JSON.parse(value);
        } catch (error) {
          console.error(error);
          return { error: "Invalid array format", valid: false };
        }
      } else if (schema instanceof z.ZodEnum) {
        const enumValues = (schema as any)._def.values;
        if (!enumValues.includes(value)) {
          return {
            error: `Value must be one of: ${enumValues.join(", ")}`,
            valid: false,
          };
        }
      } else if (schema instanceof z.ZodBoolean) {
        parsedValue = value === "true";
      }
    }

    schema.parse(parsedValue);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors.map((e) => e.message).join(", "),
        valid: false,
      };
    }
    return { error: "Invalid value", valid: false };
  }
}

export function ViewSubmissions({
  loadForm,
  onOpenChange,
  open,
  setStoredSubmissions,
  storedSubmissions,
}: ViewSubmissionsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [submissionIndex, setSubmissionIndex] = useState<null | number>(null);
  const [detailView, setDetailView] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [editingRow, setEditingRow] = useState<null | string>(null);
  const [editValue, setEditValue] = useState<any>(null);
  const [validationError, setValidationError] = useState<null | string>(null);
  const [sortColumn, setSortColumn] = useState<null | string>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  const filteredSubmissions = useMemo(() => {
    return storedSubmissions.filter((submission) => {
      const teamNumber = String(submission["Team Number"]).substring(0, 5);
      const teamName = String(submission["Team Name"] || "");
      const matchNumber = String(submission["Qualification Number"]).substring(
        0,
        3,
      );

      return (
        teamNumber.includes(searchTerm) ||
        teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        matchNumber.includes(searchTerm)
      );
    });
  }, [storedSubmissions, searchTerm]);

  useEffect(() => {
    if (submissionIndex !== null && detailView) {
      const submission = storedSubmissions[submissionIndex];
      const flattenedData = flattenObject(submission);

      const dataArray = Object.entries(flattenedData).map(([key, value]) => ({
        id: key,
        metric: key,
        value: Array.isArray(value)
          ? JSON.stringify(value)
          : String(value !== undefined && value !== null ? value : ""),
      }));

      setTableData(dataArray);
      setVisibleColumns(["metric", "value"]);
    }
  }, [submissionIndex, detailView, storedSubmissions]);

  function handleSelection(index: number) {
    const actualIndex = filteredSubmissions.indexOf(filteredSubmissions[index]);
    setSubmissionIndex(actualIndex);
    setDetailView(true);
    setFilterValue("");
  }

  function handleFormLoad(index: number) {
    const actualIndex = filteredSubmissions.indexOf(filteredSubmissions[index]);
    loadForm(storedSubmissions[actualIndex]);
    onOpenChange(false);
    toast.info("Submission loaded for editing");
  }

  function handleBack() {
    setDetailView(false);
    setSubmissionIndex(null);
    setValidationError(null);
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-4xl">
        {!detailView ? (
          <SubmissionsList
            filteredSubmissions={filteredSubmissions}
            handleFormLoad={handleFormLoad}
            handleSelection={handleSelection}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        ) : (
          <SubmissionDetails
            editingRow={editingRow}
            editValue={editValue}
            filterValue={filterValue}
            handleBack={handleBack}
            setEditingRow={setEditingRow}
            setEditValue={setEditValue}
            setFilterValue={setFilterValue}
            setSortColumn={setSortColumn}
            setSortDirection={setSortDirection}
            setStoredSubmissions={setStoredSubmissions}
            setValidationError={setValidationError}
            setVisibleColumns={setVisibleColumns}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            storedSubmissions={storedSubmissions}
            submissionIndex={submissionIndex!}
            tableData={tableData}
            validationError={validationError}
            visibleColumns={visibleColumns}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function flattenObject(obj: any, prefix = "") {
  return Object.keys(obj).reduce((acc: any, k) => {
    const pre = prefix.length ? `${prefix}.` : "";
    if (
      typeof obj[k] === "object" &&
      obj[k] !== null &&
      !Array.isArray(obj[k])
    ) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
}
