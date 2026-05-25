"use client";

import { Button } from "./button";
import { Field } from "./field";
import { Input } from "./input";
import { Textarea } from "./textarea";

export interface FeatureItem {
  title: string;
  body: string;
}

interface FeaturesEditorProps {
  value: FeatureItem[];
  onChange: (items: FeatureItem[]) => void;
  maxItems?: number;
}

export function FeaturesEditor({ value, onChange, maxItems = 10 }: FeaturesEditorProps) {
  function update(index: number, patch: Partial<FeatureItem>) {
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function add() {
    if (value.length >= maxItems) return;
    onChange([...value, { title: "", body: "" }]);
  }

  return (
    <div className="space-y-3">
      {value.map((item, i) => (
        <div
          key={i}
          className="space-y-3 rounded-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-surface)] p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-[0.75rem] font-medium text-[color:var(--admin-text-soft)]">
              Équipement {i + 1}
            </span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-[color:var(--admin-text-muted)] transition-colors hover:bg-[color:var(--admin-danger-dim)] hover:text-[color:var(--admin-danger-soft)]"
              aria-label="Supprimer"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 3.5H11M5.5 3.5V2.5H8.5V3.5M4.5 3.5L5 11H9L9.5 3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <Field label="Intitulé">
            <Input
              value={item.title}
              onChange={(e) => update(i, { title: e.target.value })}
              placeholder="Sécurité augmentée"
            />
          </Field>
          <Field label="Description">
            <Textarea
              rows={2}
              value={item.body}
              onChange={(e) => update(i, { body: e.target.value })}
              placeholder="Expliquez cet équipement en 1-2 phrases."
            />
          </Field>
        </div>
      ))}
      <div className="flex items-center justify-between">
        <p className="text-[0.75rem] text-[color:var(--admin-text-muted)]">
          <span className="admin-tabular text-[color:var(--admin-text-soft)]">{value.length}</span>
          <span className="mx-1">/</span>
          <span className="admin-tabular">{maxItems}</span>
        </p>
        {value.length < maxItems && (
          <Button type="button" variant="secondary" size="sm" onClick={add}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M6 2.5V9.5M2.5 6H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Ajouter
          </Button>
        )}
      </div>
    </div>
  );
}
