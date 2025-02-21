import { useFormContext } from "react-hook-form";

import { Input } from "~/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/form";

type TInputFieldProps = {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
};

export function InputField({
  name,
  label,
  placeholder,
  type = "text",
}: TInputFieldProps) {
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
              onChange={(e) => {
                const value =
                  type === "number"
                    ? Number.parseFloat(e.target.value)
                    : e.target.value;
                field.onChange(value);
              }}
              autoComplete="off"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
