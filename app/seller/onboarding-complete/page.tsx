import Link from "next/link";

export default async function OnboardingCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string }>;
}) {
  const { account } = await searchParams;

  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="text-5xl mb-4">🎉</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        ¡Onboarding completado!
      </h1>
      <p className="text-gray-600 mb-2">
        Tu cuenta de vendedor ha sido conectada exitosamente.
      </p>
      {account && (
        <p className="text-xs text-gray-400 mb-8 font-mono">
          Account ID: {account}
        </p>
      )}
      <div className="flex gap-3 justify-center">
        <Link
          href="/seller/dashboard"
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          Ver mi dashboard
        </Link>
        <Link
          href="/products"
          className="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
        >
          Ver productos
        </Link>
      </div>
    </div>
  );
}
