// src/app/products/page.tsx
import Link from "next/link";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Simple NGN formatter, local to this file
function formatNGN(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  // Real DB call – this keeps your original behaviour
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="max-w-6xl mx-auto px-4 py-10">
        <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="mt-1 text-sm text-neutral-300">
              Browse FLEX FOAM wholesale SKUs. You can add items to cart here
              and complete checkout in the portal.
            </p>
          </div>

          <Link
            href="/portal/cart"
            className="inline-flex items-center justify-center rounded-full border border-yellow-400 px-4 py-2 text-sm font-semibold text-yellow-300 hover:bg-yellow-400 hover:text-black transition"
          >
            View cart / Place order →
          </Link>
        </header>

        {products.length === 0 ? (
          <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
            No products available yet. Please check back soon or contact the
            factory for details.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/60 shadow-lg shadow-black/40 p-4"
              >
                <h2 className="text-base font-semibold">{product.name}</h2>

                {product.sku && (
                  <p className="mt-1 text-xs text-neutral-400">
                    SKU: {product.sku}
                  </p>
                )}
                {product.density && (
                  <p className="mt-1 text-xs text-neutral-400">
                    Density: {product.density}
                  </p>
                )}
                {product.dimensions && (
                  <p className="mt-1 text-xs text-neutral-400">
                    Dimensions: {product.dimensions}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-semibold text-yellow-300">
                    {formatNGN(Number(product.price))}
                  </span>

                  {/* Same behaviour as before: adds product to cart via query param */}
                  <Link
                    href={`/portal/cart?add=${product.id}`}
                    className="rounded-full border border-yellow-400 px-3 py-1 text-xs font-semibold text-yellow-300 hover:bg-yellow-400 hover:text-black transition"
                  >
                    Add to cart
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}


// // src/app/products/page.tsx
// import React from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { prisma } from "@lib/db";
// import AddToCartButton from "@components/products/AddToCartButton";

// export const dynamic = "force-dynamic";

// export default async function PublicProductsPage() {
//   const products = await prisma.product.findMany({
//     orderBy: { sku: "asc" },
//   });

//   return (
//     <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
//       <header className="flex items-center justify-between gap-3">
//         <div>
//           <h1 className="text-2xl font-bold">Products</h1>
//           <p className="mt-1 text-sm text-slate-400">
//             Browse FLEX FOAM wholesale SKUs. You can add items to cart here and
//             complete checkout in the portal.
//           </p>
//         </div>

//         <Link
//           href="/portal/cart"
//           className="inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 transition"
//         >
//           View cart / Place order →
//         </Link>
//       </header>

//       {/* STAGE 14: catalog hero, same PNG */}
//       <div className="rounded-xl border border-slate-800 overflow-hidden">
//         <div className="relative w-full aspect-[16/5] bg-slate-950">
//           <Image
//             src="/images/flex-foam/flex-foam-hero.png"
//             alt="FLEX FOAM catalog hero with stacked foam blocks (CGI/Render)."
//             fill
//             className="object-cover"
//           />
//           <span className="absolute bottom-2 right-3 text-[10px] bg-black/70 px-2 py-1 rounded">
//             CGI/Render
//           </span>
//         </div>
//       </div>

//       <div className="overflow-x-auto rounded-xl border border-slate-800">
//         <table className="min-w-full text-sm">
//           <thead className="bg-slate-900">
//             <tr>
//               <th className="px-4 py-3 text-left font-semibold">SKU</th>
//               <th className="px-4 py-3 text-left font-semibold">Name</th>
//               <th className="px-4 py-3 text-left font-semibold">Density</th>
//               <th className="px-4 py-3 text-left font-semibold">Dimensions</th>
//               <th className="px-4 py-3 text-right font-semibold">Price (₦)</th>
//               <th className="px-4 py-3 text-right font-semibold">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {products.map((p) => (
//               <tr
//                 key={p.id}
//                 className="border-t border-slate-800 hover:bg-slate-900/40"
//               >
//                 <td className="px-4 py-3 font-mono">{p.sku}</td>
//                 <td className="px-4 py-3">{p.name}</td>
//                 <td className="px-4 py-3">{p.density}</td>
//                 <td className="px-4 py-3">{p.dimensions}</td>
//                 <td className="px-4 py-3 text-right">
//                   {Number(p.price).toLocaleString("en-NG", {
//                     minimumFractionDigits: 2,
//                   })}
//                 </td>
//                 <td className="px-4 py-3 text-right">
//                   <AddToCartButton productId={p.id} />
//                 </td>
//               </tr>
//             ))}

//             {products.length === 0 && (
//               <tr>
//                 <td
//                   className="px-4 py-6 text-center text-slate-400"
//                   colSpan={6}
//                 >
//                   No products found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </main>
//   );
// }

