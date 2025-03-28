/* eslint-disable react/no-unstable-context-value */
/* eslint-disable ts/no-use-before-define */
"use client";

import type * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import type {
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import {
  Controller,
  FormProvider,
  useFormContext,
} from "react-hook-form";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const Form = FormProvider;

interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

interface FormItemContextValue {
  id: string
}

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext>
  );
}

function useFormField() {
  const fieldContext = React.use(FormFieldContext);
  const itemContext = React.use(FormItemContext);
  const { formState, getFieldState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    formDescriptionId: `${id}-form-item-description`,
    formItemId: `${id}-form-item`,
    formMessageId: `${id}-form-item-message`,
    id,
    name: fieldContext.name,
    ...fieldState,
  };
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

function FormItem({ ref, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { ref?: React.RefObject<HTMLDivElement | null> }) {
  const id = React.useId();

  return (
    <FormItemContext value={{ id }}>
      <div className={cn("space-y-2", className)} ref={ref} {...props} />
    </FormItemContext>
  );
}
FormItem.displayName = "FormItem";

function FormLabel({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & { ref?: React.RefObject<React.ElementRef<typeof LabelPrimitive.Root> | null> }) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      ref={ref}
      {...props}
    />
  );
}
FormLabel.displayName = "FormLabel";

function FormControl({ ref, ...props }: React.ComponentPropsWithoutRef<typeof Slot> & { ref?: React.RefObject<React.ElementRef<typeof Slot> | null> }) {
  const { error, formDescriptionId, formItemId, formMessageId } = useFormField();

  return (
    <Slot
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      id={formItemId}
      ref={ref}
      {...props}
    />
  );
}
FormControl.displayName = "FormControl";

function FormDescription({ ref, className, ...props }: React.HTMLAttributes<HTMLParagraphElement> & { ref?: React.RefObject<HTMLParagraphElement | null> }) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      className={cn("text-[0.8rem] text-muted-foreground", className)}
      id={formDescriptionId}
      ref={ref}
      {...props}
    />
  );
}
FormDescription.displayName = "FormDescription";

function FormMessage({ ref, children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement> & { ref?: React.RefObject<HTMLParagraphElement | null> }) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      className={cn("text-[0.8rem] font-medium text-destructive", className)}
      id={formMessageId}
      ref={ref}
      {...props}
    >
      {body}
    </p>
  );
}
FormMessage.displayName = "FormMessage";

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
};
