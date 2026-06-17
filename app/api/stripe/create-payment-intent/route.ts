import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { amount, sellerAccountId, platformFee, productName } =
      await req.json();

    const paymentIntentParams: Parameters<
      typeof stripe.paymentIntents.create
    >[0] = {
      amount,
      currency: "usd",
      description: productName,
      automatic_payment_methods: { enabled: true },
    };

    // Si hay una cuenta de vendedor activa, dividir el pago
    if (sellerAccountId) {
      paymentIntentParams.application_fee_amount = platformFee;
      paymentIntentParams.transfer_data = {
        destination: sellerAccountId,
      };
    }

    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentParams
    );

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creando PaymentIntent:", error);
    return NextResponse.json(
      { error: "No se pudo crear el pago" },
      { status: 500 }
    );
  }
}
