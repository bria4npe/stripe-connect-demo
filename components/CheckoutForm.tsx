"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

function PaymentForm({
  productName,
  amount,
}: {
  productName: string;
  amount: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
    });

    if (error) {
      setError(error.message || "Error al procesar el pago");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <PaymentElement />
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-60"
      >
        {loading ? "Procesando..." : `Pagar $${(amount / 100).toFixed(2)}`}
      </button>
      <p className="text-xs text-center text-gray-400">
        Usa la tarjeta de prueba:{" "}
        <span className="font-mono">4242 4242 4242 4242</span>, cualquier fecha
        futura y CVC.
      </p>
    </form>
  );
}

export default function CheckoutForm({
  amount,
  productName,
  sellerAccountId,
  platformFee,
}: {
  amount: number;
  productName: string;
  sellerAccountId: string | null;
  platformFee: number;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stripe/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        sellerAccountId,
        platformFee,
        productName,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.error || "Error al iniciar el pago");
        }
      })
      .catch(() => setError("Error de conexión"));
  }, [amount, sellerAccountId, platformFee, productName]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm">
        Cargando formulario de pago...
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, locale: "es" }}>
      <PaymentForm productName={productName} amount={amount} />
    </Elements>
  );
}
