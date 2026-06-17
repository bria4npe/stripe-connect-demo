import CheckoutForm from "@/components/CheckoutForm";

export default async function ProductCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ price?: string; name?: string; seller?: string }>;
}) {
  const { id } = await params;
  const { price, name, seller } = await searchParams;

  const amount = parseInt(price || "1000");
  const productName = name || "Producto";
  const platformFee = Math.round(amount * 0.1); // 10% fee

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-900">{productName}</h2>
        <div className="mt-3 space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Precio total</span>
            <span className="font-medium">${(amount / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Fee plataforma (10%)</span>
            <span>${(platformFee / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Para el vendedor (90%)</span>
            <span>${((amount - platformFee) / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <CheckoutForm
        amount={amount}
        productName={productName}
        sellerAccountId={seller || null}
        platformFee={platformFee}
      />
    </div>
  );
}
