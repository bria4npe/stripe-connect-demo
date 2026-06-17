import { stripe } from "@/lib/stripe";

async function getDashboardData() {
  const [accounts, transfers, paymentIntents] = await Promise.all([
    stripe.accounts.list({ limit: 20 }),
    stripe.transfers.list({ limit: 20 }),
    stripe.paymentIntents.list({ limit: 20 }),
  ]);

  const totalFees = transfers.data.reduce((sum, t) => {
    // El fee es la diferencia entre el monto original y la transferencia
    return sum;
  }, 0);

  const totalVolume = paymentIntents.data
    .filter((pi) => pi.status === "succeeded")
    .reduce((sum, pi) => sum + pi.amount, 0);

  return {
    accounts: accounts.data,
    transfers: transfers.data,
    paymentIntents: paymentIntents.data.filter((pi) => pi.status === "succeeded"),
    totalVolume,
  };
}

export default async function AdminPage() {
  const { accounts, transfers, paymentIntents, totalVolume } =
    await getDashboardData();

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
          <p className="text-sm text-gray-500 mb-1">Volumen total (test)</p>
          <p className="text-3xl font-bold text-gray-900">
            ${(totalVolume / 100).toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {paymentIntents.length} pagos exitosos
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Transferencias</p>
          <p className="text-3xl font-bold text-gray-900">
            {transfers.length}
          </p>
          <p className="text-xs text-gray-400 mt-1">a cuentas conectadas</p>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {accounts.map((account) => (
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
                      className={`text-xs ${
                        account.payouts_enabled
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {account.payouts_enabled ? "Habilitados" : "Deshabilitados"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Transferencias recientes */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        Transferencias recientes
      </h2>
      {transfers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No hay transferencias aún.{" "}
          <a href="/products" className="text-indigo-600 underline">
            Hacer una compra de prueba →
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">
                  ID
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">
                  Monto
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">
                  Destino
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transfers.map((transfer) => (
                <tr key={transfer.id}>
                  <td className="px-5 py-3 text-gray-400 font-mono text-xs">
                    {transfer.id}
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-900">
                    ${(transfer.amount / 100).toFixed(2)} {transfer.currency.toUpperCase()}
                  </td>
                  <td className="px-5 py-3 text-gray-400 font-mono text-xs">
                    {typeof transfer.destination === "string"
                      ? transfer.destination
                      : transfer.destination?.id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
