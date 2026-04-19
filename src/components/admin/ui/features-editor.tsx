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
        <div key={i} className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
          <Field label={`Titre ${i + 1}`}>
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
          <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}>
            Supprimer cet équipement
          </Button>
        </div>
      ))}
      {value.length < maxItems && (
        <Button type="button" variant="secondary" size="sm" onClick={add}>
          + Ajouter un équipement
        </Button>
      )}
      <p className="text-xs text-zinc-500">
        {value.length}/{maxItems}
      </p>
    </div>
  );
}
