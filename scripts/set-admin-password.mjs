// Met à jour le mot de passe du compte ADMIN en base.
// Le mot de passe n'est JAMAIS écrit dans un fichier : il est passé en argument.
// Lance : node --env-file=.env scripts/set-admin-password.mjs "LE_NOUVEAU_MOT_DE_PASSE"
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const newPassword = process.argv[2];
if (!newPassword || newPassword.length < 12) {
  console.error("❌ Donne un mot de passe d'au moins 12 caractères en argument.");
  process.exit(1);
}

const admin = await prisma.user.findFirst({
  where: { role: "ADMIN" },
  select: { id: true, email: true },
});
if (!admin) {
  console.error("❌ Aucun compte ADMIN trouvé.");
  process.exit(1);
}

const hashed = await bcrypt.hash(newPassword, 12);
await prisma.user.update({ where: { id: admin.id }, data: { password: hashed } });

console.log(`✅ Mot de passe mis à jour pour l'admin : ${admin.email}`);
await prisma.$disconnect();
