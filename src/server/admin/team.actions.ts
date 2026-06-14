"use server";

import { requireAdminSessionOrRedirect } from "@/lib/admin-auth";
import { createAdmin, deleteAdmin } from "@/services/admin-team.service";
import { revalidatePath } from "next/cache";
import { createAdminSchema, type CreateAdminInput } from "./team.schema";

export async function createAdminUser(
  input: CreateAdminInput,
): Promise<{ id: string }> {
  await requireAdminSessionOrRedirect();
  const parsed = createAdminSchema.parse(input);

  const created = await createAdmin(parsed);
  revalidatePath("/admin/team");
  return { id: created.id };
}

export async function deleteAdminUser(targetId: string): Promise<void> {
  const session = await requireAdminSessionOrRedirect();
  // `session.user.id` est peuplé par le callback `session` (cf. src/lib/auth.ts).
  // La garde anti-auto-suppression vit dans le service, mais on a besoin de
  // l'identité de l'appelant pour la faire respecter côté serveur.
  await deleteAdmin(targetId, session.user.id);
  revalidatePath("/admin/team");
}
