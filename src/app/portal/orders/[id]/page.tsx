// src/app/portal/orders/[id]/page.tsx
import Link from "next/link";
import { prisma } from "@lib/db";
import { formatNGN } from "@lib/currency";
import { buildWhatsAppOrderLink } from "@lib/notifications";

function Badge({ status }: { status: string }) {
  const cls =
    status === "CREATED" ? "bg-gray-700" :
    status === "PAID" ? "bg-blue-700" :
    status === "IN_PRODUCTION" ? "bg-yellow-700" :
    status === "DISPATCHED" ? "bg-purple-700" :
    status === "DELIVERED" ? "bg-green-700" : "bg-gray-700";
  return <span className={`text-xs px-2 py-1 rounded text-white ${cls}`}>{status}</span>;
}

function Timeline({ status }: { status: string }) {
  const steps = ["CREATED","PAID","IN_PRODUCTION","DISPATCHED","DELIVERED"] as const;
  const idx = steps.indexOf(status as any);
  return (
    <ol className="flex flex-wrap gap-2 text-xs">
      {steps.map((s, i) => (
        <li key={s} className={`px-2 py-1 rounded border ${i <= idx ? "bg-green-800 border-green-600 text-white" : "bg-gray-800 border-gray-700 text-white"}`}>
          {s}
        </li>
      ))}
    </ol>
  );
}

export default async function OrderDetail({ params }: { params: { id: string } }) {
  const o = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: { include: { product: true } },
      payment: true,
    },
  });
  if (!o) return <section className="p-4">Not found.</section>;

  const payable = o.status === "CREATED";
  const canDownloadInvoice = o.status !== "CREATED" && !!o.payment;
  const wa = buildWhatsAppOrderLink(o.id, o.customerRef);

  return (
    <section className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold">Order {o.customerRef}</h1>
        <div className="flex gap-2">
          <a href={wa} target="_blank" className="px-3 py-2 rounded bg-green-600 text-white">WhatsApp Support</a>
          {payable && (
            <Link href={`/portal/checkout?orderId=${o.id}`} className="px-3 py-2 rounded bg-emerald-600 text-white">
              Proceed to Payment
            </Link>
          )}
          {canDownloadInvoice && (
            <Link href={`/api/invoices/${o.id}`} prefetch={false} className="px-3 py-2 rounded bg-blue-600 text-white">
              Download Invoice (PDF)
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge status={o.status} />
        <Timeline status={o.status} />
      </div>

      <div className="border rounded overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left bg-gray-800 text-white">
            <tr className="border-b border-gray-700">
              <th className="py-2 pr-4">SKU</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Qty</th>
              <th className="py-2 pr-4">Unit</th>
              <th className="py-2 pr-4">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {o.items.map((it) => (
              <tr key={it.id} className="border-b border-gray-800">
                <td className="py-2 pr-4 font-mono">{it.product.sku}</td>
                <td className="py-2 pr-4">{it.product.name}</td>
                <td className="py-2 pr-4">{it.qty}</td>
                <td className="py-2 pr-4">{formatNGN(it.unitPrice)}</td>
                <td className="py-2 pr-4">{formatNGN(it.unitPrice * BigInt(it.qty))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4}></td>
              <td className="py-3 pr-4 font-semibold">{formatNGN(o.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}


