import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Sin firma" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Error verificando webhook:", err);
    return NextResponse.json(
      { error: "Firma inválida" },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      console.log(`Cuenta actualizada: ${account.id}`, {
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
      });
      break;
    }

    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`Pago exitoso: ${paymentIntent.id}`, {
        amount: paymentIntent.amount,
        description: paymentIntent.description,
      });
      break;
    }

    case "transfer.created": {
      const transfer = event.data.object as Stripe.Transfer;
      console.log(`Transferencia creada: ${transfer.id}`, {
        amount: transfer.amount,
        destination: transfer.destination,
      });
      break;
    }

    default:
      console.log(`Evento no manejado: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
