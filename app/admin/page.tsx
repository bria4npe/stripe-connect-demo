import { stripe } from "@/lib/stripe";
import TransfersTable from "@/components/TransfersTable";
import DirectChargesTable from "@/components/DirectChargesTable";

export const revalidate = 0;

async function getDashboardData() {
  const [accounts, transfers, charges, paymentIntents] = await Promise.all([
    stripe.accounts.list({ limit: 20 }),
    stripe.transfers.list({
      limit: 20,
      expand: [
        "data.destination",
        "data.source_transaction",
        "data.source_transaction.payment_intent",
      ],
    }),
    stripe.charges.list({
      limit: 50,
      expand: [
        "data.transfer_data.destination",
        "data.source",
        "data.balance_transaction",
      ],
    }),
    stripe.paymentIntents.list({ limit: 50 }),
  ]);

  // Mapa accountId → nombre del negocio
  const accountNames: Record<string, string> = {};
  for (const a of accounts.data) {
    accountNames[a.id] = a.business_profile?.name || a.email || a.id;
  }

  const successfulCharges = charges.data.filter(
    (c) => c.status === "succeeded",
  );

  // Métricas reales desde las transferencias (no calculadas sobre el volumen total)
  const totalVolume = successfulCharges.reduce((sum, c) => sum + c.amount, 0);
  const realPlatformFee = transfers.data.reduce((sum, t) => {
    const charge =
      t.source_transaction && typeof t.source_transaction === "object"
        ? t.source_transaction
        : null;
    return sum + ((charge as any)?.application_fee_amount ?? 0);
  }, 0);
  const realVendorTotal = transfers.data.reduce((sum, t) => {
    const charge =
      t.source_transaction && typeof t.source_transaction === "object"
        ? t.source_transaction
        : null;
    const fee = (charge as any)?.application_fee_amount ?? 0;
    const pi = (charge as any)?.payment_intent;
    const piAmount = typeof pi === "object" && pi ? pi.amount : null;
    const total = piAmount ?? t.amount + fee;
    return sum + (total - fee);
  }, 0);
  // Volumen = amount real del PaymentIntent (lo que pagó el cliente)
  const realTransferVolume = transfers.data.reduce((sum, t) => {
    const charge =
      t.source_transaction && typeof t.source_transaction === "object"
        ? t.source_transaction
        : null;
    const pi = (charge as any)?.payment_intent;
    const piAmount = typeof pi === "object" && pi ? pi.amount : null;
    return (
      sum +
      (piAmount ?? t.amount + ((charge as any)?.application_fee_amount ?? 0))
    );
  }, 0);

  // IDs de charges que ya tienen transferencia (para no duplicar)
  const transferredChargeIds = new Set(
    transfers.data
      .map((t) => {
        const charge = t.source_transaction;
        return typeof charge === "object" && charge
          ? charge.id
          : typeof charge === "string"
            ? charge
            : null;
      })
      .filter(Boolean),
  );

  // IDs de PIs que ya tienen transferencia
  const transferredPIIds = new Set(
    transfers.data
      .map((t) => {
        const charge = t.source_transaction;
        return typeof charge === "object" && charge
          ? (charge as any).payment_intent
          : null;
      })
      .filter(Boolean),
  );

  // Charges exitosos sin transferencia (pago directo a plataforma, sin split)
  // Excluye: ya apareció en transfers, fue reembolsado, o tiene c.transfer (split vía banco)
  const successfulWithoutTransfer = successfulCharges.filter(
    (c) => !transferredChargeIds.has(c.id) && !c.refunded && !c.transfer,
  );

  // PaymentIntents incompletos (nunca llegaron a crear un charge)
  const incompletePIs = paymentIntents.data.filter(
    (pi) => pi.status !== "succeeded" && !transferredPIIds.has(pi.id),
  );

  return {
    accounts: accounts.data,
    transfers: transfers.data,
    incompletePIs,
    successfulWithoutTransfer,
    paymentIntents: successfulCharges,
    totalVolume: realTransferVolume,
    realPlatformFee,
    realVendorTotal,
    accountNames,
  };
}

export default async function AdminPage() {
  const {
    accounts,
    transfers,
    incompletePIs,
    successfulWithoutTransfer,
    paymentIntents,
    totalVolume,
    realPlatformFee,
    realVendorTotal,
    accountNames,
  } = await getDashboardData();

  const activeAccounts = accounts.filter((a) => a.charges_enabled);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Panel de administrador
      </h1>
      <p className="text-gray-600 mb-8">
        Vista general de la plataforma marketplace.
      </p>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Vendedores activos</p>
          <p className="text-3xl font-bold text-gray-900">
            {activeAccounts.length}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {accounts.length} total registrados
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Volumen total</p>
          <p className="text-3xl font-bold text-gray-900">
            ${(totalVolume / 100).toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {paymentIntents.length} pagos exitosos
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Fee plataforma (10%)</p>
          <p className="text-3xl font-bold text-indigo-600">
            ${(realPlatformFee / 100).toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            retenido por la plataforma
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Pagado a vendedores</p>
          <p className="text-3xl font-bold text-green-600">
            ${(realVendorTotal / 100).toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {transfers.length} transferencias
          </p>
        </div>
      </div>

      {/* Cuentas conectadas */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        Cuentas conectadas
      </h2>
      {accounts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500 mb-8">
          No hay cuentas conectadas.{" "}
          <a href="/seller/register" className="text-indigo-600 underline">
            Registrar vendedor →
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">
                  Negocio
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">
                  Account ID
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">
                  Estado
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">
                  Payouts
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">
                  Ventas
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {accounts.map((account) => {
                const salesCount = transfers.filter((t) => {
                  const destId =
                    typeof t.destination === "string"
                      ? t.destination
                      : t.destination?.id;
                  return destId === account.id;
                }).length;
                return (
                  <tr key={account.id}>
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {account.business_profile?.name || account.email || "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">
                      {account.id}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          account.charges_enabled
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {account.charges_enabled ? "Activo" : "Pendiente"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs ${account.payouts_enabled ? "text-green-600" : "text-gray-400"}`}
                      >
                        {account.payouts_enabled
                          ? "Habilitados"
                          : "Deshabilitados"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-700 font-medium">
                      {salesCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Transferencias con split */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        Transferencias recientes
      </h2>
      {transfers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500 mb-8">
          No hay transferencias aún.{" "}
          <a href="/products" className="text-indigo-600 underline">
            Hacer una compra de prueba →
          </a>
        </div>
      ) : (
        <div className="mb-10">
          <TransfersTable
            transfers={[
              ...transfers.map((t) => {
                const destId =
                  typeof t.destination === "string"
                    ? t.destination
                    : (t.destination?.id ?? "");
                const vendorAmount = t.amount;
                const charge =
                  t.source_transaction &&
                  typeof t.source_transaction === "object"
                    ? t.source_transaction
                    : null;
                const isRefunded = (charge as any)?.refunded ?? false;
                const feeAmount =
                  (charge as any)?.application_fee_amount ??
                  Math.round(vendorAmount / 9);
                // Total cobrado al cliente = amount del PaymentIntent original
                const pi = (charge as any)?.payment_intent;
                const piAmount =
                  typeof pi === "object" && pi ? pi.amount : null;
                const totalAmount = piAmount ?? vendorAmount + feeAmount;
                return {
                  id: t.id,
                  amount: totalAmount - feeAmount, // lo que realmente recibe el vendedor
                  currency: t.currency,
                  destId,
                  destName: accountNames[destId] || destId,
                  created: t.created,
                  totalAmount,
                  feeAmount,
                  status: isRefunded ? "refunded" : "succeeded",
                } as const;
              }),
              ...incompletePIs.map((pi) => ({
                id: pi.id,
                amount: 0,
                currency: pi.currency,
                destId: "",
                destName: "—",
                created: pi.created,
                totalAmount: pi.amount,
                feeAmount: 0,
                status: "incomplete" as const,
              })),
            ]}
          />
        </div>
      )}

      {/* Pago a vendedores */}
      {successfulWithoutTransfer.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Cobros directos a la plataforma
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            Pagos exitosos sin split — el monto fue retenido íntegro por la
            plataforma.
          </p>
          <DirectChargesTable
            charges={successfulWithoutTransfer.map((c) => {
              const onBehalfId =
                (typeof c.on_behalf_of === "string"
                  ? c.on_behalf_of
                  : (c.on_behalf_of as any)?.id) ||
                (typeof (c as any).transfer_data?.destination === "string"
                  ? (c as any).transfer_data?.destination
                  : (c as any).transfer_data?.destination?.id) ||
                ((c.source as any)?.object === "account"
                  ? (c.source as any)?.id
                  : null) ||
                null;
              const bt = (c as any).balance_transaction;
              return {
                id: c.id,
                created: c.created,
                amount: c.amount,
                stripeFee: typeof bt === "object" && bt ? bt.fee : null,
                netAmount: typeof bt === "object" && bt ? bt.net : null,
                transferId:
                  typeof c.transfer === "string"
                    ? c.transfer
                    : ((c.transfer as any)?.id ?? null),
                vendorName: onBehalfId
                  ? accountNames[onBehalfId] || onBehalfId
                  : "—",
                vendorId: onBehalfId,
              };
            })}
          />
        </>
      )}
    </div>
  );
}
