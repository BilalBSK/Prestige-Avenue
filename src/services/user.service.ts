import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    select: { id: true },
  });

  if (existingUser) {
    throw new Error("Cet email est deja utilise.");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      password: passwordHash,
      phone: input.phone,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}
