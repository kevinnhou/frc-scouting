/* eslint-disable ts/no-unused-vars */

"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/ui/form";
import { TagSelector } from "~/ui/tag-selector";
import { Textarea } from "~/ui/textarea";

interface NotesFieldProps {
  label: string;
  name: string;
}

const predefinedTags = ["Penalties", "Defense", "Scoring Behind Reef"];

export function NotesField({ label, name }: NotesFieldProps) {
  const { control, setValue, watch } = useFormContext();
  const [availableTags, setAvailableTags] = useState<string[]>([
    ...predefinedTags,
  ]);

  const value = watch(name) || { tags: [], text: "" };
  const penalties = watch("Penalties");
  const defense = watch("Defense");
  const scoringBehindReef = watch("Scoring Behind Reef");

  useEffect(() => {
    const newTags = [...value.tags];
    const hasPenalties = newTags.includes("Penalties");
    const hasDefense = newTags.includes("Defense");
    const hasScoringBehindReef = newTags.includes("Scoring Behind Reef");

    if (penalties === "Yes" && !hasPenalties) {
      newTags.push("Penalties");
      toast.success("Added 'Penalties' tag");
    } else if (penalties !== "Yes" && hasPenalties) {
      const index = newTags.indexOf("Penalties");
      newTags.splice(index, 1);
      toast.error("Removed 'Penalties' tag");
    }

    if (defense === "Yes" && !hasDefense) {
      newTags.push("Defense");
      toast.success("Added 'Defense' tag");
    } else if (defense !== "Yes" && hasDefense) {
      const index = newTags.indexOf("Defense");
      newTags.splice(index, 1);
      toast.error("Removed 'Defense' tag");
    }

    if (scoringBehindReef === "Yes" && !hasScoringBehindReef) {
      newTags.push("Scoring Behind Reef");
      toast.success("Added 'Scoring Behind Reef' tag");
    } else if (scoringBehindReef !== "Yes" && hasScoringBehindReef) {
      const index = newTags.indexOf("Scoring Behind Reef");
      newTags.splice(index, 1);
      toast.error("Removed 'Scoring Behind Reef' tag");
    }

    if (JSON.stringify(newTags) !== JSON.stringify(value.tags)) {
      setValue(name, { ...value, tags: newTags });
    }
  }, [penalties, defense, scoringBehindReef, value, setValue, name]);

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(name, { ...value, text: e.target.value });
  }

  function handleTagsChange(tags: string[]) {
    const addedTags = tags.filter((tag) => !value.tags.includes(tag));
    const removedTags = value.tags.filter((tag: string) => !tags.includes(tag));

    setValue(name, { ...value, tags });

    addedTags.forEach((tag) => toast.success(`Added '${tag}' tag`));
    removedTags.forEach((tag: string) => toast.error(`Removed '${tag}' tag`));

    const hasPenalties = tags.includes("Penalties");
    const hasDefense = tags.includes("Defense");
    const hasScoringBehindReef = tags.includes("Scoring Behind Reef");
    setValue("Penalties", hasPenalties ? "Yes" : "No");
    setValue("Defense", hasDefense ? "Yes" : "No");
    setValue("Scoring Behind Reef", hasScoringBehindReef ? "Yes" : "No");
  }

  function createTag(inputValue: string): string {
    const newTag = inputValue;
    setAvailableTags([...availableTags, newTag]);
    toast.success(`Created new tag: '${newTag}'`);
    return newTag;
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
              <Textarea
                onChange={handleTextChange}
                placeholder="Notes..."
                value={value.text}
              />
              <TagSelector
                availableTags={availableTags}
                createTag={createTag}
                onChange={handleTagsChange}
                selectedTags={value.tags}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
