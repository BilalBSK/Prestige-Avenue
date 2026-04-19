"use client";

import { Button } from "@/components/admin/ui/button";
import { FeaturesEditor } from "@/components/admin/ui/features-editor";
import { Field } from "@/components/admin/ui/field";
import { ImagePicker } from "@/components/admin/ui/image-picker";
import { Input } from "@/components/admin/ui/input";
import { MediaGallery } from "@/components/admin/ui/media-gallery";
import { NumberInput } from "@/components/admin/ui/number-input";
import { Select } from "@/components/admin/ui/select";
import { Switch } from "@/components/admin/ui/switch";
import { TagsInput } from "@/components/admin/ui/tags-input";
import { Textarea } from "@/components/admin/ui/textarea";
import { toast } from "@/components/admin/ui/toast";
import { buildCarSlug } from "@/lib/slugify";
import { createCar, updateCar } from "@/server/admin/cars.actions";
import { carFormSchema, type CarInput } from "@/server/admin/cars.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CarCategory, CarStatus, FuelType, Transmission } from "@prisma/client";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";

const CATEGORY_OPTIONS = Object.values(CarCategory).map((v) => ({ value: v, label: v }));
const TRANSMISSION_OPTIONS = Object.values(Transmission).map((v) => ({ value: v, label: v }));
const FUEL_OPTIONS = Object.values(FuelType).map((v) => ({ value: v, label: v }));
const STATUS_OPTIONS = Object.values(CarStatus).map((v) => ({ value: v, label: v }));

interface CarFormProps {
  mode: "create" | "edit";
  carId?: string;
  initial: CarInput;
  uploadFolder: string;
}

interface FormSectionProps {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  delay?: 1 | 2 | 3 | 4;
}

function FormSection({ index, eyebrow, title, description, children, delay }: FormSectionProps) {
  const delayClass = delay ? `admin-fade-up-d${delay}` : "";
  return (
    <section
      className={`admin-fade-up ${delayClass} border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)]/40`}
    >
      <header className="grid gap-6 border-b border-[color:var(--admin-line)] px-8 py-6 md:grid-cols-[auto_1fr]">
        <div className="flex items-baseline gap-4">
          <span className="admin-mono admin-tabular text-[0.7rem] uppercase tracking-[0.32em] text-[color:var(--admin-accent)]">
            {index}
          </span>
          <span className="admin-mono text-[0.58rem] uppercase tracking-[0.36em] text-[color:var(--admin-text-muted)]">
            {eyebrow}
          </span>
        </div>
        <div>
          <h2 className="admin-serif text-[1.35rem] font-normal leading-tight tracking-tight text-[color:var(--admin-text)]">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-[0.85rem] leading-relaxed text-[color:var(--admin-text-muted)]">
              {description}
            </p>
          )}
        </div>
      </header>
      <div className="px-8 py-8">{children}</div>
    </section>
  );
}

export function CarForm({ mode, carId, initial, uploadFolder }: CarFormProps) {
  const router = useRouter();
  const form = useForm<CarInput>({
    resolver: zodResolver(carFormSchema),
    defaultValues: initial,
  });
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const brand = watch("brand");
  const model = watch("model");
  const trim = watch("trim");

  async function onSubmit(values: CarInput) {
    try {
      if (mode === "create") {
        await createCar(values);
        toast.success("Véhicule ajouté.");
        router.replace("/admin/cars");
      } else if (carId) {
        await updateCar(carId, values);
        toast.success("Modifications enregistrées.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur.";
      toast.error(msg);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-32">
      <FormSection
        index="01"
        eyebrow="Identification"
        title="Identité du véhicule"
        description="Informations de base affichées dans le catalogue et les réservations."
        delay={1}
      >
        <div className="grid gap-x-8 gap-y-7 md:grid-cols-2">
          <Field label="Marque" required error={errors.brand?.message}>
            <Input {...register("brand")} error={!!errors.brand} />
          </Field>
          <Field label="Modèle" required error={errors.model?.message}>
            <Input {...register("model")} error={!!errors.model} />
          </Field>
          <Field label="Finition" error={errors.trim?.message}>
            <Input {...register("trim")} error={!!errors.trim} />
          </Field>
          <Field label="Année" required error={errors.year?.message}>
            <NumberInput
              {...register("year", { valueAsNumber: true })}
              error={!!errors.year}
              min={1990}
              max={2030}
            />
          </Field>
          <Field
            label="Slug"
            required
            error={errors.slug?.message}
            hint="lettres minuscules, chiffres, tirets"
          >
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Input {...register("slug")} error={!!errors.slug} />
              </div>
              <button
                type="button"
                onClick={() => setValue("slug", buildCarSlug(brand, model, trim))}
                className="admin-mono shrink-0 py-2 text-[0.6rem] uppercase tracking-[0.28em] text-[color:var(--admin-accent)] transition-opacity duration-200 hover:opacity-70"
              >
                Générer
              </button>
            </div>
          </Field>
          <Field label="Catégorie" required error={errors.category?.message}>
            <Select
              {...register("category")}
              options={CATEGORY_OPTIONS}
              error={!!errors.category}
            />
          </Field>
          <Field label="Accroche courte" error={errors.shortTagline?.message}>
            <Input {...register("shortTagline")} error={!!errors.shortTagline} />
          </Field>
        </div>
      </FormSection>

      <FormSection
        index="02"
        eyebrow="Spécifications"
        title="Moteur & configuration"
        description="Données techniques visibles sur la fiche produit."
        delay={2}
      >
        <div className="grid gap-x-8 gap-y-7 md:grid-cols-3">
          <Field label="Puissance" required error={errors.power?.message}>
            <NumberInput
              {...register("power", { valueAsNumber: true })}
              unit="ch"
              error={!!errors.power}
            />
          </Field>
          <Field label="Transmission" required error={errors.transmission?.message}>
            <Select
              {...register("transmission")}
              options={TRANSMISSION_OPTIONS}
              error={!!errors.transmission}
            />
          </Field>
          <Field label="Carburant" required error={errors.fuelType?.message}>
            <Select
              {...register("fuelType")}
              options={FUEL_OPTIONS}
              error={!!errors.fuelType}
            />
          </Field>
          <Field label="Sièges" required error={errors.seats?.message}>
            <NumberInput
              {...register("seats", { valueAsNumber: true })}
              error={!!errors.seats}
              min={2}
              max={9}
            />
          </Field>
          <Field label="Portes" required error={errors.doors?.message}>
            <NumberInput
              {...register("doors", { valueAsNumber: true })}
              error={!!errors.doors}
              min={2}
              max={5}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        index="03"
        eyebrow="Tarification"
        title="Grille tarifaire"
        description="Tarifs affichés au client et forfait week-end optionnel."
        delay={3}
      >
        <div className="grid gap-x-8 gap-y-7 md:grid-cols-3">
          <Field label="Prix / jour" required error={errors.pricePerDay?.message}>
            <NumberInput
              {...register("pricePerDay", { valueAsNumber: true })}
              unit="€"
              step="0.01"
              error={!!errors.pricePerDay}
            />
          </Field>
          <Field label="Prix / km" error={errors.pricePerKm?.message}>
            <Controller
              control={control}
              name="pricePerKm"
              render={({ field }) => (
                <NumberInput
                  unit="€/km"
                  step="0.01"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value === "" ? null : Number(e.target.value))
                  }
                  error={!!errors.pricePerKm}
                />
              )}
            />
          </Field>
          <Field label="Km inclus / jour" error={errors.includedKmPerDay?.message}>
            <Controller
              control={control}
              name="includedKmPerDay"
              render={({ field }) => (
                <NumberInput
                  unit="km"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value === "" ? null : Number(e.target.value))
                  }
                  error={!!errors.includedKmPerDay}
                />
              )}
            />
          </Field>
          <Field label="Forfait week-end 72h" error={errors.weekendPackagePrice?.message}>
            <Controller
              control={control}
              name="weekendPackagePrice"
              render={({ field }) => (
                <NumberInput
                  unit="€"
                  step="0.01"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value === "" ? null : Number(e.target.value))
                  }
                  error={!!errors.weekendPackagePrice}
                />
              )}
            />
          </Field>
          <Field label="Km inclus week-end" error={errors.weekendPackageIncludedKm?.message}>
            <Controller
              control={control}
              name="weekendPackageIncludedKm"
              render={({ field }) => (
                <NumberInput
                  unit="km"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value === "" ? null : Number(e.target.value))
                  }
                  error={!!errors.weekendPackageIncludedKm}
                />
              )}
            />
          </Field>
          <Field label="Caution" required error={errors.depositAmount?.message}>
            <NumberInput
              {...register("depositAmount", { valueAsNumber: true })}
              unit="€"
              step="0.01"
              error={!!errors.depositAmount}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        index="04"
        eyebrow="Conditions"
        title="Éligibilité conducteur"
        description="Critères minimums pour louer ce véhicule."
        delay={4}
      >
        <div className="grid gap-x-8 gap-y-7 md:grid-cols-2">
          <Field label="Âge minimum" required error={errors.minDriverAge?.message}>
            <NumberInput
              {...register("minDriverAge", { valueAsNumber: true })}
              unit="ans"
              error={!!errors.minDriverAge}
            />
          </Field>
          <Field label="Permis depuis" required error={errors.minLicenseYears?.message}>
            <NumberInput
              {...register("minLicenseYears", { valueAsNumber: true })}
              unit="ans"
              error={!!errors.minLicenseYears}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        index="05"
        eyebrow="Présentation"
        title="Récit & équipements"
        description="Ce que le client lit avant de réserver."
      >
        <div className="space-y-7">
          <Field label="Description" required error={errors.description?.message}>
            <Textarea {...register("description")} error={!!errors.description} rows={6} />
          </Field>
          <Field label="Points forts" hint="8 maximum · Entrée pour valider">
            <Controller
              control={control}
              name="highlights"
              render={({ field }) => (
                <TagsInput value={field.value} onChange={field.onChange} maxItems={8} />
              )}
            />
          </Field>
          <Field label="Équipements détaillés" hint="10 maximum">
            <Controller
              control={control}
              name="features"
              render={({ field }) => (
                <FeaturesEditor value={field.value} onChange={field.onChange} maxItems={10} />
              )}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection index="06" eyebrow="Médias" title="Photographies & vidéo">
        <div className="space-y-8">
          <Field label="Image principale" required error={errors.mainImage?.message}>
            <Controller
              control={control}
              name="mainImage"
              render={({ field }) => (
                <ImagePicker value={field.value} onChange={field.onChange} folder={uploadFolder} />
              )}
            />
          </Field>
          <Field label="Galerie" hint="12 maximum · glisser pour réordonner">
            <Controller
              control={control}
              name="galleryImages"
              render={({ field }) => (
                <MediaGallery value={field.value} onChange={field.onChange} folder={uploadFolder} />
              )}
            />
          </Field>
          <Field label="URL vidéo" error={errors.videoUrl?.message}>
            <Controller
              control={control}
              name="videoUrl"
              render={({ field }) => (
                <Input
                  type="url"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                  error={!!errors.videoUrl}
                  placeholder="https://…"
                />
              )}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection index="07" eyebrow="Publication" title="Visibilité publique">
        <div className="grid gap-x-8 gap-y-7 md:grid-cols-3">
          <Field label="Statut" required error={errors.status?.message}>
            <Select
              {...register("status")}
              options={STATUS_OPTIONS}
              error={!!errors.status}
            />
          </Field>
          <Field label="Mise en vitrine">
            <Controller
              control={control}
              name="isFeatured"
              render={({ field }) => (
                <div className="flex h-11 items-center">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Mise en vitrine"
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

      <div className="admin-divider" />

      <div className="sticky bottom-0 z-10 -mx-6 border-t border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg)]/90 px-6 py-5 backdrop-blur-md md:-mx-10 md:px-10 lg:-mx-14 lg:px-14">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4">
          <p className="admin-mono text-[0.6rem] uppercase tracking-[0.32em] text-[color:var(--admin-text-muted)]">
            {mode === "create" ? "Nouveau véhicule · brouillon" : "Fiche modifiable"}
          </p>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {mode === "create" ? "Créer le véhicule" : "Enregistrer"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
