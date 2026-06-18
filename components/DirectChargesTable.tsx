"use client";

type DirectCharge = {
  id: string;
  created: number;
  amount: number;
  stripeFee: number | null;
  netAmount: number | null;
  transferId: string | null;
  vendorName: string;
  vendorId: string | null;
};

export default function DirectChargesTable({
  charges,
}: {
  charges: DirectCharge[];
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-5 py-3 font-medium text-gray-600">#</th>
            <th className="text-left px-5 py-3 font-medium text-gray-600">
              Vendedor
            </th>
            <th className="text-left px-5 py-3 font-medium text-gray-600">
              Fecha
            </th>
            <th className="text-left px-5 py-3 font-medium text-gray-600">
              Importe
            </th>
            <th className="text-left px-5 py-3 font-medium text-gray-600">
              Comisión Stripe (~1.5%)
            </th>
            <th className="text-left px-5 py-3 font-medium text-gray-600">
              Importe neto
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {charges.map((c, i) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-5 py-3 text-gray-400 text-xs font-mono">
                {i + 1}
              </td>
              <td className="px-5 py-3 text-gray-700 font-medium">
                {c.vendorName}
              </td>
              <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                {new Date(c.created * 1000).toLocaleDateString("es-PE", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="px-5 py-3 font-medium text-gray-900">
                ${(c.amount / 100).toFixed(2)}
              </td>
              <td className="px-5 py-3 text-red-500">
                {c.stripeFee != null
                  ? `-$${(c.stripeFee / 100).toFixed(2)}`
                  : "—"}
              </td>
              <td className="px-5 py-3 font-medium text-green-600">
                {c.netAmount != null
                  ? `$${(c.netAmount / 100).toFixed(2)}`
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50 border-t border-gray-200">
          <tr>
            <td className="px-5 py-3 font-semibold text-gray-700" colSpan={3}>
              Total ({charges.length})
            </td>
            <td className="px-5 py-3 font-semibold text-gray-900">
              ${(charges.reduce((s, c) => s + c.amount, 0) / 100).toFixed(2)}
            </td>
            <td className="px-5 py-3 font-semibold text-red-500">
              -$
              {(
                charges.reduce((s, c) => s + (c.stripeFee ?? 0), 0) / 100
              ).toFixed(2)}
            </td>
            <td className="px-5 py-3 font-semibold text-green-600">
              $
              {(
                charges.reduce((s, c) => s + (c.netAmount ?? 0), 0) / 100
              ).toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
