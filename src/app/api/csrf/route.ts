import { CSRF_COOKIE_NAME, generateCsrfToken } from "@/lib/csrf";
import { NextResponse } from "next/server";

export async function GET() {
  const token = generateCsrfToken();
  const response = NextResponse.json({ csrfToken: token });
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    httpOnly: false,
  });
  return response;
}
