/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect, useMemo } from "react";

import { toast } from "sonner";
import { z } from "zod";

import { autonomous, teleop, misc } from "@/lib/match-scouting";

import { Dialog, DialogContent } from "~/dialog";
import { SubmissionsList } from "@/components/dialogs/submission-lists";
import { SubmissionDetails } from "@/components/dialogs/submission-details";

type TViewSubmissionsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storedSubmissions: any[];
  setStoredSubmissions: (submissions: any[]) => void;
  loadForm: (data: any) => void;
};

export function ViewSubmissions({
  open,
  onOpenChange,
  storedSubmissions,
  setStoredSubmissions,
  loadForm,
}: TViewSubmissionsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [submissionIndex, setSubmissionIndex] = useState<number | null>(null);
  const [detailView, setDetailView] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  const filteredSubmissions = useMemo(() => {
    return storedSubmissions.filter((submission) => {
      const teamNumber = String(submission["Team Number"]).substring(0, 5);
      const teamName = String(submission["Team Name"] || "");
      const matchNumber = String(submission["Qualification Number"]).substring(
        0,
        3
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {!detailView ? (
          <SubmissionsList
            filteredSubmissions={filteredSubmissions}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleSelection={handleSelection}
            handleFormLoad={handleFormLoad}
          />
        ) : (
          <SubmissionDetails
            storedSubmissions={storedSubmissions}
            setStoredSubmissions={setStoredSubmissions}
            submissionIndex={submissionIndex!}
            handleBack={handleBack}
            tableData={tableData}
            filterValue={filterValue}
            setFilterValue={setFilterValue}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
            sortColumn={sortColumn}
            setSortColumn={setSortColumn}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            editingRow={editingRow}
            setEditingRow={setEditingRow}
            editValue={editValue}
            setEditValue={setEditValue}
            validationError={validationError}
            setValidationError={setValidationError}
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

export function getSchema(fieldPath: string) {
  const allFields = [...autonomous, ...teleop, ...misc];

  const parts = fieldPath.split(".");

  if (parts.length === 1) {
    const field = allFields.find((f) => f.name === fieldPath);
    return field?.schema;
  } else {
    const parentField = allFields.find((f) => f.name === parts[0]);

    if (!parentField) return null;

    if (parts[0] === "Autonomous Cycles" || parts[0] === "Teleop Cycles") {
      if (parts[1] === "Cycle Times") {
        return z.array(z.number().positive().multipleOf(0.01));
      } else {
        return z.number().int().min(0);
      }
    } else if (parts[0] === "Extra Notes") {
      if (parts[1] === "text") {
        return z.string();
      } else if (parts[1] === "tags") {
        return z.array(z.string());
      }
    } else if (parts[0] === "Cage Time") {
      return z.array(z.number().positive().multipleOf(0.01));
    }
  }

  return null;
}

export function validateValue(
  fieldPath: string,
  value: any
): { valid: boolean; error?: string } {
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
          return { valid: false, error: "Invalid array format" };
        }
      } else if (schema instanceof z.ZodEnum) {
        const enumValues = (schema as any)._def.values;
        if (!enumValues.includes(value)) {
          return {
            valid: false,
            error: `Value must be one of: ${enumValues.join(", ")}`,
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
        valid: false,
        error: error.errors.map((e) => e.message).join(", "),
      };
    }
    return { valid: false, error: "Invalid value" };
  }
}

export function getFieldOptions(fieldPath: string) {
  const allFields = [...autonomous, ...teleop, ...misc];
  const field = allFields.find((f) => f.name === fieldPath);

  if (field && Array.isArray(field.type)) {
    return field.type;
  }

  return null;
}
