import { validateCsrf } from "@/lib/csrf";
import { requireAdminSession } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await requireAdminSession();
    if (!validateCsrf(request)) {
      return NextResponse.json({ error: "CSRF token invalide." }, { status: 403 });
    }

    const { id } = await params;
    await prisma.blockedDate.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Suppression impossible.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
