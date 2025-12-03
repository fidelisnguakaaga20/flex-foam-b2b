// src/app/portal/admin/products/[id]/edit/ui/EditForm.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type EditProductProps = {
  product: {
    id: string;
    sku: string;
    name: string;
    density: string;
    dimensions: string;
    priceNaira: number;
  };
};

export default function EditForm({ product }: EditProductProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    sku: product.sku,
    name: product.name,
    density: product.density,
    dimensions: product.dimensions,
    priceNaira: String(product.priceNaira),
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const priceNaira = Number(form.priceNaira);
    if (!priceNaira || priceNaira <= 0) {
      setError("Enter a valid price in naira.");
      setBusy(false);
      return;
    }

    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sku: form.sku,
        name: form.name,
        density: form.density,
        dimensions: form.dimensions,
        priceNaira,
      }),
    });

    setBusy(false);

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.message ?? "Update failed");
      return;
    }

    router.push("/portal/admin/products");
    router.refresh();
  }

  return (
    <form className="card grid gap-3 max-w-xl" onSubmit={submit}>
      <h1 className="text-2xl sm:text-3xl font-bold">Edit Product</h1>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <label className="grid gap-1 text-sm">
        <span>SKU</span>
        <input
          className="input"
          value={form.sku}
          onChange={(e) => setForm({ ...form, sku: e.target.value })}
          required
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span>Name</span>
        <input
          className="input"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span>Density</span>
        <input
          className="input"
          value={form.density}
          onChange={(e) => setForm({ ...form, density: e.target.value })}
          required
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span>Dimensions</span>
        <input
          className="input"
          value={form.dimensions}
          onChange={(e) =>
            setForm({ ...form, dimensions: e.target.value })
          }
          required
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span>Price (₦)</span>
        <input
          className="input"
          type="number"
          min="1"
          value={form.priceNaira}
          onChange={(e) =>
            setForm({ ...form, priceNaira: e.target.value })
          }
          required
        />
      </label>

      <div className="flex gap-2">
        <button className="btn" disabled={busy} type="submit">
          {busy ? "Saving..." : "Save"}
        </button>
        <a className="px-4 py-2 rounded-xl border" href="/portal/admin/products">
          Cancel
        </a>
      </div>
    </form>
  );
}
