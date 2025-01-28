/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState, useEffect } from "react";

import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/form";
import { TagSelector } from "~/tag-selector";
import { Textarea } from "~/textarea";

type TNotesFieldProps = {
  name: string;
  label: string;
};

const predefinedTags = ["Penalties", "Defense", "Scoring Behind Reef"];

export function NotesField({ name, label }: TNotesFieldProps) {
  const { control, setValue, watch } = useFormContext();
  const [availableTags, setAvailableTags] = useState<string[]>([
    ...predefinedTags,
  ]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = watch(name) || { text: "", tags: [] };
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
    } else if (penalties !== "Yes" && hasPenalties) {
      const index = newTags.indexOf("Penalties");
      newTags.splice(index, 1);
    }

    if (defense === "Yes" && !hasDefense) {
      newTags.push("Defense");
    } else if (defense !== "Yes" && hasDefense) {
      const index = newTags.indexOf("Defense");
      newTags.splice(index, 1);
    }

    if (scoringBehindReef === "Yes" && !hasScoringBehindReef) {
      newTags.push("Scoring Behind Reef");
    } else if (scoringBehindReef !== "Yes" && hasScoringBehindReef) {
      const index = newTags.indexOf("Scoring Behind Reef");
      newTags.splice(index, 1);
    }

    if (JSON.stringify(newTags) !== JSON.stringify(value.tags)) {
      setValue(name, { ...value, tags: newTags });
    }
  }, [penalties, defense, scoringBehindReef, value, setValue, name]);

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(name, { ...value, text: e.target.value });
  }

  function handleTagsChange(tags: string[]) {
    setValue(name, { ...value, tags });

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
                placeholder="Enter your notes here..."
                value={value.text}
                onChange={handleTextChange}
              />
              <TagSelector
                availableTags={availableTags}
                selectedTags={value.tags}
                onChange={handleTagsChange}
                createTag={createTag}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
