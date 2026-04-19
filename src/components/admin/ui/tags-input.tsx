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
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="group inline-flex items-center gap-2 border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)] px-3 py-1.5 text-[0.78rem] text-[color:var(--admin-text)] transition-colors duration-300 hover:border-[color:var(--admin-accent)]"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(value.filter((t) => t !== tag))}
                className="text-[color:var(--admin-text-muted)] transition-colors duration-200 hover:text-[color:var(--admin-danger-soft)]"
                aria-label={`Retirer ${tag}`}
              >
                ×
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
      <p className="admin-mono text-[0.62rem] uppercase tracking-[0.32em] text-[color:var(--admin-text-muted)]">
        <span className="admin-tabular text-[color:var(--admin-text)]">
          {String(value.length).padStart(2, "0")}
        </span>
        <span className="mx-2 text-[color:var(--admin-text-muted)]/50">/</span>
        <span className="admin-tabular">{String(maxItems).padStart(2, "0")}</span>
      </p>
    </div>
  );
}
