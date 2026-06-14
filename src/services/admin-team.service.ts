import { prisma } from "@/lib/prisma";
import { Prisma, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { CreateAdminInput } from "@/server/admin/team.schema";

/**
 * Gestion des comptes administrateurs du back-office.
 *
 * Règles de sécurité tenues ici (et pas dans l'UI, pour qu'elles soient
 * inviolables) :
 *  - l'e-mail est unique et normalisé en minuscules (cohérent avec l'auth) ;
 *  - on ne peut jamais supprimer le dernier administrateur (sinon plus personne
 *    ne peut se connecter au back-office) ;
 *  - le hash du mot de passe n'est jamais renvoyé au client.
 */

/** Vue publique d'un administrateur — sans le hash du mot de passe. */
export interface AdminListItem {
  id: string;
  name: string;
  email: string | null;
  createdAt: Date;
}

/** Coût bcrypt — aligné sur le reste de l'application (auth, seed, register). */
const BCRYPT_COST = 12;

export async function listAdmins(): Promise<AdminListItem[]> {
  return prisma.user.findMany({
    where: { role: Role.ADMIN },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function countAdmins(): Promise<number> {
  return prisma.user.count({ where: { role: Role.ADMIN } });
}

/**
 * Crée un administrateur. Lève une erreur lisible si l'e-mail est déjà pris
 * (par un admin OU un client : l'e-mail est unique sur toute la table User).
 */
export async function createAdmin(input: CreateAdminInput): Promise<AdminListItem> {
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);

  try {
    return await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: passwordHash,
        role: Role.ADMIN,
      },
      select: { id: true, name: true, email: true, createdAt: true },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Cet e-mail est déjà utilisé.");
    }
    throw error;
  }
}

/**
 * Supprime un administrateur.
 *
 * @param targetId  l'admin à supprimer
 * @param currentUserId  l'admin connecté (ne peut pas se supprimer lui-même)
 *
 * Refuse si la cible est le dernier admin, ou si l'admin tente de se supprimer
 * lui-même (garde-fous contre le verrouillage hors du back-office).
 */
export async function deleteAdmin(
  targetId: string,
  currentUserId: string,
): Promise<void> {
  if (targetId === currentUserId) {
    throw new Error("Vous ne pouvez pas supprimer votre propre compte.");
  }

  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, role: true },
  });
  if (!target || target.role !== Role.ADMIN) {
    throw new Error("Administrateur introuvable.");
  }

  const adminCount = await countAdmins();
  if (adminCount <= 1) {
    throw new Error("Impossible de supprimer le dernier administrateur.");
  }

  await prisma.user.delete({ where: { id: targetId } });
}
