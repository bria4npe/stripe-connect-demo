import { stripe } from "@/lib/stripe";

export const revalidate = 0;

async function getConnectedAccounts() {
  const accounts = await stripe.accounts.list({ limit: 10 });
  return accounts.data;
}

export default async function SellerDashboardPage() {
  const accounts = await getConnectedAccounts();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Dashboard de vendedores
      </h1>
      <p className="text-gray-600 mb-8">
        Cuentas Connect registradas en la plataforma.
      </p>

      {accounts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500">
          <p className="text-4xl mb-3">🏪</p>
          <p>No hay vendedores registrados aún.</p>
          <a
            href="/seller/register"
            className="inline-block mt-4 text-indigo-600 font-medium hover:underline"
          >
            Registrar el primero →
          </a>
        </div>
      ) : (
        <div className="grid gap-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {account.business_profile?.name ||
                    account.email ||
                    "Sin nombre"}
                </p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  {account.id}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    account.charges_enabled
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {account.charges_enabled ? "Activo" : "Pendiente"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
