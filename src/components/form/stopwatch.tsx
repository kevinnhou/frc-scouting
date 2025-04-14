/* eslint-disable ts/no-unused-vars */

"use client";

import { Pause, Play, Save, Trash2, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "~/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/ui/form";
import { Input } from "~/ui/input";

interface StopwatchFieldProps {
  label: string;
  name: string;
  section: "autonomous" | "misc" | "teleop";
}

export function StopwatchField({ label, name, section }: StopwatchFieldProps) {
  const { control, setValue, watch } = useFormContext();
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const savedTimes = watch(name) || [];
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 0.01);
      }, 10);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (!window.stopwatchRegistry) {
      window.stopwatchRegistry = {};
    }

    if (!window.stopwatchRegistry[section]) {
      window.stopwatchRegistry[section] = [];
    }

    const controls = {
      hasTime: () => time > 0,
      isRunning: () => isRunning,
      pause: handlePause,
      reset: handleReset,
      save: handleSave,
      start: handleStart,
    };

    window.stopwatchRegistry[section].push(controls);

    return () => {
      if (window.stopwatchRegistry && window.stopwatchRegistry[section]) {
        window.stopwatchRegistry[section] = window.stopwatchRegistry[
          section
        ].filter((c: unknown) => c !== controls);
      }
    };
  }, [section, isRunning, time]);

  function handleStart() {
    setIsRunning(true);
    toast.promise(
      new Promise<React.ReactNode>((resolve, reject) => {
        window.currentStopwatchPromise = { reject, resolve };
      }),
      {
        error: (message) => message as string,
        loading: `${label} timer started`,
        success: (message) => message as string,
      },
    );
  }

  function handlePause() {
    setIsRunning(false);
    if (window.currentStopwatchPromise) {
      window.currentStopwatchPromise.reject(`${label} timer paused`);
      window.currentStopwatchPromise = undefined;
    }
  }

  function handleReset() {
    setIsRunning(false);
    setTime(0);
    if (window.currentStopwatchPromise) {
      window.currentStopwatchPromise.reject(`${label} timer canceled`);
      window.currentStopwatchPromise = undefined;
    } else {
      toast.warning(`${label} timer reset`);
    }
  }

  function handleSave() {
    const newTime = Number(time.toFixed(2));
    setValue(name, [...savedTimes, newTime]);
    setTime(0);
    setIsRunning(false);
    if (window.currentStopwatchPromise) {
      window.currentStopwatchPromise.resolve(
        `${label} time saved: ${newTime.toFixed(2)}s`,
      );
      window.currentStopwatchPromise = undefined;
    } else {
      toast.success(`${label} time saved: ${newTime.toFixed(2)}s`);
    }
  }

  function handleRemove(index: number) {
    const newTimes = savedTimes.filter((_: number, i: number) => i !== index);
    setValue(name, newTimes);
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  className="w-full"
                  readOnly
                  step="0.01"
                  type="number"
                  value={time.toFixed(2)}
                />
                {!isRunning && (
                  <Button
                    onClick={handleStart}
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
                {isRunning && (
                  <Button
                    onClick={handlePause}
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  onClick={handleReset}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <X className="h-4 w-4" />
                </Button>
                {(isRunning || time > 0) && (
                  <Button
                    onClick={handleSave}
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {savedTimes.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Saved Times:</div>
                  <div className="flex flex-wrap gap-2">
                    {savedTimes.map((savedTime: number, index: number) => (
                      <div
                        className="flex items-center rounded-md bg-secondary px-2 py-1 text-secondary-foreground"
                        key={index}
                      >
                        <span className="mr-2 text-sm">
                          {savedTime.toFixed(2)}s
                        </span>
                        <Button
                          className="h-5 w-5 p-0"
                          onClick={() => handleRemove(index)}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

declare global {
  interface Window {
    currentStopwatchPromise?: {
      reject: (reason?: unknown) => void;
      resolve: (value: PromiseLike<React.ReactNode> | React.ReactNode) => void;
    };
    stopwatchRegistry?: {
      [section: string]: {
        hasTime: () => boolean;
        isRunning: () => boolean;
        pause: () => void;
        reset: () => void;
        save: () => void;
        start: () => void;
      }[];
    };
  }
}
