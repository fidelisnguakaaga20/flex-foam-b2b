"use client";

import { useMemo, useState } from "react";

function buildWAUrl({
  to,
  name,
  email,
  phone,
  product,
  qty,
  message
}: {
  to: string;
  name: string;
  email: string;
  phone: string;
  product: string;
  qty: string;
  message: string;
}) {
  const lines = [
    `FLEX FOAM — Quote Request`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Product: ${product}`,
    `Qty: ${qty}`,
    `Message: ${message}`
  ]
    .map((l) => l.trim())
    .join("\n");

  const encoded = encodeURIComponent(lines);
  const number = to.replace(/\s+/g, "");
  return `https://wa.me/${number.replace(/^\+/, "")}?text=${encoded}`;
}

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    product: "",
    qty: "",
    message: ""
  });

  const to = useMemo(
    () => (process.env.NEXT_PUBLIC_WHATSAPP ?? "+2348012345678"),
    []
  );

  const waUrl = useMemo(() => buildWAUrl({ to, ...form }), [to, form]);

  return (
    <section className="grid gap-4">
      <div className="card">
        <h1 className="text-2xl sm:text-3xl font-bold">Contact / Request Quote</h1>
        <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-300">
          Dealers and distributors can request bulk pricing here. In <strong>TEST MODE</strong> this opens a WhatsApp
          draft message instead of sending emails.
        </p>
      </div>

      <form
        className="card grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          window.open(waUrl, "_blank");
        }}
      >
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm">
            <span>Name</span>
            <input
              className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Email</span>
            <input
              type="email"
              className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Phone</span>
            <input
              className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              required
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Product (e.g., SHEET-25)</span>
            <input
              className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2"
              value={form.product}
              onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))}
              required
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Quantity</span>
            <input
              className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2"
              value={form.qty}
              onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))}
              required
            />
          </label>
        </div>

        <label className="grid gap-1 text-sm">
          <span>Message</span>
          <textarea
            rows={5}
            className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2"
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            required
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn">Open WhatsApp Draft</button>
          <a
            className="px-4 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700"
            href={waUrl}
            target="_blank"
            rel="noreferrer"
          >
            View Link
          </a>
        </div>

        <p className="text-xs text-neutral-500">
          NOTE: Uses <code>NEXT_PUBLIC_WHATSAPP</code>. Replace with the official number before LIVE.
        </p>
      </form>
    </section>
  );
}
