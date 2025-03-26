"use client"

import { HelpCircle, Settings } from "lucide-react"
import { useState } from "react"

import { Button } from "~/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/tabs"

interface Shortcut {
  description: string
  key: string
}

export function Helper() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        className="fixed bottom-10 right-10 rounded-full shadow-xl z-50"
        onClick={() => setOpen(true)}
        size="icon"
        variant="secondary"
      >
        <HelpCircle />
      </Button>

      <HelpModal onOpenChange={setOpen} open={open} />
    </>
  )
}

function HelpModal({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
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

          <TabsContent className="space-y-6 py-4" value="shortcuts">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </TabsContent>

          <TabsContent className="space-y-6 py-4" value="spreadsheet">
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
                  to
                  {" "}

                  <span className="bg-primary/20 px-1 rounded">Sheet1</span>
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function ShortcutCard({
  shortcuts,
  title,
}: {
  shortcuts: Shortcut[]
  title: string
}) {
  return (
    <div className="border rounded-lg p-4">
      <h4 className="font-medium mb-3">{title}</h4>
      <ul className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <li className="flex items-center justify-between text-sm" key={index}>
            <span className="font-sans">{shortcut.description}</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-semibold">
              {shortcut.key}
            </kbd>
          </li>
        ))}
      </ul>
    </div>
  )
}
