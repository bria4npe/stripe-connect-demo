import { stripe } from "@/lib/stripe";
import Link from "next/link";
import StoreCarousel from "@/components/StoreCarousel";

export const revalidate = 0;

const BASE_PRODUCTS = [
  {
    id: "prod_1",
    name: "Curso de Next.js",
    description: "Aprende Next.js 16 desde cero hasta avanzado",
    price: 2000,
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
    return accounts.data
      .filter((a) => a.charges_enabled)
      .sort((a, b) => (a.created ?? 0) - (b.created ?? 0));
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

      {connectedAccounts.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm text-yellow-800">
          ⚠️ No hay vendedores activos.{" "}
          <Link href="/seller/register" className="underline font-medium">
            Registrar vendedor →
          </Link>
        </div>
      ) : (
        connectedAccounts.map((account, storeIndex) => {
          const storeName =
            account.business_profile?.name || account.email || account.id;

          // Cada tienda tiene los mismos productos pero con +$1 por índice de tienda
          const products = BASE_PRODUCTS.map((p) => ({
            ...p,
            price: p.price + storeIndex * 100,
          }));

          return (
            <StoreCarousel
              key={account.id}
              storeName={storeName}
              accountId={account.id}
              products={products}
            />
          );
        })
      )}
    </div>
  );
}
