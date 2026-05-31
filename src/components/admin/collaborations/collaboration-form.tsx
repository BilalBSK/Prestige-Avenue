"use client";

import { Button } from "@/components/admin/ui/button";
import { CollaborationPhotoGallery } from "@/components/admin/ui/collaboration-photo-gallery";
import { Field } from "@/components/admin/ui/field";
import { Input } from "@/components/admin/ui/input";
import { NumberInput } from "@/components/admin/ui/number-input";
import { Switch } from "@/components/admin/ui/switch";
import { toast } from "@/components/admin/ui/toast";
import {
  createCollaboration,
  updateCollaboration,
} from "@/server/admin/collaborations.actions";
import {
  collaborationFormSchema,
  type CollaborationInput,
} from "@/server/admin/collaborations.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";

interface CollaborationFormProps {
  mode: "create" | "edit";
  collaborationId?: string;
  initial: CollaborationInput;
  uploadFolder: string;
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)]">
      <header className="border-b border-[color:var(--admin-line)] px-5 py-4">
        <h2 className="text-[0.9375rem] font-semibold text-[color:var(--admin-text)]">{title}</h2>
        {description && (
          <p className="mt-0.5 text-[0.8125rem] text-[color:var(--admin-text-soft)]">
            {description}
          </p>
        )}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function CollaborationForm({
  mode,
  collaborationId,
  initial,
  uploadFolder,
}: CollaborationFormProps) {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CollaborationInput>({
    resolver: zodResolver(collaborationFormSchema),
    defaultValues: initial,
  });

  async function onSubmit(values: CollaborationInput) {
    try {
      if (mode === "create") {
        await createCollaboration(values);
        toast.success("Collaboration ajoutée.");
        router.replace("/admin/collaborations");
      } else if (collaborationId) {
        await updateCollaboration(collaborationId, values);
        toast.success("Modifications enregistrées.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur.";
      toast.error(msg);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-24">
      <FormSection
        title="Partenaire"
        description="Le crédit affiché en surimpression sur chaque photo du carrousel."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nom du partenaire" required error={errors.partnerName?.message}>
            <Input {...register("partnerName")} error={!!errors.partnerName} placeholder="@studio.lumiere" />
          </Field>
          <Field
            label="Lien (Instagram, site…)"
            error={errors.partnerUrl?.message}
            hint="Rend le crédit cliquable. Optionnel."
          >
            <Controller
              control={control}
              name="partnerUrl"
              render={({ field }) => (
                <Input
                  type="url"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                  error={!!errors.partnerUrl}
                  placeholder="https://instagram.com/…"
                />
              )}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Photos"
        description="20 maximum · glisser pour réordonner · portrait et paysage acceptés."
      >
        <Field label="Galerie" required error={errors.photos?.message}>
          <Controller
            control={control}
            name="photos"
            render={({ field }) => (
              <CollaborationPhotoGallery
                value={field.value}
                onChange={field.onChange}
                folder={uploadFolder}
              />
            )}
          />
        </Field>
      </FormSection>

      <FormSection title="Publication" description="Visibilité sur la page Partenaires.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Publiée">
            <Controller
              control={control}
              name="isPublished"
              render={({ field }) => (
                <div className="flex h-9 items-center">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Publier la collaboration"
                  />
                </div>
              )}
            />
          </Field>
          <Field
            label="Ordre d'affichage"
            error={errors.displayOrder?.message}
            hint={mode === "create" ? "Ajustable depuis la liste" : undefined}
          >
            <NumberInput
              {...register("displayOrder", { valueAsNumber: true })}
              error={!!errors.displayOrder}
              disabled={mode === "create"}
            />
          </Field>
        </div>
      </FormSection>

      <div className="sticky bottom-0 z-10 -mx-6 border-t border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg)]/95 px-6 py-3 backdrop-blur lg:-mx-8 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-end gap-2">
          <Button type="button" variant="secondary" size="lg" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button type="submit" size="lg" loading={isSubmitting}>
            {mode === "create" ? "Créer la collaboration" : "Enregistrer"}
          </Button>
        </div>
      </div>
    </form>
  );
}
