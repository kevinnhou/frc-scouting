"use client"

import {
  getFieldOptions,
  validateValue,
} from "@/components/dialogs/view-submissions"
import {
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  MoreHorizontal,
  Pencil,
  Save,
  Search,
  X,
} from "lucide-react"
import { useMemo } from "react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "~/alert"
import { Button } from "~/button"
import { DialogDescription, DialogHeader, DialogTitle } from "~/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/dropdown-menu"
import { Input } from "~/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/table"

interface ActionCellProps {
  editingRow: null | string
  handleCancel: () => void
  handleEdit: (id: string) => void
  handleSave: () => void
  row: any
}

interface SubmissionDetailsProps {
  editingRow: null | string
  editValue: any
  filterValue: string
  handleBack: () => void
  setEditingRow: (row: null | string) => void
  setEditValue: (value: any) => void
  setFilterValue: (value: string) => void
  setSortColumn: (column: null | string) => void
  setSortDirection: (direction: "asc" | "desc") => void
  setStoredSubmissions: (submissions: any[]) => void
  setValidationError: (error: null | string) => void
  setVisibleColumns: (columns: string[]) => void
  sortColumn: null | string
  sortDirection: "asc" | "desc"
  storedSubmissions: any[]
  submissionIndex: number
  tableData: any[]
  validationError: null | string
  visibleColumns: string[]
}

interface ValueCellProps {
  editingRow: null | string
  editValue: any
  row: any
  setEditValue: (value: any) => void
}

export function SubmissionDetails({
  editingRow,
  editValue,
  filterValue,
  handleBack,
  setEditingRow,
  setEditValue,
  setFilterValue,
  setSortColumn,
  setSortDirection,
  setStoredSubmissions,
  setValidationError,
  sortColumn,
  sortDirection,
  storedSubmissions,
  submissionIndex,
  tableData,
  validationError,
  visibleColumns,
}: SubmissionDetailsProps) {
  function handleEdit(id: string) {
    setEditingRow(id)
    const row = tableData.find(row => row.id === id)
    setEditValue(row?.value || "")
    setValidationError(null)
  }

  function handleSave() {
    if (editingRow) {
      const validation = validateValue(editingRow, editValue)

      if (!validation.valid) {
        setValidationError(validation.error || "Invalid value")
        return
      }

      const rowIndex = tableData.findIndex(row => row.id === editingRow)
      if (rowIndex === -1)
        return

      const newTableData = [...tableData]
      newTableData[rowIndex].value = editValue

      const updatedSubmission = {
        ...storedSubmissions[submissionIndex],
      }

      const keys = editingRow.split(".")
      let current = updatedSubmission

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]])
          current[keys[i]] = {}
        current = current[keys[i]]
      }

      const originalValue = current[keys[keys.length - 1]]
      let newValue = editValue

      if (typeof originalValue === "number") {
        newValue = Number(editValue)
      }
      else if (typeof originalValue === "boolean") {
        newValue = editValue === "true"
      }
      else if (Array.isArray(originalValue)) {
        try {
          newValue = JSON.parse(editValue)
        }
        catch (error) {
          console.error(error)
          setValidationError("Invalid array format")
          return
        }
      }

      current[keys[keys.length - 1]] = newValue

      const newSubmissions = [...storedSubmissions]
      newSubmissions[submissionIndex] = updatedSubmission
      setStoredSubmissions(newSubmissions)
      localStorage.setItem("formSubmissions", JSON.stringify(newSubmissions))

      setEditingRow(null)
      setValidationError(null)
      toast.success("Value updated successfully")
    }
  }

  function handleCancel() {
    setEditingRow(null)
    setValidationError(null)
  }

  function handleSort(column: string) {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    }
    else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const processedTableData = useMemo(() => {
    let data = [...tableData]

    if (filterValue) {
      const lowerFilter = filterValue.toLowerCase()
      data = data.filter(
        row =>
          row.metric.toLowerCase().includes(lowerFilter)
          || String(row.value).toLowerCase().includes(lowerFilter),
      )
    }

    if (sortColumn) {
      data.sort((a, b) => {
        const aValue = a[sortColumn as keyof typeof a]
        const bValue = b[sortColumn as keyof typeof b]

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }

        return sortDirection === "asc"
          ? aValue > bValue
            ? 1
            : -1
          : aValue < bValue
            ? 1
            : -1
      })
    }

    return data
  }, [tableData, filterValue, sortColumn, sortDirection])

  return (
    <>
      <DialogHeader>
        <div className="flex items-center">
          <Button
            className="mr-2"
            onClick={handleBack}
            size="sm"
            variant="ghost"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <DialogTitle>
              {(storedSubmissions[submissionIndex]["Team Number"] || "")
                .toString()
                .substring(0, 5)}
              {" "}
              - Match
              {" "}
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
            autoComplete="off"
            className="pl-8"
            onChange={e => setFilterValue(e.target.value)}
            placeholder="Filter by Metrics and Values"
            value={filterValue}
          />
        </div>
      </div>

      {validationError && (
        <Alert className="mb-4" variant="destructive">
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
                    className="flex items-center"
                    onClick={() => handleSort("metric")}
                    variant="ghost"
                  >
                    Metric
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              )}
              {visibleColumns.includes("value") && (
                <TableHead>
                  <Button
                    className="flex items-center"
                    onClick={() => handleSort("value")}
                    variant="ghost"
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
            {processedTableData.length > 0
              ? (
                  processedTableData.map(row => (
                    <TableRow key={row.id}>
                      {visibleColumns.includes("metric") && (
                        <TableCell className="font-medium">{row.metric}</TableCell>
                      )}
                      {visibleColumns.includes("value") && (
                        <TableCell>
                          <ValueCell
                            editingRow={editingRow}
                            editValue={editValue}
                            row={row}
                            setEditValue={setEditValue}
                          />
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <ActionCell
                          editingRow={editingRow}
                          handleCancel={handleCancel}
                          handleEdit={handleEdit}
                          handleSave={handleSave}
                          row={row}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )
              : (
                  <TableRow>
                    <TableCell
                      className="text-center py-6"
                      colSpan={visibleColumns.length + 2}
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
  )
}

function ActionCell({
  editingRow,
  handleCancel,
  handleEdit,
  handleSave,
  row,
}: ActionCellProps) {
  if (editingRow === row.id) {
    return (
      <div className="flex justify-end gap-2">
        <Button onClick={handleCancel} size="sm" variant="outline">
          <X className="h-4 w-4" />
        </Button>
        <Button onClick={handleSave} size="sm" variant="default">
          <Save className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost">
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
  )
}

function ValueCell({
  editingRow,
  editValue,
  row,
  setEditValue,
}: ValueCellProps) {
  const options = getFieldOptions(row.metric)

  if (editingRow === row.id) {
    if (options) {
      return (
        <Select onValueChange={setEditValue} value={editValue}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }
    else {
      return (
        <Input
          autoFocus
          className="w-full"
          onChange={e => setEditValue(e.target.value)}
          value={editValue}
        />
      )
    }
  }

  return <div className="max-w-[300px] truncate">{row.value}</div>
}
