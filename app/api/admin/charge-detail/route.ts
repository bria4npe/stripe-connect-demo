import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const accountId = req.nextUrl.searchParams.get("accountId");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    // Recuperar el charge para obtener su balance_transaction y fecha
    const charge = await stripe.charges.retrieve(id, {
      expand: ["balance_transaction"],
    });

    const bt = charge.balance_transaction as any;
    const created = charge.created;

    // Si hay una cuenta conectada como fuente, buscar sus balance transactions
    // en el rango de fechas cercano a este pago (±7 días)
    if (accountId) {
      const from = created - 7 * 24 * 3600;
      const to = created + 7 * 24 * 3600;

      const txns = await stripe.balanceTransactions.list(
        {
          limit: 50,
          created: { gte: from, lte: to },
          expand: ["data.source"],
        },
        { stripeAccount: accountId },
      );

      // Encontrar la transferencia saliente (tipo "transfer") más cercana a la fecha del cobro
      const transferTxn = txns.data.find(
        (t) => t.type === "transfer" && Math.abs(t.created - created) < 3600,
      );
      const cutoff = transferTxn ? transferTxn.created : created;

      // Solo pagos que ocurrieron antes o en el momento de la transferencia
      const items = txns.data
        .filter((t) => t.type === "payment" && t.created <= cutoff)
        .map((t) => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          fee: t.fee,
          net: t.net,
          description: t.description,
          created: t.created,
          sourceId:
            typeof t.source === "string" ? t.source : (t.source as any)?.id,
        }));

      return NextResponse.json({ items });
    }

    // Sin cuenta conectada: devolver solo el balance transaction del charge
    if (bt && typeof bt === "object") {
      return NextResponse.json({
        items: [
          {
            id: bt.id,
            type: bt.type,
            amount: bt.amount,
            fee: bt.fee,
            net: bt.net,
            description: bt.description,
            created: bt.created,
            sourceId: id,
          },
        ],
      });
    }

    return NextResponse.json({ items: [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
