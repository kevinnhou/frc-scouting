"use client";

import { useState, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { Pause, Play, Save, Trash2, X } from "lucide-react";

import { Button } from "~/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/form";
import { Input } from "~/input";

type TStopwatchFieldProps = {
  name: string;
  label: string;
  section: "autonomous" | "teleop" | "misc";
};

export function StopwatchField({ name, label, section }: TStopwatchFieldProps) {
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
      start: handleStart,
      pause: handlePause,
      reset: handleReset,
      save: handleSave,
      isRunning: () => isRunning,
      hasTime: () => time > 0,
    };

    window.stopwatchRegistry[section].push(controls);

    return () => {
      if (window.stopwatchRegistry && window.stopwatchRegistry[section]) {
        window.stopwatchRegistry[section] = window.stopwatchRegistry[
          section
        ].filter((c: unknown) => c !== controls);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, isRunning, time]);

  function handleStart() {
    setIsRunning(true);
  }

  function handlePause() {
    setIsRunning(false);
  }

  function handleReset() {
    setIsRunning(false);
    setTime(0);
  }

  function handleSave() {
    const newTime = Number(time.toFixed(2));
    setValue(name, [...savedTimes, newTime]);
    setTime(0);
    setIsRunning(false);
  }

  function handleRemove(index: number) {
    const newTimes = savedTimes.filter((_: number, i: number) => i !== index);
    setValue(name, newTimes);
  }

  return (
    <FormField
      control={control}
      name={name}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  value={time.toFixed(2)}
                  readOnly
                  className="w-full"
                />
                {!isRunning && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleStart}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
                {isRunning && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handlePause}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleReset}
                >
                  <X className="h-4 w-4" />
                </Button>
                {(isRunning || time > 0) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleSave}
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
                        key={index}
                        className="flex items-center bg-secondary text-secondary-foreground rounded-md px-2 py-1"
                      >
                        <span className="text-sm mr-2">
                          {savedTime.toFixed(2)}s
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => handleRemove(index)}
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
    stopwatchRegistry?: {
      [section: string]: {
        start: () => void;
        pause: () => void;
        reset: () => void;
        save: () => void;
        isRunning: () => boolean;
        hasTime: () => boolean;
      }[];
    };
  }
}
