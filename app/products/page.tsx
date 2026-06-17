import { stripe } from "@/lib/stripe";
import Link from "next/link";

// Productos de demo con vendedores simulados
const DEMO_PRODUCTS = [
  {
    id: "prod_1",
    name: "Curso de Next.js",
    description: "Aprende Next.js 16 desde cero hasta avanzado",
    price: 2000, // en centavos = $20.00
    seller: "TechAcademy",
    emoji: "🎓",
  },
  {
    id: "prod_2",
    name: "Pack de iconos UI",
    description: "500+ iconos SVG para tus proyectos",
    price: 1500,
    seller: "DesignStudio",
    emoji: "🎨",
  },
  {
    id: "prod_3",
    name: "Template de dashboard",
    description: "Template React con Tailwind y componentes",
    price: 4900,
    seller: "UIFactory",
    emoji: "📊",
  },
];

async function getConnectedAccounts() {
  try {
    const accounts = await stripe.accounts.list({ limit: 10 });
    return accounts.data.filter((a) => a.charges_enabled);
  } catch {
    return [];
  }
}

export default async function ProductsPage() {
  const connectedAccounts = await getConnectedAccounts();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Productos</h1>
      <p className="text-gray-600 mb-8">
        Cada compra divide el pago: 90% al vendedor, 10% a la plataforma.
      </p>

      {connectedAccounts.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm text-yellow-800">
          ⚠️ No hay vendedores activos. Los pagos de demo usarán una cuenta
          simulada.{" "}
          <Link href="/seller/register" className="underline font-medium">
            Registrar vendedor →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DEMO_PRODUCTS.map((product, i) => {
          // Asignar cuenta del vendedor round-robin si hay cuentas activas
          const sellerAccountId =
            connectedAccounts.length > 0
              ? connectedAccounts[i % connectedAccounts.length].id
              : null;

          return (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col"
            >
              <div className="text-4xl mb-3">{product.emoji}</div>
              <h2 className="font-semibold text-gray-900 mb-1">
                {product.name}
              </h2>
              <p className="text-sm text-gray-500 mb-1">{product.description}</p>
              <p className="text-xs text-gray-400 mb-4">
                por {product.seller}
              </p>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">
                  ${(product.price / 100).toFixed(2)}
                </span>
                <Link
                  href={`/products/${product.id}?price=${product.price}&name=${encodeURIComponent(product.name)}${sellerAccountId ? `&seller=${sellerAccountId}` : ""}`}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                >
                  Comprar
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
