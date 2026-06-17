import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stripe Connect Demo - Marketplace",
  description: "Demo de marketplace con Stripe Connect",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-indigo-600">
              MarketDemo
            </a>
            <div className="flex gap-6 text-sm">
              <a href="/products" className="text-gray-600 hover:text-gray-900">
                Productos
              </a>
              <a href="/seller/register" className="text-gray-600 hover:text-gray-900">
                Vender
              </a>
              <a href="/admin" className="text-gray-600 hover:text-gray-900">
                Admin
              </a>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
