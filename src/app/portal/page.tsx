// src/app/portal/page.tsx
import React from "react";
import Link from "next/link";
import { formatNGN } from "@lib/currency";
import { getKpis } from "@lib/kpis";

export const dynamic = "force-dynamic";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

type PillHref =
  | "/portal?range=7d"
  | "/portal?range=30d"
  | "/portal?range=90d"
  | "/portal?range=all";

function Pill({
  active,
  href,
  children,
}: {
  active: boolean;
  href: PillHref;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1 rounded-full border text-sm ${
        active
          ? "bg-white text-black border-white"
          : "border-gray-700 text-gray-200 hover:bg-gray-800"
      }`}
    >
      {children}
    </Link>
  );
}

export default async function PortalDashboard({
  searchParams,
}: {
  searchParams?: { range?: "7d" | "30d" | "90d" | "all" };
}) {
  const range = searchParams?.range ?? "30d";
  const { totals, ordersByStatus, recentPayments, topSkus } = await getKpis(
    range,
  );

  const statusCount = (s: string) =>
    ordersByStatus.find((r) => r.status === s)?._count._all ?? 0;

  return (
    <section className="p-4 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Pill active={range === "7d"} href="/portal?range=7d">
            7d
          </Pill>
          <Pill active={range === "30d"} href="/portal?range=30d">
            30d
          </Pill>
          <Pill active={range === "90d"} href="/portal?range=90d">
            90d
          </Pill>
          <Pill active={range === "all"} href="/portal?range=all">
            All
          </Pill>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Orders (range)" value={String(totals.totalOrders)} />
        <StatCard
          label="Revenue (range)"
          value={formatNGN(totals.totalRevenue)}
        />
        <StatCard
          label="Revenue (today)"
          value={formatNGN(totals.revenueToday)}
        />
        <StatCard
          label="Revenue (this month)"
          value={formatNGN(totals.revenueMonth)}
        />
      </div>

      {/* Quick actions so users don't need to type URLs */}
      <section className="grid gap-3 md:grid-cols-2">
        <Link
          href="/portal/products"
          className="rounded-2xl border border-gray-800 bg-gray-950 p-4 hover:bg-gray-900 transition"
        >
          <h2 className="text-lg font-semibold">Place order</h2>
          <p className="mt-1 text-sm text-gray-400">
            Browse wholesale SKUs, add to cart, and create a new order.
          </p>
          <p className="mt-3 text-sm font-medium text-blue-400">
            Go to products →
          </p>
        </Link>

        <Link
          href="/portal/admin/products"
          className="rounded-2xl border border-gray-800 bg-gray-950 p-4 hover:bg-gray-900 transition"
        >
          <h2 className="text-lg font-semibold">Manage products</h2>
          <p className="mt-1 text-sm text-gray-400">
            Admins can update SKUs, pricing, and availability from one place.
          </p>
          <p className="mt-3 text-sm font-medium text-blue-400">
            Go to admin products →
          </p>
        </Link>
      </section>

      {/* Orders by status */}
      <div className="rounded-xl border border-gray-800 overflow-hidden">
        <div className="bg-gray-900 px-4 py-2 font-medium">
          Orders by Status (range)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-0">
          {["CREATED", "PAID", "IN_PRODUCTION", "DISPATCHED", "DELIVERED"].map(
            (s) => (
              <div
                key={s}
                className="p-4 border-t sm:border-t-0 sm:border-l border-gray-800"
              >
                <div className="text-xs text-gray-400">{s}</div>
                <div className="text-xl font-semibold">{statusCount(s)}</div>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Recent payments */}
      <div className="rounded-xl border border-gray-800 overflow-x-auto">
        <div className="bg-gray-900 px-4 py-2 font-medium">Recent Payments</div>
        <table className="min-w-full text-sm">
          <thead className="text-left bg-gray-800 text-white">
            <tr className="border-b border-gray-700">
              <th className="py-2 pr-4">Order</th>
              <th className="py-2 pr-4">Reference</th>
              <th className="py-2 pr-4">Amount</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Created</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentPayments.map((p) => (
              <tr key={p.id} className="border-b border-gray-800">
                <td className="py-2 pr-4 font-mono">
                  {p.order?.customerRef ?? p.orderId.slice(0, 8)}
                </td>
                <td className="py-2 pr-4">{p.ref}</td>
                <td className="py-2 pr-4">{formatNGN(p.amount)}</td>
                <td className="py-2 pr-4">{p.status}</td>
                <td className="py-2 pr-4">
                  {new Date(p.createdAt).toLocaleString()}
                </td>
                <td className="py-2 pr-4">
                  <div className="flex gap-2">
                    <Link
                      className="underline text-blue-400"
                      href={`/portal/orders/${p.orderId}`}
                    >
                      Order
                    </Link>
                    <Link
                      className="underline text-blue-400"
                      href={`/api/invoices/${p.orderId}`}
                      prefetch={false}
                    >
                      Invoice
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {recentPayments.length === 0 && (
              <tr>
                <td
                  className="py-6 px-4 text-center text-gray-400"
                  colSpan={6}
                >
                  No payments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Top SKUs */}
      <div className="rounded-xl border border-gray-800 overflow-x-auto">
        <div className="bg-gray-900 px-4 py-2 font-medium">
          Top SKUs (last 90 days)
        </div>
        <table className="min-w-full text-sm">
          <thead className="text-left bg-gray-800 text-white">
            <tr className="border-b border-gray-700">
              <th className="py-2 pr-4">SKU</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Qty Sold</th>
            </tr>
          </thead>
          <tbody>
            {topSkus.map((t) => (
              <tr key={t.sku} className="border-b border-gray-800">
                <td className="py-2 pr-4 font-mono">{t.sku}</td>
                <td className="py-2 pr-4">{t.name}</td>
                <td className="py-2 pr-4">{t.qty}</td>
              </tr>
            ))}
            {topSkus.length === 0 && (
              <tr>
                <td
                  className="py-6 px-4 text-center text-gray-400"
                  colSpan={3}
                >
                  Not enough data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

 