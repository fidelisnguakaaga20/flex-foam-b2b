// src/app/products/page.tsx
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@lib/db";
import AddToCartButton from "@components/products/AddToCartButton";

export const dynamic = "force-dynamic";

export default async function PublicProductsPage() {
  // same logic, but wrapped in try/catch so Prisma failure
  // doesn't crash the whole route
  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  let dbError = false;

  try {
    products = await prisma.product.findMany({
      orderBy: { sku: "asc" },
    });
  } catch (err) {
    console.error("prisma:error /products page", err);
    dbError = true;
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="mt-1 text-sm text-slate-400">
            Browse FLEX FOAM wholesale SKUs. You can add items to cart here and
            complete checkout in the portal.
          </p>
        </div>

        <Link
          href="/portal/cart"
          className="inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 transition"
        >
          View cart / Place order →
        </Link>
      </header>

      {/* If DB is down, show a soft note instead of 500 */}
      {dbError && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-xs text-amber-200">
          Products backend is temporarily unavailable. Listing is shown as
          empty, but the rest of the site is still online.
        </div>
      )}

      {/* STAGE 14: catalog hero, same PNG */}
      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <div className="relative w-full aspect-[16/5] bg-slate-950">
          <Image
            src="/images/flex-foam/flex-foam-hero.png"
            alt="FLEX FOAM catalog hero with stacked foam blocks (CGI/Render)."
            fill
            className="object-cover"
          />
          <span className="absolute bottom-2 right-3 text-[10px] bg-black/70 px-2 py-1 rounded">
            CGI/Render
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">SKU</th>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Density</th>
              <th className="px-4 py-3 text-left font-semibold">Dimensions</th>
              <th className="px-4 py-3 text-right font-semibold">Price (₦)</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-t border-slate-800 hover:bg-slate-900/40"
              >
                <td className="px-4 py-3 font-mono">{p.sku}</td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{p.density}</td>
                <td className="px-4 py-3">{p.dimensions}</td>
                <td className="px-4 py-3 text-right">
                  {Number(p.price).toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="px-4 py-3 text-right">
                  <AddToCartButton productId={p.id} />
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td
                  className="px-4 py-6 text-center text-slate-400"
                  colSpan={6}
                >
                  {dbError
                    ? "Products could not be loaded right now."
                    : "No products found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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

