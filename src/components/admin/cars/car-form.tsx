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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-10">
      <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Identité</h2>
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
          <Field label="Slug" required error={errors.slug?.message} hint="lettres, chiffres, tirets">
            <div className="flex gap-2">
              <Input {...register("slug")} error={!!errors.slug} />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setValue("slug", buildCarSlug(brand, model, trim))}
              >
                Auto
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
      </section>

      <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Spécifications</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Puissance" required error={errors.power?.message}>
            <NumberInput {...register("power", { valueAsNumber: true })} unit="ch" error={!!errors.power} />
          </Field>
          <Field label="Transmission" required error={errors.transmission?.message}>
            <Select {...register("transmission")} options={TRANSMISSION_OPTIONS} error={!!errors.transmission} />
          </Field>
          <Field label="Carburant" required error={errors.fuelType?.message}>
            <Select {...register("fuelType")} options={FUEL_OPTIONS} error={!!errors.fuelType} />
          </Field>
          <Field label="Sièges" required error={errors.seats?.message}>
            <NumberInput {...register("seats", { valueAsNumber: true })} error={!!errors.seats} min={2} max={9} />
          </Field>
          <Field label="Portes" required error={errors.doors?.message}>
            <NumberInput {...register("doors", { valueAsNumber: true })} error={!!errors.doors} min={2} max={5} />
          </Field>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Tarifs</h2>
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
      </section>

      <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Conditions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Âge min du conducteur" required error={errors.minDriverAge?.message}>
            <NumberInput
              {...register("minDriverAge", { valueAsNumber: true })}
              unit="ans"
              error={!!errors.minDriverAge}
            />
          </Field>
          <Field label="Années de permis min" required error={errors.minLicenseYears?.message}>
            <NumberInput
              {...register("minLicenseYears", { valueAsNumber: true })}
              unit="ans"
              error={!!errors.minLicenseYears}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Présentation</h2>
        <Field label="Description" required error={errors.description?.message}>
          <Textarea {...register("description")} error={!!errors.description} rows={6} />
        </Field>
        <Field label="Points forts" hint="8 max, appuyer Entrée pour ajouter">
          <Controller
            control={control}
            name="highlights"
            render={({ field }) => (
              <TagsInput value={field.value} onChange={field.onChange} maxItems={8} />
            )}
          />
        </Field>
        <Field label="Équipements détaillés" hint="10 max">
          <Controller
            control={control}
            name="features"
            render={({ field }) => (
              <FeaturesEditor value={field.value} onChange={field.onChange} maxItems={10} />
            )}
          />
        </Field>
      </section>

      <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Médias</h2>
        <Field label="Image principale" required error={errors.mainImage?.message}>
          <Controller
            control={control}
            name="mainImage"
            render={({ field }) => (
              <ImagePicker value={field.value} onChange={field.onChange} folder={uploadFolder} />
            )}
          />
        </Field>
        <Field label="Galerie" hint="12 max, glisser pour réordonner">
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
                placeholder="https://..."
              />
            )}
          />
        </Field>
      </section>

      <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Visibilité</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Statut" required error={errors.status?.message}>
            <Select {...register("status")} options={STATUS_OPTIONS} error={!!errors.status} />
          </Field>
          <Field label="Mise en avant">
            <Controller
              control={control}
              name="isFeatured"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="Mise en avant"
                />
              )}
            />
          </Field>
          <Field
            label="Ordre d'affichage"
            error={errors.displayOrder?.message}
            hint={mode === "create" ? "Réglable depuis la liste" : undefined}
          >
            <NumberInput
              {...register("displayOrder", { valueAsNumber: true })}
              error={!!errors.displayOrder}
              disabled={mode === "create"}
            />
          </Field>
        </div>
      </section>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {mode === "create" ? "Créer le véhicule" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
