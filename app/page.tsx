export default function Home() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Stripe Connect Demo
      </h1>
      <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto">
        Marketplace de demostración con pagos divididos automáticos entre
        vendedores y la plataforma.
      </p>
      <div className="flex gap-4 justify-center flex-wrap">
        <a
          href="/seller/register"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          Registrarme como vendedor
        </a>
        <a
          href="/products"
          className="bg-white text-indigo-600 border border-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition"
        >
          Ver productos
        </a>
        <a
          href="/admin"
          className="bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition"
        >
          Panel admin
        </a>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-2xl mb-2">🏪</div>
          <h3 className="font-semibold text-gray-900 mb-1">
            1. Vendedor se registra
          </h3>
          <p className="text-sm text-gray-600">
            Crea una cuenta Connect Express en Stripe con onboarding guiado.
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-2xl mb-2">💳</div>
          <h3 className="font-semibold text-gray-900 mb-1">
            2. Comprador paga
          </h3>
          <p className="text-sm text-gray-600">
            El pago se divide: 90% al vendedor, 10% como fee de la plataforma.
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-2xl mb-2">📊</div>
          <h3 className="font-semibold text-gray-900 mb-1">
            3. Admin supervisa
          </h3>
          <p className="text-sm text-gray-600">
            Ve todas las cuentas conectadas, transferencias y fees en tiempo
            real.
          </p>
        </div>
      </div>
    </div>
  );
}
