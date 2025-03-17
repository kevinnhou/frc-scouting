"use client";

import { useState } from "react";

import { HelpCircle, Settings } from "lucide-react";

import { Button } from "~/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/tabs";

type Shortcut = {
  key: string;
  description: string;
};

export function Helper() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        className="fixed bottom-10 right-10 h-14 w-14 rounded-full shadow-lg z-50"
        onClick={() => setOpen(true)}
      >
        <HelpCircle />
      </Button>

      <HelpModal open={open} onOpenChange={setOpen} />
    </>
  );
}

function HelpModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Keybinds and Google Sheet Configuration
          </DialogTitle>
          <DialogDescription className="tracking-wide font-sans">
            Quick reference for keybinds and configuration setup
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="shortcuts">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
            <TabsTrigger value="spreadsheet">Google Sheets Config</TabsTrigger>
          </TabsList>

          <TabsContent value="shortcuts" className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ShortcutCard
                  title="Stopwatch Controls"
                  shortcuts={[
                    {
                      key: "Space",
                      description: "Start/Pause active stopwatch",
                    },
                    { key: "S", description: "Save current stopwatch time" },
                    { key: "R", description: "Reset active stopwatch" },
                  ]}
                />

                <ShortcutCard
                  title="Cycle Counters"
                  shortcuts={[
                    { key: "1-4", description: "Increment Coral Level 1-4" },
                    { key: "P", description: "Increment Algae Processor" },
                    { key: "N", description: "Increment Algae Net" },
                  ]}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="spreadsheet" className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="border rounded-md p-4 bg-muted/30">
                <h4 className="font-medium mb-2">Spreadsheet ID:</h4>
                <p className="text-sm mb-3">
                  https://docs.google.com/spreadsheets/d/
                  <span className="bg-primary/20 px-1 rounded">
                    1wSqkn393E8CU-nEps1HW2WqNm_HZvGUM2deNYKFz-QE
                  </span>
                  /edit#gid=0
                </p>
                <p className="text-sm font-medium tracking-wide font-sans">
                  The highlighted part is your Spreadsheet ID
                  <br />
                  Ensure all users have edditing access to the sheet
                </p>
              </div>

              <div className="border rounded-md p-4 bg-muted/30 mt-4">
                <h4 className="font-medium mb-2">Sheet ID:</h4>
                <p className="text-sm font-medium tracking-wide font-sans">
                  The name of the sheet within the spreadsheet, which defaults
                  to {""}
                  <span className="bg-primary/20 px-1 rounded">Sheet1</span>
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function ShortcutCard({
  title,
  shortcuts,
}: {
  title: string;
  shortcuts: Shortcut[];
}) {
  return (
    <div className="border rounded-lg p-4">
      <h4 className="font-medium mb-3">{title}</h4>
      <ul className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <li key={index} className="flex items-center justify-between text-sm">
            <span className="font-sans">{shortcut.description}</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-semibold">
              {shortcut.key}
            </kbd>
          </li>
        ))}
      </ul>
    </div>
  );
}
