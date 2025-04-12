/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */

"use client";

import { Eye, Settings, Trash2, Upload } from "lucide-react";
import type * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { ModeSwitcher } from "./mode";
import { ThemeSwitcher } from "./theme";

import { ClearData } from "@/components/dialogs/clear-data";
import { Config } from "@/components/dialogs/config";
import { ExportData } from "@/components/dialogs/export-data";
import { QRCode } from "@/components/dialogs/qrcode";
import { ViewSubmissions } from "@/components/dialogs/view-submissions";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "~/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showViewSubmissionsDialog, setShowViewSubmissionsDialog] =
    useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showClearDataDialog, setShowClearDataDialog] = useState(false);

  const [spreadsheetID, setSpreadsheetID] = useState("");
  const [sheetID, setSheetID] = useState("");
  // eslint-disable-next-line ts/no-unused-vars
  const [teams, setTeams] = useState<Record<string, string>>({});
  const [JSONInput, setJSONInput] = useState("");
  const [QRCodeData, setQRCodeData] = useState("");
  const [QRBgColour, setQRBgColour] = useState("#ffffff");
  const [QRFgColour, setQRFgColour] = useState("#000000");
  const [storedSubmissions, setStoredSubmissions] = useState<any[]>([]);
  const [selectedSubmissions, setSelectedSubmissions] = useState<number[]>([]);
  const [exportMethod, setExportMethod] = useState<
    "clipboard" | "json" | "qrcode"
  >("qrcode");

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
      setStoredSubmissions([]);
      return [];
    } catch (error) {
      console.error("Error loading stored submissions:", error);
      setStoredSubmissions([]);
      return [];
    }
  }, []);

  const handleStorageChange = useCallback((event: StorageEvent) => {
    if (event.key === "formSubmissions") {
      loadSubmissions();
    } else if (event.key === "spreadsheetID") {
      setSpreadsheetID(event.newValue || "");
    } else if (event.key === "sheetID") {
      setSheetID(event.newValue || "");
    } else if (event.key === "teams") {
      try {
        setTeams(JSON.parse(event.newValue || "{}"));
      } catch (error) {
        console.error("Error parsing teams:", error);
      }
    }
  }, []);

  const updateQRColours = useCallback(() => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    const bg = computedStyle.getPropertyValue("--background") || "#ffffff";
    const fg = computedStyle.getPropertyValue("--foreground") || "#000000";

    setQRBgColour(bg.startsWith("hsl") ? bg : "#ffffff");
    setQRFgColour(fg.startsWith("hsl") ? fg : "#000000");
  }, []);

  const handleExport = useCallback(() => {
    updateQRColours();
    setSelectedSubmissions(storedSubmissions.map((_, index) => index));
    setShowExportDialog(true);
  }, [storedSubmissions, updateQRColours]);

  const loadForm = useCallback((data: any) => {
    const event = new CustomEvent("loadFormData", { detail: data });
    window.dispatchEvent(event);
    toast.info("Submission loaded for editing");
  }, []);

  const updateStoredSubmissions = useCallback((submissions: any[]) => {
    localStorage.setItem("formSubmissions", JSON.stringify(submissions));
    setStoredSubmissions(submissions);
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "formSubmissions",
        newValue: JSON.stringify(submissions),
      }),
    );
  }, []);

  const handleClearData = useCallback(() => {
    setShowClearDataDialog(true);
  }, []);

  useEffect(() => {
    const storedSpreadsheetID = localStorage.getItem("spreadsheetID");
    if (storedSpreadsheetID) {
      setSpreadsheetID(storedSpreadsheetID);
    }

    const storedTeams = localStorage.getItem("teams");
    if (storedTeams) {
      try {
        setTeams(JSON.parse(storedTeams));
      } catch (error) {
        console.error("Error parsing teams:", error);
      }
    }

    const storedSheetID = localStorage.getItem("sheetID");
    if (storedSheetID) {
      setSheetID(storedSheetID);
    }

    loadSubmissions();
    updateQRColours();

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ModeSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="place-items-center">
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setShowConfigDialog(true)}>
                  <Settings className="h-4 w-4" />
                  <span>Configuration</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setShowViewSubmissionsDialog(true)}
                  disabled={storedSubmissions.length === 0}
                >
                  <Eye className="h-4 w-4" />
                  <span>View Submissions</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleExport}
                  disabled={storedSubmissions.length === 0}
                >
                  <Upload className="h-4 w-4" />
                  <span>Export Data</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleClearData}
                  disabled={storedSubmissions.length === 0}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span>Clear Submissions</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ThemeSwitcher />
      </SidebarFooter>
      <SidebarRail />

      <Config
        JSONInput={JSONInput}
        onOpenChange={setShowConfigDialog}
        open={showConfigDialog}
        setJSONInput={setJSONInput}
        setSheetID={setSheetID}
        setSpreadsheetID={setSpreadsheetID}
        setTeams={setTeams}
        sheetID={sheetID}
        spreadsheetID={spreadsheetID}
      />
      <ExportData
        exportMethod={exportMethod}
        onOpenChange={setShowExportDialog}
        open={showExportDialog}
        selectedSubmissions={selectedSubmissions}
        setExportMethod={setExportMethod}
        setQRCodeData={setQRCodeData}
        setSelectedSubmissions={setSelectedSubmissions}
        setShowQRModal={setShowQRModal}
        storedSubmissions={storedSubmissions}
      />
      <ViewSubmissions
        loadForm={loadForm}
        onOpenChange={setShowViewSubmissionsDialog}
        open={showViewSubmissionsDialog}
        setStoredSubmissions={updateStoredSubmissions}
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
        setStoredSubmissions={updateStoredSubmissions}
        submissionsCount={storedSubmissions.length}
      />
    </Sidebar>
  );
}
