"use client";

import { Plus } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "~/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/form";
import { Input } from "~/input";

interface TMissedFieldProps {
  label: string;
  name: string;
}

export function MissedField({ label, name }: TMissedFieldProps) {
  const { control, setValue, watch } = useFormContext();
  const value = watch(name) || 0;

  function increment() {
    const newValue = value + 1;
    setValue(name, newValue);
    toast.success(`Missed ${label} incremented to ${newValue}`, {
      action: {
        label: "Undo",
        onClick: () => {
          const currentValue = watch(name) || 0;
          setValue(name, Math.max(0, currentValue - 1));
        },
      },
    });
  }

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
                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                onChange={(e) => {
                  const value = Math.max(
                    0,
                    Number.parseInt(e.target.value) || 0,
                  );
                  field.onChange(value);
                }}
                value={field.value || 0}
              />
              <Button
                className="shrink-0"
                onClick={increment}
                size="icon"
                type="button"
                variant="outline"
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
