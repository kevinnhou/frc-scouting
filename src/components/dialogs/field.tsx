/* eslint-disable react-web-api/no-leaked-event-listener */
/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */

"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { MapPin } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/alert-dialog";
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
  { id: "A", x: 216, y: 282 },
  { id: "B", x: 216, y: 317 },
  { id: "C", x: 235, y: 363 },
  { id: "D", x: 268, y: 383 },
  { id: "E", x: 335, y: 383 },
  { id: "F", x: 368.5, y: 363 },
  { id: "G", x: 385, y: 317 },
  { id: "H", x: 385, y: 282 },
  { id: "I", x: 368.5, y: 234 },
  { id: "J", x: 335, y: 215 },
  { id: "K", x: 267, y: 215 },
  { id: "L", x: 234, y: 236 },
];

const processorPositions: ElementPositions[] = [
  { id: "Processor", x: 382, y: 562 },
];

const bargePositions: ElementPositions[] = [{ id: "Barge", x: 540, y: 70 }];

const fieldPositions: FieldPositions[] = [
  ...coralPositions.map((pos) => ({
    ...pos,
    width: LENGTH,
    height: LENGTH,
  })),
  ...processorPositions.map((pos) => ({
    ...pos,
    width: 110,
    height: 29,
  })),
  ...bargePositions.map((pos) => ({
    ...pos,
    width: 70,
    height: 235,
  })),
];

export function FieldDialog() {
  const [open, setOpen] = useState(false);
  const [coralDialogOpen, setCoralDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<
    "autonomous" | "teleop" | "misc"
  >("autonomous");
  const imageRef = useRef<HTMLDivElement>(null);
  const { setValue, watch } = useFormContext();
  const [imageScale, setImageScale] = useState(1);

  useEffect(() => {
    function handleTabChange(event: CustomEvent) {
      setCurrentTab(event.detail as "autonomous" | "teleop" | "misc");
    }

    window.addEventListener("tabChange", handleTabChange as EventListener);

    return () => {
      window.removeEventListener("tabChange", handleTabChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (open && imageRef.current) {
      const calculateScale = () => {
        if (imageRef.current) {
          const containerWidth = imageRef.current.clientWidth;
          const originalWidth = 1200;
          setImageScale(containerWidth / originalWidth);
        }
      };

      calculateScale();
      window.addEventListener("resize", calculateScale);

      return () => {
        window.removeEventListener("resize", calculateScale);
      };
    }
  }, [open]);

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
        setCoralDialogOpen(true);
        return;
      }
    }
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

    setCoralDialogOpen(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <MapPin className="h-4 w-4" />
            Field View
          </Button>
        </DialogTrigger>
        <DialogContent className="min-w-[1200px]">
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
                className="absolute border-3 border-black"
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
            Click on any labeled positions to record scored coral
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={coralDialogOpen} onOpenChange={setCoralDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Position {selectedPosition}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>Select Coral Action</AlertDialogDescription>
          <div className="flex flex-wrap gap-4 py-4">
            {[1, 2, 3, 4].map((level) => (
              <Button
                key={level}
                variant="outline"
                className="h-20 flex-1 basis-[calc(50%-0.5rem)] text-lg"
                onClick={() =>
                  handleCoralSelection(
                    level.toString() as "1" | "2" | "3" | "4",
                  )
                }
              >
                Level {level}
              </Button>
            ))}
            <Button
              variant="outline"
              className="h-20 w-full bg-destructive text-lg text-white"
              onClick={() => handleCoralSelection("missed")}
            >
              Missed
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
