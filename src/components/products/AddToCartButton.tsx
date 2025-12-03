// src/components/products/AddToCartButton.tsx
"use client";

import { useState } from "react";

export default function AddToCartButton({ productId }: { productId: string }) {
  const [busy, setBusy] = useState(false);
  async function add() {
    setBusy(true);
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, qty: 1 }),
    });
    setBusy(false);
    alert("Added to cart");
  }
  return (
    <button onClick={add} disabled={busy} className="px-2 py-1 border rounded disabled:opacity-60">
      {busy ? "Adding..." : "Add to Cart"}
    </button>
  );
}
