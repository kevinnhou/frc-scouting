"use client";

import { HelpCircle, Settings } from "lucide-react";
import { useState } from "react";

import { Button } from "~/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/dialog";
import { Tabs } from "~/tabs";

interface Shortcut {
  description: string;
  key: string;
}

export function Helper() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="fixed right-10 bottom-10 z-50 rounded-full shadow-xl"
        onClick={() => setOpen(true)}
        size="icon"
        variant="secondary"
      >
        <HelpCircle />
      </Button>

      <HelpModal onOpenChange={setOpen} open={open} />
    </>
  );
}

function HelpModal({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const [activeTab, setActiveTab] = useState("shortcuts");

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="overflow-x-scroll xl:min-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Keybinds and Google Sheet Configuration
          </DialogTitle>
          <DialogDescription className="font-sans tracking-wide">
            Quick reference for keybinds and configuration setup
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Tabs
            tabs={[
              { id: "shortcuts", label: "Shortcuts" },
              { id: "spreadsheet", label: "Google Sheets Config" },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            className="w-full"
          />

          {activeTab === "shortcuts" && (
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <ShortcutCard
                    shortcuts={[
                      {
                        description: "Start/Pause active stopwatch",
                        key: "Space",
                      },
                      { description: "Save current stopwatch time", key: "S" },
                      { description: "Reset active stopwatch", key: "R" },
                    ]}
                    title="Stopwatch Controls"
                  />

                  <ShortcutCard
                    shortcuts={[
                      { description: "Increment Coral Level 1-4", key: "1-4" },
                      { description: "Increment Algae Processor", key: "P" },
                      { description: "Increment Algae Net", key: "N" },
                    ]}
                    title="Cycle Counters"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "spreadsheet" && (
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="rounded-md border bg-muted/30 p-4">
                  <h4 className="mb-2 font-medium">Spreadsheet ID:</h4>
                  <p className="mb-3 text-sm">
                    https://docs.google.com/spreadsheets/d/
                    <span className="rounded bg-primary/20 px-1">
                      1wSqkn393E8CU-nEps1HW2WqNm_HZvGUM2deNYKFz-QE
                    </span>
                    /edit#gid=0
                  </p>
                  <p className="font-sans text-sm font-medium tracking-wide">
                    The highlighted part is your Spreadsheet ID
                    <br />
                    Ensure all users have edditing access to the sheet
                  </p>
                </div>

                <div className="mt-4 rounded-md border bg-muted/30 p-4">
                  <h4 className="mb-2 font-medium">Sheet ID:</h4>
                  <p className="font-sans text-sm font-medium tracking-wide">
                    The name of the sheet within the spreadsheet, which defaults
                    to{" "}
                    <span className="rounded bg-primary/20 px-1">Sheet1</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShortcutCard({
  shortcuts,
  title,
}: {
  shortcuts: Shortcut[];
  title: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <h4 className="mb-3 font-medium">{title}</h4>
      <ul className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <li className="flex items-center justify-between text-sm" key={index}>
            <span className="font-sans">{shortcut.description}</span>
            <kbd className="rounded bg-muted px-2 py-1 text-xs font-semibold">
              {shortcut.key}
            </kbd>
          </li>
        ))}
      </ul>
    </div>
  );
}
