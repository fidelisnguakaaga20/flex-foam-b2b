// src/components/cart/PlaceOrderButton.tsx
// /// Stage 7: after placing order, go to /portal/checkout?orderId=... so user can pay.

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PlaceOrderButton() {
  const r = useRouter();
  const [busy, setBusy] = useState(false);

  async function place() {
    setBusy(true);
    // Guard: ensure there is at least one item
    const cartRes = await fetch("/api/cart", { cache: "no-store" });
    const cart = await cartRes.json().catch(() => ({ items: [] }));
    if (!cart.items || cart.items.length === 0) {
      alert("Cart is empty. Add a product first.");
      setBusy(false);
      return;
    }

    const res = await fetch("/api/orders", { method: "POST" });
    if (res.ok) {
      const j = await res.json();
      // /// CHANGED: go to checkout (Stage 7) instead of orders detail
      r.push(`/portal/checkout?orderId=${encodeURIComponent(j.id)}`);
      r.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      alert(j?.message ?? "Failed to place order");
      setBusy(false);
    }
  }

  return (
    <button onClick={place} disabled={busy} className="px-3 py-2 rounded bg-blue-600 disabled:opacity-60">
      {busy ? "Placing..." : "Place Order"}
    </button>
  );
}

