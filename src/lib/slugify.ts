export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildCarSlug(brand: string, model: string, trim?: string | null): string {
  const parts = [brand, model, trim].filter(Boolean).join(" ");
  return slugify(parts);
}
