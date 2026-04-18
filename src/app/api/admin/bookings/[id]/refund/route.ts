import { validateCsrf } from "@/lib/csrf";
import { requireAdminSession } from "@/lib/permissions";
import { refundBooking } from "@/services/admin.service";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    await requireAdminSession();
    if (!validateCsrf(request)) {
      return NextResponse.json({ error: "CSRF token invalide." }, { status: 403 });
    }

    const { id } = await params;
    await refundBooking(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Remboursement impossible.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
