"use client";

import { useEffect } from "react";

import { toast } from "sonner";
import { useFormContext } from "react-hook-form";

import { Plus } from "lucide-react";

import { Button } from "~/button";
import { Input } from "~/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/form";

type TCycleFieldProps = {
  name: string;
  label: string;
  section?: "autonomous" | "teleop" | "misc";
};

export function CycleField({
  name,
  label,
  section = "misc",
}: TCycleFieldProps) {
  const { control, setValue, watch } = useFormContext();
  const value = watch(name) || 0;

  function increment() {
    const newValue = value + 1;
    setValue(name, newValue);
    toast.success(`${label} incremented to ${newValue}`, {
      action: {
        label: "Undo",
        onClick: () => decrement(),
      },
    });
  }

  function decrement() {
    const newValue = Math.max(0, value - 1);
    setValue(name, newValue);
  }

  useEffect(() => {
    if (!window.cycleRegistry) {
      window.cycleRegistry = {};
    }

    if (!window.cycleRegistry[section]) {
      window.cycleRegistry[section] = {};
    }

    const fieldIdentifier = name.split(".").pop() || "";

    window.cycleRegistry[section][fieldIdentifier] = increment;

    return () => {
      if (window.cycleRegistry && window.cycleRegistry[section]) {
        delete window.cycleRegistry[section][fieldIdentifier];
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, section, value]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="flex gap-2">
              <Input
                type="number"
                {...field}
                value={field.value || 0}
                onChange={(e) => {
                  const value = Math.max(
                    0,
                    Number.parseInt(e.target.value) || 0
                  );
                  field.onChange(value);
                }}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={increment}
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
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
    cycleRegistry?: {
      [section: string]: {
        [fieldIdentifier: string]: () => void;
      };
    };
  }
}
