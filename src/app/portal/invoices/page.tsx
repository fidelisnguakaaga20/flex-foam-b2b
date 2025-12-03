// src/app/portal/invoices/page.tsx
import Link from "next/link";
import { prisma } from "@lib/db";
import { formatNGN } from "@lib/currency";
import { IS_TEST } from "@lib/env";

export const dynamic = "force-dynamic";

export default async function PortalInvoices() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { order: true },
  });

  return (
    <section className="p-4 space-y-4">
      {IS_TEST && (
        <div className="rounded bg-yellow-400 text-black px-3 py-2 text-sm">
          <strong>TEST MODE</strong> — Invoices include “TEST / NOT A TAX INVOICE” watermark.
        </div>
      )}
      <h1 className="text-2xl font-semibold">Invoices</h1>

      <div className="border rounded overflow-x-auto">
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
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-gray-800">
                <td className="py-2 pr-4 font-mono">{p.order?.customerRef ?? p.orderId.slice(0, 8)}</td>
                <td className="py-2 pr-4">{p.ref}</td>
                <td className="py-2 pr-4">{formatNGN(p.amount)}</td>
                <td className="py-2 pr-4">{p.status}</td>
                <td className="py-2 pr-4">{new Date(p.createdAt).toLocaleString()}</td>
                <td className="py-2 pr-4">
                  <Link
                    href={`/api/invoices/${p.orderId}`}
                    className="text-blue-400 underline"
                    prefetch={false}
                  >
                    Download PDF
                  </Link>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td className="py-6 px-4 text-center text-gray-400" colSpan={6}>
                  No invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}



