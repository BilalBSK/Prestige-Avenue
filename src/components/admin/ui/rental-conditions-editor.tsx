"use client";

import {
  RENTAL_CONDITION_PRESETS,
  type RentalCondition,
} from "@/lib/cars/conditions";
import { Button } from "./button";
import { Field } from "./field";
import { Input } from "./input";

/**
 * Côté formulaire, la note peut transiter sous forme `null`/`undefined`
 * (schéma `nullish`). On la manipule toujours comme une chaîne dans l'éditeur.
 */
type ConditionDraft = {
  label: string;
  value: string;
  hint?: string | null;
};

/** Erreur de validation d'une ligne (forme react-hook-form, volontairement souple). */
type ConditionFieldErrors = {
  label?: { message?: string };
  value?: { message?: string };
  hint?: { message?: string };
};

interface RentalConditionsEditorProps {
  value: ConditionDraft[];
  onChange: (items: RentalCondition[]) => void;
  maxItems?: number;
  /**
   * Erreurs par ligne, indexées comme `value`. Typé en index numérique plutôt
   * qu'en tableau : react-hook-form expose les erreurs de tableau sous une
   * forme `Merge<FieldError, …[]>` (indexable mais sans `length` garanti).
   */
  errors?: { readonly [index: number]: ConditionFieldErrors | undefined };
}

export function RentalConditionsEditor({
  value,
  onChange,
  maxItems = 12,
  errors,
}: RentalConditionsEditorProps) {
  const items: RentalCondition[] = value.map((item) => ({
    label: item.label,
    value: item.value,
    hint: item.hint ?? "",
  }));

  function update(index: number, patch: Partial<RentalCondition>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function add(preset?: RentalCondition) {
    if (items.length >= maxItems) return;
    onChange([...items, preset ? { ...preset } : { label: "", value: "", hint: "" }]);
  }

  // Présélections encore disponibles (mêmes intitulés déjà ajoutés exclus),
  // proposées en un clic tant que la liste n'est pas pleine.
  const usedLabels = new Set(
    items.map((c) => c.label.trim().toLowerCase()).filter(Boolean),
  );
  const availablePresets = RENTAL_CONDITION_PRESETS.filter(
    (p) => !usedLabels.has(p.label.toLowerCase()),
  );
  const atMax = items.length >= maxItems;

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-[color:var(--admin-line-strong)] bg-[color:var(--admin-surface)] px-4 py-6 text-center">
          <p className="text-[0.8125rem] text-[color:var(--admin-text-soft)]">
            Aucune condition pour ce véhicule.
          </p>
          <p className="mt-1 text-[0.75rem] text-[color:var(--admin-text-muted)]">
            Ajoutez-en une depuis les modèles ci-dessous, ou créez-la librement.
          </p>
        </div>
      )}

      {items.map((item, i) => (
        <div
          key={i}
          className="space-y-3 rounded-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-surface)] p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-[0.75rem] font-medium text-[color:var(--admin-text-soft)]">
              Condition {i + 1}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="flex h-6 w-6 items-center justify-center rounded-md text-[color:var(--admin-text-muted)] transition-colors hover:bg-[color:var(--admin-surface-2)] hover:text-[color:var(--admin-text-soft)] disabled:pointer-events-none disabled:opacity-30"
                aria-label="Monter"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3.5 8.5L7 5l3.5 3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="flex h-6 w-6 items-center justify-center rounded-md text-[color:var(--admin-text-muted)] transition-colors hover:bg-[color:var(--admin-surface-2)] hover:text-[color:var(--admin-text-soft)] disabled:pointer-events-none disabled:opacity-30"
                aria-label="Descendre"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3.5 5.5L7 9l3.5-3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="ml-1 flex h-6 w-6 items-center justify-center rounded-md text-[color:var(--admin-text-muted)] transition-colors hover:bg-[color:var(--admin-danger-dim)] hover:text-[color:var(--admin-danger-soft)]"
                aria-label="Supprimer"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 3.5H11M5.5 3.5V2.5H8.5V3.5M4.5 3.5L5 11H9L9.5 3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Intitulé" error={errors?.[i]?.label?.message}>
              <Input
                value={item.label}
                onChange={(e) => update(i, { label: e.target.value })}
                placeholder="Âge minimum"
                error={!!errors?.[i]?.label}
              />
            </Field>
            <Field label="Valeur" error={errors?.[i]?.value?.message}>
              <Input
                value={item.value}
                onChange={(e) => update(i, { value: e.target.value })}
                placeholder="21 ans"
                error={!!errors?.[i]?.value}
              />
            </Field>
          </div>
          <Field label="Note" hint="Facultatif — précision affichée sous l'intitulé.">
            <Input
              value={item.hint ?? ""}
              onChange={(e) => update(i, { hint: e.target.value })}
              placeholder="Âge requis du conducteur principal."
            />
          </Field>
        </div>
      ))}

      {!atMax && availablePresets.length > 0 && (
        <div className="rounded-lg border border-[color:var(--admin-line)] bg-[color:var(--admin-surface)] p-3">
          <p className="mb-2 text-[0.75rem] text-[color:var(--admin-text-muted)]">
            Ajouter une condition courante :
          </p>
          <div className="flex flex-wrap gap-1.5">
            {availablePresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => add(preset)}
                className="inline-flex items-center gap-1 rounded-full border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)] px-2.5 py-1 text-[0.75rem] text-[color:var(--admin-text-soft)] transition-colors hover:border-[color:var(--admin-accent)]/60 hover:text-[color:var(--admin-text)]"
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M6 2.5V9.5M2.5 6H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-[0.75rem] text-[color:var(--admin-text-muted)]">
          <span className="admin-tabular text-[color:var(--admin-text-soft)]">{items.length}</span>
          <span className="mx-1">/</span>
          <span className="admin-tabular">{maxItems}</span>
        </p>
        {!atMax && (
          <Button type="button" variant="secondary" size="sm" onClick={() => add()}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M6 2.5V9.5M2.5 6H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Condition personnalisée
          </Button>
        )}
      </div>
    </div>
  );
}
