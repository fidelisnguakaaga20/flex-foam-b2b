// src/app/portal/products/page.tsx
import React from "react";
import Link from "next/link";
import { prisma } from "@lib/db";
import AddToCartButton from "@components/products/AddToCartButton";

export const dynamic = "force-dynamic";

export default async function PortalProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { sku: "asc" },
  });

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Products</h1>
        {/* Go to cart / place order without typing URL */}
        <Link
          href="/portal/cart"
          className="inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 transition"
        >
          View cart / Place order →
        </Link>
      </header>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">SKU</th>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Density</th>
              <th className="px-4 py-3 text-left font-semibold">Dimensions</th>
              <th className="px-4 py-3 text-right font-semibold">Price (₦)</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-t border-slate-800 hover:bg-slate-900/40"
              >
                <td className="px-4 py-3 font-mono">{p.sku}</td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{p.density}</td>
                <td className="px-4 py-3">{p.dimensions}</td>
                <td className="px-4 py-3 text-right">
                  {Number(p.price).toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="px-4 py-3 text-right">
                  <AddToCartButton productId={p.id} />
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td
                  className="px-4 py-6 text-center text-slate-400"
                  colSpan={6}
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

