import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Acces admin requis.");
  }
  return session;
}
