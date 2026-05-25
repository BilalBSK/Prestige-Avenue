import { createPresignedUpload } from "@/server/admin/upload.actions";
import { validateCsrf } from "@/lib/csrf";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  if (!validateCsrf(request)) {
    return NextResponse.json({ error: "CSRF invalide." }, { status: 403 });
  }
  try {
    const body = await request.json();
    const result = await createPresignedUpload(body);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload refusé.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
