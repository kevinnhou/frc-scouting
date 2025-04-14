/* eslint-disable react-web-api/no-leaked-event-listener */
/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */

"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ArrowLeft, MapPin } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "~/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/dialog";

interface FieldPositions {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ElementPositions {
  id: string;
  x: number;
  y: number;
}

const LENGTH = 30;

// considered mapping, however the coordinates do not align

const coralPositions: ElementPositions[] = [
  { id: "A", x: 225.5, y: 295 },
  { id: "B", x: 225.5, y: 331 },
  { id: "C", x: 245.5, y: 380 },
  { id: "D", x: 280.5, y: 401 },
  { id: "E", x: 350.5, y: 400.5 },
  { id: "F", x: 385.5, y: 380 },
  { id: "G", x: 402, y: 331 },
  { id: "H", x: 402, y: 295 },
  { id: "I", x: 385, y: 244.5 },
  { id: "J", x: 350, y: 225 },
  { id: "K", x: 279, y: 225 },
  { id: "L", x: 244.5, y: 246 },
];

const processorPositions: ElementPositions[] = [
  { id: "Processor", x: 398, y: 588 },
];

const bargePositions: ElementPositions[] = [{ id: "Barge", x: 564, y: 74 }];

const fieldPositions: FieldPositions[] = [
  ...coralPositions.map((pos) => ({
    ...pos,
    width: LENGTH,
    height: LENGTH,
  })),
  ...processorPositions.map((pos) => ({
    ...pos,
    width: 115,
    height: 30,
  })),
  ...bargePositions.map((pos) => ({
    ...pos,
    width: 72,
    height: 244,
  })),
];

type DialogView = "field" | "coral" | "processor" | "barge";

export function FieldDialog() {
  const [open, setOpen] = useState(false);
  const [currentView, setCurrentView] = useState<DialogView>("field");
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<
    "autonomous" | "teleop" | "misc"
  >("autonomous");
  const imageRef = useRef<HTMLDivElement>(null);
  const { setValue, watch } = useFormContext();
  const [imageScale, setImageScale] = useState(1);

  useEffect(() => {
    if (!open) {
      setCurrentView("field");
    }
  }, [open]);

  useEffect(() => {
    function handleTabChange(event: CustomEvent) {
      setCurrentTab(event.detail as "autonomous" | "teleop" | "misc");
    }

    window.addEventListener("tabChange", handleTabChange as EventListener);

    return () => {
      window.removeEventListener("tabChange", handleTabChange as EventListener);
    };
  }, []);

  function calculateScale() {
    if (imageRef.current) {
      const containerWidth = imageRef.current.clientWidth;
      const originalWidth = 1200;
      setImageScale(containerWidth / originalWidth);
    }
  }

  useEffect(() => {
    if (currentView === "field" && open) {
      const timer = setTimeout(() => {
        calculateScale();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentView, open]);

  useEffect(() => {
    if (open && currentView === "field") {
      window.addEventListener("resize", calculateScale);
      return () => {
        window.removeEventListener("resize", calculateScale);
      };
    }
  }, [open, currentView]);

  function handleGoBack() {
    setCurrentView("field");
    setTimeout(calculateScale, 0);
  }

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const position of fieldPositions) {
      const scaledX = position.x * imageScale;
      const scaledY = position.y * imageScale;
      const scaledWidth = position.width * imageScale;
      const scaledHeight = position.height * imageScale;

      if (
        x >= scaledX &&
        x <= scaledX + scaledWidth &&
        y >= scaledY &&
        y <= scaledY + scaledHeight
      ) {
        setSelectedPosition(position.id);

        if (position.id === "Processor") {
          setCurrentView("processor");
        } else if (position.id === "Barge") {
          setCurrentView("barge");
        } else {
          setCurrentView("coral");
        }
        return;
      }
    }
  }

  function handleProcessorSuccess() {
    const cycleFieldName =
      currentTab === "autonomous" ? "Autonomous Cycles" : "Teleop Cycles";
    const currentValue = watch(`${cycleFieldName}.Algae Processor`) || 0;
    setValue(`${cycleFieldName}.Algae Processor`, currentValue + 1);
    toast.success(
      `Processor Scored during ${currentTab[0].toUpperCase()}${currentTab.slice(1)}`,
    );
    handleGoBack();
  }

  function handleProcessorMissed() {
    const missedFieldName =
      currentTab === "autonomous" ? "Autonomous Missed" : "Teleop Missed";
    const currentValue = watch(`${missedFieldName}.Processor`) || 0;
    setValue(`${missedFieldName}.Processor`, currentValue + 1);
    toast.error(
      `Missed Processor incremented during ${currentTab[0].toUpperCase()}${currentTab.slice(1)}`,
    );
    handleGoBack();
  }

  function handleNetSuccess() {
    const cycleFieldName =
      currentTab === "autonomous" ? "Autonomous Cycles" : "Teleop Cycles";
    const currentValue = watch(`${cycleFieldName}.Algae Net`) || 0;
    setValue(`${cycleFieldName}.Algae Net`, currentValue + 1);
    toast.success(
      `Net Scored during ${currentTab[0].toUpperCase()}${currentTab.slice(1)}`,
    );
    handleGoBack();
  }

  function handleNetMissed() {
    const missedFieldName =
      currentTab === "autonomous" ? "Autonomous Missed" : "Teleop Missed";
    const currentValue = watch(`${missedFieldName}.Net`) || 0;
    setValue(`${missedFieldName}.Net`, currentValue + 1);
    toast.error(
      `Missed Net incremented during ${currentTab[0].toUpperCase()}${currentTab.slice(1)}`,
    );
    handleGoBack();
  }

  function handleCageSelection(level: "Deep" | "Shallow" | "None") {
    setValue("Cage Level", level);
    toast.success(`Cage Level set to ${level}`);
    handleGoBack();
  }

  function handleCoralSelection(level: "1" | "2" | "3" | "4" | "missed") {
    if (!selectedPosition) return;

    const cycleFieldName =
      currentTab === "autonomous" ? "Autonomous Cycles" : "Teleop Cycles";

    const missedFieldName =
      currentTab === "autonomous" ? "Autonomous Missed" : "Teleop Missed";

    if (level === "missed") {
      const currentMissed = watch(`${missedFieldName}.Coral`) || 0;
      setValue(`${missedFieldName}.Coral`, currentMissed + 1);
      toast.error(`Coral Missed at Position ${selectedPosition}`);
    } else {
      const levelField = `Coral Level ${level}`;
      const currentValue = watch(`${cycleFieldName}.${levelField}`) || 0;
      setValue(`${cycleFieldName}.${levelField}`, currentValue + 1);
      toast.success(
        `Level ${level} Coral Scored from Position ${selectedPosition}`,
      );
    }

    handleGoBack();
  }

  function getViewConfig() {
    switch (currentView) {
      case "coral":
        return {
          title: `Position ${selectedPosition} - Coral Action`,
          buttons: [
            ...[1, 2, 3, 4].map((level) => ({
              label: `Level ${level}`,
              onClick: () =>
                handleCoralSelection(level.toString() as "1" | "2" | "3" | "4"),
              className: "h-20 flex-1 basis-[calc(50%-0.5rem)] text-lg",
            })),
            {
              label: "Missed",
              onClick: () => handleCoralSelection("missed"),
              className: "h-20 w-full bg-destructive text-lg text-white",
              fullWidth: true,
            },
          ],
        };

      case "processor":
        return {
          title: "Processor Actions",
          buttons: [
            {
              label: "Processor",
              onClick: handleProcessorSuccess,
              className: "h-20 w-full text-lg",
              fullWidth: true,
            },
            {
              label: "Missed Processor",
              onClick: handleProcessorMissed,
              className: "h-20 w-full bg-destructive text-lg text-white",
              fullWidth: true,
            },
          ],
        };

      case "barge":
        return {
          title: "Barge Actions",
          buttons: [
            {
              label: "Net",
              onClick: handleNetSuccess,
              className: "h-20 flex-1 basis-[calc(50%-0.5rem)] text-lg",
            },
            {
              label: "Missed Net",
              onClick: handleNetMissed,
              className:
                "h-20 flex-1 basis-[calc(50%-0.5rem)] bg-destructive text-lg text-white",
            },
            {
              label: "Cage: Deep",
              onClick: () => handleCageSelection("Deep"),
              className:
                "h-20 flex-1 basis-[calc(50%-0.5rem)] bg-blue-100 text-lg",
            },
            {
              label: "Cage: Shallow",
              onClick: () => handleCageSelection("Shallow"),
              className:
                "h-20 flex-1 basis-[calc(50%-0.5rem)] bg-blue-50 text-lg",
            },
            {
              label: "Cage: None",
              onClick: () => handleCageSelection("None"),
              className: "h-20 flex-1 basis-[calc(50%-0.5rem)] text-lg",
            },
          ],
        };

      default:
        return {
          title: "Field Map",
          buttons: [],
        };
    }
  }

  function renderActionView() {
    const { title, buttons } = getViewConfig();

    return (
      <>
        <DialogHeader className="flex flex-row items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-wrap gap-4 py-4">
          {buttons.map((button, index) => (
            <Button
              key={index}
              variant="outline"
              className={button.className}
              onClick={button.onClick}
            >
              {button.label}
            </Button>
          ))}
        </div>
      </>
    );
  }

  function renderDialogContent() {
    if (currentView === "field") {
      return (
        <>
          <DialogHeader>
            <VisuallyHidden>
              <DialogTitle>Field Map</DialogTitle>
            </VisuallyHidden>
          </DialogHeader>
          <div
            ref={imageRef}
            className="relative cursor-pointer"
            onClick={handleClick}
          >
            <Image
              src="/assets/field.png"
              width={1150}
              height={627}
              alt="Game Field"
              className="h-auto w-full"
            />

            {fieldPositions.map((position, index) => (
              <div
                key={index}
                className="absolute border-3 border-transparent"
                style={{
                  left: `${position.x * imageScale}px`,
                  top: `${position.y * imageScale}px`,
                  width: `${position.width * imageScale}px`,
                  height: `${position.height * imageScale}px`,
                }}
              />
            ))}
          </div>
          <div className="mt-2 text-center text-sm text-muted-foreground">
            Record game elements by clicking on the corresponding locations on
            the field image. <br /> Note: Always use the blue alliance's
            perspective, regardless of which alliance you are scouting.
          </div>
        </>
      );
    }

    return renderActionView();
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen);
    if (newOpen) {
      setTimeout(calculateScale, 0);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MapPin className="h-4 w-4" />
          Field View
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[1200px]">
        {renderDialogContent()}
      </DialogContent>
    </Dialog>
  );
}
