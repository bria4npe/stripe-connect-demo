import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { name, email, business } = await req.json();

    // Crear cuenta Connect Express
    const account = await stripe.accounts.create({
      type: "express",
      email,
      business_profile: {
        name: business,
      },
      metadata: {
        owner_name: name,
      },
    });

    // Crear link de onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/seller/register?error=true`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/seller/onboarding-complete?account=${account.id}`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url, accountId: account.id });
  } catch (error: unknown) {
    console.error("Error creando cuenta Connect:", error);
    const message =
      error instanceof Error ? error.message : "No se pudo crear la cuenta";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
