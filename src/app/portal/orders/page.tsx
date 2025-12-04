// src/app/portal/orders/page.tsx
import React from "react";
import Link from "next/link";
import { prisma } from "@lib/db";
import { formatNGN } from "@lib/currency";

export const dynamic = "force-dynamic";

// ✅ Detect Next.js production build phase
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

export default async function OrdersPage() {
  // 🔒 During `next build`, avoid touching DB/auth; render a safe stub
  if (isBuildPhase) {
    return (
      <section className="p-4 space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Orders</h1>
        <p className="text-sm text-slate-400">
          Orders table is loaded dynamically at runtime.
        </p>
      </section>
    );
  }

  // ✅ Normal runtime logic (local dev / deployed app)
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="p-4 space-y-4">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold">Orders</h1>
      </header>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Order Ref</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Total (₦)</th>
              <th className="px-4 py-3 text-left font-semibold">Created</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr
                key={o.id}
                className="border-t border-slate-800 hover:bg-slate-900/40"
              >
                <td className="px-4 py-3 font-mono">
                  {o.customerRef || o.id.slice(0, 8)}
                </td>
                <td className="px-4 py-3">{o.status}</td>
                <td className="px-4 py-3 text-right">
                  {formatNGN(o.total)}
                </td>
                <td className="px-4 py-3">
                  {new Date(o.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/portal/orders/${o.id}`}
                    className="underline text-blue-400"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}

            {orders.length === 0 && (
              <tr>
                <td
                  className="px-4 py-6 text-center text-slate-400"
                  colSpan={5}
                >
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}


// // src/app/portal/orders/page.tsx
// import Link from "next/link";
// import { prisma } from "@lib/db";
// import { formatNGN } from "@lib/currency";

// export const dynamic = "force-dynamic";

// export default async function OrdersPage() {
//   const rows = await prisma.order.findMany({
//     orderBy: { createdAt: "desc" },
//     select: { id: true, customerRef: true, status: true, total: true, createdAt: true },
//   });
//   return (
//     <section className="p-4 space-y-4">
//       <h1 className="text-2xl sm:text-3xl font-bold">Orders</h1>
//       <div className="border rounded overflow-x-auto">
//         <table className="min-w-full text-sm">
//           <thead className="text-left bg-gray-800">
//             <tr className="border-b border-gray-700">
//               <th className="py-2 pr-4">Ref</th>
//               <th className="py-2 pr-4">Status</th>
//               <th className="py-2 pr-4">Total</th>
//               <th className="py-2 pr-4">Created</th>
//               <th className="py-2 pr-4"></th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map(o => (
//               <tr key={o.id} className="border-b border-gray-800">
//                 <td className="py-2 pr-4">{o.customerRef}</td>
//                 <td className="py-2 pr-4">{o.status}</td>
//                 <td className="py-2 pr-4">{formatNGN(Number(o.total))}</td>
//                 <td className="py-2 pr-4">{new Date(o.createdAt).toLocaleString()}</td>
//                 <td className="py-2 pr-4">
//                   <Link href={`/portal/orders/${o.id}`} className="text-emerald-400 underline">View</Link>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </section>
//   );
// }

