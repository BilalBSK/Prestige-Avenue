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
  placeholder = "Saisir puis Entrée",
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
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-surface)] px-2 py-1 text-[0.75rem] text-[color:var(--admin-text)]"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(value.filter((t) => t !== tag))}
                className="flex h-3.5 w-3.5 items-center justify-center rounded-sm text-[color:var(--admin-text-muted)] transition-colors hover:bg-[color:var(--admin-danger-dim)] hover:text-[color:var(--admin-danger-soft)]"
                aria-label={`Retirer ${tag}`}
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
      {value.length < maxItems && (
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
          placeholder={placeholder}
        />
      )}
      <p className="text-[0.75rem] text-[color:var(--admin-text-muted)]">
        <span className="admin-tabular text-[color:var(--admin-text-soft)]">{value.length}</span>
        <span className="mx-1">/</span>
        <span className="admin-tabular">{maxItems}</span>
        <span className="ml-2">équipements</span>
      </p>
    </div>
  );
}
