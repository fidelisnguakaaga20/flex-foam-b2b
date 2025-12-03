// src/components/cart/CartTable.tsx
"use client";

import { useEffect, useState } from "react";
import { formatNGN } from "@lib/currency";

type Item = {
  id: string;
  qty: number;
  unitPrice: number; // kobo
  product: { id: string; sku: string; name: string; density: string; dimensions: string; price: number };
};
type Cart = { items: Item[]; total: number };

export default function CartTable() {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await fetch("/api/cart", { cache: "no-store" });
    const j = await r.json();
    setCart({ items: j.items ?? [], total: j.total ?? 0 });
  }
  useEffect(() => { load(); }, []);

  async function updateQty(id: string, qty: number) {
    setBusy(true);
    await fetch("/api/cart", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId: id, qty }) });
    await load();
    setBusy(false);
  }
  async function removeItem(id: string) {
    setBusy(true);
    await fetch("/api/cart", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId: id }) });
    await load();
    setBusy(false);
  }

  return (
    <div className="border rounded overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="text-left bg-gray-800">
          <tr className="border-b border-gray-700">
            <th className="py-2 pr-4">SKU</th>
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Qty</th>
            <th className="py-2 pr-4">Unit</th>
            <th className="py-2 pr-4">Subtotal</th>
            <th className="py-2 pr-4"></th>
          </tr>
        </thead>
        <tbody>
          {cart.items.map((it) => (
            <tr key={it.id} className="border-b border-gray-800">
              <td className="py-2 pr-4 font-mono">{it.product.sku}</td>
              <td className="py-2 pr-4">{it.product.name}</td>
              <td className="py-2 pr-4">
                <input
                  type="number" min={1} className="w-20 px-2 py-1 border rounded"
                  defaultValue={it.qty}
                  onChange={(e) => updateQty(it.id, Math.max(1, Math.trunc(Number(e.target.value))))}
                  disabled={busy}
                />
              </td>
              <td className="py-2 pr-4">{formatNGN(it.unitPrice)}</td>
              <td className="py-2 pr-4">{formatNGN(it.unitPrice * it.qty)}</td>
              <td className="py-2 pr-4">
                <button onClick={() => removeItem(it.id)} disabled={busy} className="px-2 py-1 border rounded">
                  Remove
                </button>
              </td>
            </tr>
          ))}
          {cart.items.length === 0 && (
            <tr>
              <td className="py-6 text-center text-gray-400" colSpan={6}>
                Cart is empty.
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4}></td>
            <td className="py-3 pr-4 font-semibold">{formatNGN(cart.total)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
