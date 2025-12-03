// src/app/portal/orders/page.tsx
import Link from "next/link";
import { prisma } from "@lib/db";
import { formatNGN } from "@lib/currency";

export default async function OrdersPage() {
  const rows = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, customerRef: true, status: true, total: true, createdAt: true },
  });
  return (
    <section className="p-4 space-y-4">
      <h1 className="text-2xl sm:text-3xl font-bold">Orders</h1>
      <div className="border rounded overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left bg-gray-800">
            <tr className="border-b border-gray-700">
              <th className="py-2 pr-4">Ref</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Total</th>
              <th className="py-2 pr-4">Created</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(o => (
              <tr key={o.id} className="border-b border-gray-800">
                <td className="py-2 pr-4">{o.customerRef}</td>
                <td className="py-2 pr-4">{o.status}</td>
                <td className="py-2 pr-4">{formatNGN(Number(o.total))}</td>
                <td className="py-2 pr-4">{new Date(o.createdAt).toLocaleString()}</td>
                <td className="py-2 pr-4">
                  <Link href={`/portal/orders/${o.id}`} className="text-emerald-400 underline">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

