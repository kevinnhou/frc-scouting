"use client";

import React, { useState } from "react";

import { cn } from "@/lib/utils";

import { Check, ChevronsUpDown, X } from "lucide-react";

import { Button } from "~/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/command";
import { Popover, PopoverContent, PopoverTrigger } from "~/popover";

interface TagSelectorProps {
  availableTags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  createTag: (inputValue: string) => string;
  className?: string;
}

export function TagSelector({
  availableTags,
  selectedTags,
  onChange,
  createTag,
  className,
}: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const filteredTags = availableTags.filter(
    (tag) =>
      tag.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedTags.includes(tag)
  );

  const handleSelect = (value: string) => {
    onChange([...selectedTags, value]);
    setInputValue("");
  };

  const handleCreate = () => {
    const newTag = createTag(inputValue);
    onChange([...selectedTags, newTag]);
    setInputValue("");
  };

  const handleRemove = (tag: string) => {
    onChange(selectedTags.filter((t) => t !== tag));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex flex-wrap gap-[2px] mt-1 py-[2px] pl-[2px] pr-3 h-auto w-full text-left items-center justify-start min-h-9",
            className,
            selectedTags.length > 0 && "hover:bg-background"
          )}
        >
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-sm break-words"
            >
              {tag}
              <span
                role="button"
                tabIndex={0}
                className="cursor-pointer hover:bg-red-400/40 p-0.5 rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(tag);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleRemove(tag);
                  }
                }}
              >
                <X size={12} />
              </span>
            </span>
          ))}
          <span className="flex-grow" />
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Enter tag..."
            value={inputValue}
            onValueChange={(value) => setInputValue(value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputValue.trim() !== "") {
                handleCreate();
              }
            }}
          />
          <CommandList>
            <CommandEmpty>No tags found.</CommandEmpty>
            <CommandGroup heading="Tags">
              {filteredTags.map((tag) => (
                <CommandItem key={tag} value={tag} onSelect={handleSelect}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedTags.includes(tag) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {tag}
                </CommandItem>
              ))}
            </CommandGroup>
            {inputValue.trim() !== "" &&
              !availableTags.includes(inputValue.toLowerCase()) && (
                <CommandGroup heading="Create Tag">
                  <CommandItem value={inputValue} onSelect={handleCreate}>
                    <Check className="mr-2 h-4 w-4 opacity-100" />
                    Create "{inputValue}"
                  </CommandItem>
                </CommandGroup>
              )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
