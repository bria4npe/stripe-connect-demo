import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="text-5xl mb-4">✅</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        ¡Pago exitoso!
      </h1>
      <p className="text-gray-600 mb-2">
        El pago fue procesado. El vendedor recibirá el 90% automáticamente.
      </p>
      <div className="flex gap-3 justify-center mt-8">
        <Link
          href="/products"
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          Seguir comprando
        </Link>
        <Link
          href="/admin"
          className="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
        >
          Ver en admin
        </Link>
      </div>
    </div>
  );
}
