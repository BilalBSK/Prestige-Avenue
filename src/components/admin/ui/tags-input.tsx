"use client";

import { KeyboardEvent, useState } from "react";
import { Input } from "./input";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  maxItems?: number;
  placeholder?: string;
}

export function TagsInput({
  value,
  onChange,
  maxItems = 8,
  placeholder = "Ajouter puis Entrée",
}: TagsInputProps) {
  const [draft, setDraft] = useState("");

  function commit() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) {
      setDraft("");
      return;
    }
    if (value.length >= maxItems) return;
    onChange([...value, trimmed]);
    setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="text-zinc-500 hover:text-zinc-100"
              aria-label={`Retirer ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      {value.length < maxItems && (
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
          placeholder={placeholder}
        />
      )}
      <p className="text-xs text-zinc-500">
        {value.length}/{maxItems}
      </p>
    </div>
  );
}
