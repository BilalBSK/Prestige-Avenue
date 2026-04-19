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
    <div className="space-y-4">
      {value.map((item, i) => (
        <div
          key={i}
          className="relative space-y-4 border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)]/50 p-6"
        >
          <div className="flex items-center justify-between border-b border-[color:var(--admin-line)] pb-3">
            <span className="admin-mono text-[0.62rem] uppercase tracking-[0.32em] text-[color:var(--admin-accent)]">
              Équipement · {String(i + 1).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="admin-mono text-[0.6rem] uppercase tracking-[0.28em] text-[color:var(--admin-text-muted)] transition-colors duration-200 hover:text-[color:var(--admin-danger-soft)]"
            >
              Supprimer
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
              rows={3}
              value={item.body}
              onChange={(e) => update(i, { body: e.target.value })}
              placeholder="Expliquez cet équipement en 1-2 phrases."
            />
          </Field>
        </div>
      ))}
      <div className="flex items-center justify-between border-t border-[color:var(--admin-line)] pt-4">
        <p className="admin-mono text-[0.62rem] uppercase tracking-[0.32em] text-[color:var(--admin-text-muted)]">
          <span className="admin-tabular text-[color:var(--admin-text)]">
            {String(value.length).padStart(2, "0")}
          </span>
          <span className="mx-2 text-[color:var(--admin-text-muted)]/50">/</span>
          <span className="admin-tabular">{String(maxItems).padStart(2, "0")}</span>
        </p>
        {value.length < maxItems && (
          <Button type="button" variant="secondary" size="sm" onClick={add}>
            + Ajouter un équipement
          </Button>
        )}
      </div>
    </div>
  );
}
