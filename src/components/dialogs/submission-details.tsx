/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";

import { toast } from "sonner";

import {
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  MoreHorizontal,
  Pencil,
  Save,
  Search,
  X,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "~/alert";
import { Button } from "~/button";
import { DialogDescription, DialogHeader, DialogTitle } from "~/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/dropdown-menu";
import { Input } from "~/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/table";
import {
  getFieldOptions,
  validateValue,
} from "@/components/dialogs/view-submissions";

type SubmissionDetailsProps = {
  storedSubmissions: any[];
  setStoredSubmissions: (submissions: any[]) => void;
  submissionIndex: number;
  handleBack: () => void;
  tableData: any[];
  filterValue: string;
  setFilterValue: (value: string) => void;
  visibleColumns: string[];
  setVisibleColumns: (columns: string[]) => void;
  sortColumn: string | null;
  setSortColumn: (column: string | null) => void;
  sortDirection: "asc" | "desc";
  setSortDirection: (direction: "asc" | "desc") => void;
  editingRow: string | null;
  setEditingRow: (row: string | null) => void;
  editValue: any;
  setEditValue: (value: any) => void;
  validationError: string | null;
  setValidationError: (error: string | null) => void;
};

export function SubmissionDetails({
  storedSubmissions,
  setStoredSubmissions,
  submissionIndex,
  handleBack,
  tableData,
  filterValue,
  setFilterValue,
  visibleColumns,
  sortColumn,
  setSortColumn,
  sortDirection,
  setSortDirection,
  editingRow,
  setEditingRow,
  editValue,
  setEditValue,
  validationError,
  setValidationError,
}: SubmissionDetailsProps) {
  function handleEdit(id: string) {
    setEditingRow(id);
    const row = tableData.find((row) => row.id === id);
    setEditValue(row?.value || "");
    setValidationError(null);
  }

  function handleSave() {
    if (editingRow) {
      const validation = validateValue(editingRow, editValue);

      if (!validation.valid) {
        setValidationError(validation.error || "Invalid value");
        return;
      }

      const rowIndex = tableData.findIndex((row) => row.id === editingRow);
      if (rowIndex === -1) return;

      const newTableData = [...tableData];
      newTableData[rowIndex].value = editValue;

      const updatedSubmission = {
        ...storedSubmissions[submissionIndex],
      };

      const keys = editingRow.split(".");
      let current = updatedSubmission;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      const originalValue = current[keys[keys.length - 1]];
      let newValue = editValue;

      if (typeof originalValue === "number") {
        newValue = Number(editValue);
      } else if (typeof originalValue === "boolean") {
        newValue = editValue === "true";
      } else if (Array.isArray(originalValue)) {
        try {
          newValue = JSON.parse(editValue);
        } catch (error) {
          console.error(error);
          setValidationError("Invalid array format");
          return;
        }
      }

      current[keys[keys.length - 1]] = newValue;

      const newSubmissions = [...storedSubmissions];
      newSubmissions[submissionIndex] = updatedSubmission;
      setStoredSubmissions(newSubmissions);
      localStorage.setItem("formSubmissions", JSON.stringify(newSubmissions));

      setEditingRow(null);
      setValidationError(null);
      toast.success("Value updated successfully");
    }
  }

  function handleCancel() {
    setEditingRow(null);
    setValidationError(null);
  }

  function handleSort(column: string) {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }

  const processedTableData = useMemo(() => {
    let data = [...tableData];

    if (filterValue) {
      const lowerFilter = filterValue.toLowerCase();
      data = data.filter(
        (row) =>
          row.metric.toLowerCase().includes(lowerFilter) ||
          String(row.value).toLowerCase().includes(lowerFilter)
      );
    }

    if (sortColumn) {
      data.sort((a, b) => {
        const aValue = a[sortColumn as keyof typeof a];
        const bValue = b[sortColumn as keyof typeof b];

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return sortDirection === "asc"
          ? aValue > bValue
            ? 1
            : -1
          : aValue < bValue
            ? 1
            : -1;
      });
    }

    return data;
  }, [tableData, filterValue, sortColumn, sortDirection]);

  return (
    <>
      <DialogHeader>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mr-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <DialogTitle>
              {(storedSubmissions[submissionIndex]["Team Number"] || "")
                .toString()
                .substring(0, 5)}{" "}
              - Match{" "}
              {(
                storedSubmissions[submissionIndex]["Qualification Number"] || ""
              )
                .toString()
                .substring(0, 3)}
            </DialogTitle>
            <DialogDescription>
              {storedSubmissions[submissionIndex]["Team Name"]}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="flex items-center justify-between gap-4 my-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by Metrics and Values"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="pl-8"
            autoComplete="off"
          />
        </div>
      </div>

      {validationError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      <div className="overflow-y-auto flex-1 -mx-6 px-6">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.includes("metric") && (
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("metric")}
                    className="flex items-center"
                  >
                    Metric
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              )}
              {visibleColumns.includes("value") && (
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("value")}
                    className="flex items-center"
                  >
                    Value
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              )}
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedTableData.length > 0 ? (
              processedTableData.map((row) => (
                <TableRow key={row.id}>
                  {visibleColumns.includes("metric") && (
                    <TableCell className="font-medium">{row.metric}</TableCell>
                  )}
                  {visibleColumns.includes("value") && (
                    <TableCell>
                      <ValueCell
                        row={row}
                        editingRow={editingRow}
                        editValue={editValue}
                        setEditValue={setEditValue}
                      />
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <ActionCell
                      row={row}
                      editingRow={editingRow}
                      handleEdit={handleEdit}
                      handleSave={handleSave}
                      handleCancel={handleCancel}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + 2}
                  className="text-center py-6"
                >
                  {filterValue
                    ? "No matching metrics found"
                    : "No metrics available"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

type ValueCellProps = {
  row: any;
  editingRow: string | null;
  editValue: any;
  setEditValue: (value: any) => void;
};

function ValueCell({
  row,
  editingRow,
  editValue,
  setEditValue,
}: ValueCellProps) {
  const options = getFieldOptions(row.metric);

  if (editingRow === row.id) {
    if (options) {
      return (
        <Select value={editValue} onValueChange={setEditValue}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    } else {
      return (
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full"
          autoFocus
        />
      );
    }
  }

  return <div className="max-w-[300px] truncate">{row.value}</div>;
}

type ActionCellProps = {
  row: any;
  editingRow: string | null;
  handleEdit: (id: string) => void;
  handleSave: () => void;
  handleCancel: () => void;
};

function ActionCell({
  row,
  editingRow,
  handleEdit,
  handleSave,
  handleCancel,
}: ActionCellProps) {
  if (editingRow === row.id) {
    return (
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleCancel}>
          <X className="h-4 w-4" />
        </Button>
        <Button variant="default" size="sm" onClick={handleSave}>
          <Save className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleEdit(row.id)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
