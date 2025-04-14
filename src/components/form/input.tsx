/* eslint-disable ts/ban-ts-comment */
// @ts-nocheck

"use client";

import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/ui/form";
import { Input } from "~/ui/input";

interface InputFieldProps {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
}

export function InputField({
  label,
  name,
  placeholder,
  type = "text",
}: InputFieldProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
              type={type}
              {...field}
              autoComplete="off"
              onChange={(e) => {
                const value =
                  type === "number"
                    ? Number.parseFloat(e.target.value)
                    : e.target.value;
                field.onChange(value);

                if (name === "Team Number") {
                  field.onBlur();
                }
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
