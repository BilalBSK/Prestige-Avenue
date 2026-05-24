import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { SiteHeaderClient } from "./site-header-client";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user.role === "ADMIN";

  return <SiteHeaderClient isAdmin={isAdmin} />;
}
