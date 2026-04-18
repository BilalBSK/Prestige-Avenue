import { prisma } from "@/lib/prisma";
import { getStripeServerClient } from "@/lib/stripe";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const stripe = getStripeServerClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret manquant." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature Stripe manquante." }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Signature webhook invalide." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await prisma.booking.updateMany({
        where: { stripeSessionId: session.id },
        data: {
          status: BookingStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PAID,
        },
      });
    }

    if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      await prisma.booking.updateMany({
        where: { stripeSessionId: session.id },
        data: {
          paymentStatus: PaymentStatus.FAILED,
          status: BookingStatus.CANCELLED,
        },
      });
    }
  } catch {
    return NextResponse.json({ error: "Traitement webhook impossible." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
