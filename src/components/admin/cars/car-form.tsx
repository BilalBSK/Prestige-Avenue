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
  title: string;
  description?: string;
  children: ReactNode;
}

function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="rounded-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)]">
      <header className="border-b border-[color:var(--admin-line)] px-5 py-4">
        <h2 className="text-[0.9375rem] font-semibold text-[color:var(--admin-text)]">
          {title}
        </h2>
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-24">
      <FormSection
        title="Identification"
        description="Informations affichées dans le catalogue et les réservations."
      >
        <div className="grid gap-4 md:grid-cols-2">
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
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input {...register("slug")} error={!!errors.slug} />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setValue("slug", buildCarSlug(brand, model, trim))}
              >
                Générer
              </Button>
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
        title="Spécifications"
        description="Données techniques visibles sur la fiche produit."
      >
        <div className="grid gap-4 md:grid-cols-3">
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
        title="Tarification"
        description="Tarifs affichés au client et forfait week-end optionnel."
      >
        <div className="grid gap-4 md:grid-cols-3">
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
        title="Éligibilité conducteur"
        description="Critères minimums pour louer ce véhicule."
      >
        <div className="grid gap-4 md:grid-cols-2">
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
        title="Présentation"
        description="Contenu lu par le client avant réservation."
      >
        <div className="space-y-4">
          <Field label="Description" required error={errors.description?.message}>
            <Textarea {...register("description")} error={!!errors.description} rows={5} />
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

      <FormSection title="Médias" description="Photographies et vidéo de présentation.">
        <div className="space-y-4">
          <Field
            label="Image principale"
            required
            error={errors.mainImage?.message}
            hint="Affichée en couverture du véhicule. Vous pouvez aussi la choisir depuis la galerie ci-dessous."
          >
            <Controller
              control={control}
              name="mainImage"
              render={({ field }) => (
                <ImagePicker value={field.value} onChange={field.onChange} folder={uploadFolder} />
              )}
            />
          </Field>
          <Field
            label="Galerie"
            hint="12 maximum · glisser pour réordonner · survolez une image pour la définir comme principale"
          >
            <Controller
              control={control}
              name="galleryImages"
              render={({ field }) => {
                const mainImage = watch("mainImage");
                return (
                  <MediaGallery
                    value={field.value}
                    onChange={field.onChange}
                    folder={uploadFolder}
                    mainImage={mainImage}
                    onSetMain={(url) => setValue("mainImage", url, { shouldDirty: true, shouldValidate: true })}
                  />
                );
              }}
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

      <FormSection title="Publication" description="Visibilité du véhicule sur le site public.">
        <div className="grid gap-4 md:grid-cols-3">
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
                <div className="flex h-9 items-center">
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

      <div className="sticky bottom-0 z-10 -mx-6 border-t border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg)]/95 px-6 py-3 backdrop-blur lg:-mx-8 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-end gap-2">
          <Button type="button" variant="secondary" size="lg" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button type="submit" size="lg" loading={isSubmitting}>
            {mode === "create" ? "Créer le véhicule" : "Enregistrer"}
          </Button>
        </div>
      </div>
    </form>
  );
}
