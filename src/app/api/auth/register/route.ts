import { validateCsrf } from "@/lib/csrf";
import { registerUser } from "@/services/user.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(8).max(64),
  phone: z.string().min(8).max(20).optional(),
});

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrf(request)) {
      return NextResponse.json({ error: "CSRF token invalide." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Donnees invalides.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const user = await registerUser(parsed.data);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur lors de l'inscription.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
