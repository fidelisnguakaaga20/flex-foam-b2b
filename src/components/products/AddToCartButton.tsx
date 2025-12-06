// src/components/products/AddToCartButton.tsx
"use client";

import { useState } from "react";

type AddToCartButtonProps = {
  productId: string;
  className?: string;
  label?: string;
};

export default function AddToCartButton({
  productId,
  className,
  label,
}: AddToCartButtonProps) {
  const [busy, setBusy] = useState(false);

  async function add() {
    try {
      setBusy(true);
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, qty: 1 }),
      });
      alert("Added to cart");
    } finally {
      setBusy(false);
    }
  }

  // Default look (used by /portal/products today)
  const defaultClass =
    "px-2 py-1 border rounded disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <button
      onClick={add}
      disabled={busy}
      className={className ? className : defaultClass}
    >
      {busy ? "Adding..." : label ?? "Add to Cart"}
    </button>
  );
}


// // src/components/products/AddToCartButton.tsx
// "use client";

// import { useState } from "react";

// export default function AddToCartButton({ productId }: { productId: string }) {
//   const [busy, setBusy] = useState(false);
//   async function add() {
//     setBusy(true);
//     await fetch("/api/cart", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ productId, qty: 1 }),
//     });
//     setBusy(false);
//     alert("Added to cart");
//   }
//   return (
//     <button onClick={add} disabled={busy} className="px-2 py-1 border rounded disabled:opacity-60">
//       {busy ? "Adding..." : "Add to Cart"}
//     </button>
//   );
// }
