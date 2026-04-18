import { requireAdminSession } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();

    const searchParams = request.nextUrl.searchParams;
    const carId = searchParams.get("carId") ?? undefined;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const bookings = await prisma.booking.findMany({
      where: {
        ...(carId ? { carId } : {}),
        ...(startDate || endDate
          ? {
              startDate: {
                ...(startDate ? { gte: new Date(startDate) } : {}),
                ...(endDate ? { lte: new Date(endDate) } : {}),
              },
            }
          : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        car: { select: { id: true, brand: true, model: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json({ error: "Acces refuse." }, { status: 403 });
  }
}
