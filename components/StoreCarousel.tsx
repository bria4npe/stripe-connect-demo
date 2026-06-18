"use client";

import { useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  seller: string;
  emoji: string;
};

type Props = {
  storeName: string;
  accountId: string;
  products: Product[];
};

export default function StoreCarousel({
  storeName,
  accountId,
  products,
}: Props) {
  const [index, setIndex] = useState(0);
  const visible = 3;
  const max = products.length - visible;

  function prev() {
    setIndex((i) => Math.max(0, i - 1));
  }
  function next() {
    setIndex((i) => Math.min(max, i + 1));
  }

  const shown = products.slice(index, index + visible);

  return (
    <div className="mb-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{storeName}</h2>
          <p className="text-xs text-gray-400 font-mono">{accountId}</p>
        </div>
        {products.length > visible && (
          <div className="flex gap-2">
            <button
              onClick={prev}
              disabled={index === 0}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
            >
              ←
            </button>
            <button
              onClick={next}
              disabled={index >= max}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
            >
              →
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {shown.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col"
          >
            <div className="text-4xl mb-3">{product.emoji}</div>
            <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
            <p className="text-sm text-gray-500 mb-1">{product.description}</p>
            <p className="text-xs text-gray-400 mb-4">por {product.seller}</p>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-xl font-bold text-gray-900">
                ${(product.price / 100).toFixed(2)}
              </span>
              <Link
                href={`/products/${product.id}?price=${product.price}&name=${encodeURIComponent(product.name)}&seller=${accountId}`}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              >
                Comprar
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
