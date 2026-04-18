"use client";

import { useCsrfToken } from "@/hooks/use-csrf-token";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateCarForm() {
  const csrfToken = useCsrfToken();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      brand: String(formData.get("brand") ?? ""),
      model: String(formData.get("model") ?? ""),
      year: Number(formData.get("year") ?? 0),
      pricePerDay: Number(formData.get("pricePerDay") ?? 0),
      weekendPrice: formData.get("weekendPrice")
        ? Number(formData.get("weekendPrice"))
        : null,
      depositAmount: Number(formData.get("depositAmount") ?? 0),
      description: String(formData.get("description") ?? ""),
      mainImage: String(formData.get("mainImage") ?? ""),
      galleryImages: String(formData.get("galleryImages") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      videoUrl: formData.get("videoUrl") ? String(formData.get("videoUrl")) : null,
      status: String(formData.get("status") ?? "AVAILABLE"),
    };

    const response = await fetch("/api/admin/cars", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setErrorMessage(data.error ?? "Creation impossible.");
      setIsSubmitting(false);
      return;
    }

    event.currentTarget.reset();
    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <h3 className="text-lg font-semibold text-white">Ajouter un vehicule</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <input name="brand" placeholder="Marque" className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-zinc-100" required />
        <input name="model" placeholder="Modele" className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-zinc-100" required />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <input type="number" name="year" placeholder="Annee" className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-zinc-100" required />
        <input type="number" name="pricePerDay" step="0.01" placeholder="Prix / jour" className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-zinc-100" required />
        <input type="number" name="weekendPrice" step="0.01" placeholder="Prix weekend (optionnel)" className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-zinc-100" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <input type="number" name="depositAmount" step="0.01" placeholder="Caution" className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-zinc-100" required />
        <select name="status" className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-zinc-100">
          <option value="AVAILABLE">AVAILABLE</option>
          <option value="MAINTENANCE">MAINTENANCE</option>
          <option value="DISABLED">DISABLED</option>
        </select>
      </div>
      <textarea name="description" placeholder="Description" className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-zinc-100" rows={4} required />
      <input name="mainImage" placeholder="URL image principale" className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-zinc-100" required />
      <input name="galleryImages" placeholder="URLs galerie separees par virgule" className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-zinc-100" />
      <input name="videoUrl" placeholder="URL video (optionnel)" className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-zinc-100" />
      {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}
      <button
        type="submit"
        disabled={isSubmitting || !csrfToken}
        className="rounded-md bg-amber-500 px-4 py-2 font-medium text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creation..." : "Ajouter"}
      </button>
    </form>
  );
}
