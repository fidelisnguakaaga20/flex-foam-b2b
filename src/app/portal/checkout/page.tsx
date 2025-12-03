// src/app/portal/checkout/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type Order = { id: string; customerRef: string; status: string; total: number; createdAt: string };

export default function CheckoutPage() {
  const [busy, setBusy] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const sp = useMemo(
    () => new URLSearchParams(typeof window !== "undefined" ? window.location.search : ""),
    []
  );

  useEffect(() => {
    const q = sp.get("orderId") || "";
    if (q) {
      setOrderId(q);
      return;
    }
    // Fallback: pick most recent CREATED order
    (async () => {
      const r = await fetch("/api/orders", { cache: "no-store" });
      const rows: Order[] = await r.json().catch(() => []);
      const created = rows.find(o => o.status === "CREATED");
      if (created) setOrderId(created.id);
      else setMessage("No payable (CREATED) order found. Place an order from the cart.");
    })();
  }, [sp]);

  // Stage 8: if returned from Paystack with ?reference, auto-verify
  useEffect(() => {
    const ref = sp.get("reference");
    if (!ref) return;
    (async () => {
      setBusy(true);
      const res = await fetch(`/api/payments/verify?reference=${encodeURIComponent(ref)}`, { cache: "no-store" });
      const j = await res.json().catch(() => ({}));
      setBusy(false);
      if (res.ok) {
        setMessage("Payment verified! Redirecting to order...");
        const oid = j?.orderId ?? orderId;
        if (oid) window.location.href = `/portal/orders/${oid}`;
      } else {
        setMessage(j?.message ?? "Verification failed.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function payWithPaystack() {
    if (!orderId) {
      alert("Missing orderId. Return to cart and place order again.");
      return;
    }
    setBusy(true);
    const r = await fetch("/api/payments/paystack/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    const j = await r.json().catch(() => ({}));
    setBusy(false);

    if (!r.ok) {
      alert(j?.message ?? "Failed to initialize Paystack.");
      return;
    }
    if (j.authorization_url) {
      window.location.href = j.authorization_url;
    } else {
      alert("No authorization_url returned from Paystack.");
    }
  }

  return (
    <section className="p-4 space-y-3">
      <h1 className="text-2xl sm:text-3xl font-bold">Checkout (Sandbox)</h1>
      {orderId ? (
        <p className="text-sm text-neutral-400">
          Order: <span className="font-mono">{orderId}</span>
        </p>
      ) : (
        <p className="text-sm text-yellow-400">{message || "Finding your latest CREATED order..."}</p>
      )}
      <button
        onClick={payWithPaystack}
        disabled={busy || !orderId}
        className="px-4 py-2 rounded bg-emerald-600 disabled:opacity-60"
      >
        {busy ? "Processing..." : "Pay with Paystack (Sandbox)"}
      </button>
      <p className="text-xs text-yellow-400">
        TEST MODE — Use Paystack test card 4084&nbsp;0840&nbsp;8408&nbsp;4081 (future expiry, CVV 408, PIN 1234, OTP 123456).
      </p>
      {message && <p className="text-sm">{message}</p>}
    </section>
  );
}

