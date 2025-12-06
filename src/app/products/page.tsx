// src/app/products/page.tsx
import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import AddToCartButton from "@components/products/AddToCartButton";

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

                  {/* Use the same cart logic as the portal (POST /api/cart) */}
                  <AddToCartButton
                    productId={product.id}
                    className="rounded-full border border-yellow-400 px-3 py-1 text-xs font-semibold text-yellow-300 hover:bg-yellow-400 hover:text-black transition disabled:opacity-60 disabled:cursor-not-allowed"
                    label="Add to cart"
                  />
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
// import Link from "next/link";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// // Simple NGN formatter, local to this file
// function formatNGN(amount: number) {
//   return new Intl.NumberFormat("en-NG", {
//     style: "currency",
//     currency: "NGN",
//     maximumFractionDigits: 0,
//   }).format(amount);
// }

// export const dynamic = "force-dynamic";

// export default async function ProductsPage() {
//   // Real DB call – this keeps your original behaviour
//   const products = await prisma.product.findMany({
//     orderBy: { createdAt: "desc" },
//   });

//   return (
//     <main className="min-h-screen bg-black text-white">
//       <section className="max-w-6xl mx-auto px-4 py-10">
//         <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <div>
//             <h1 className="text-3xl font-bold">Products</h1>
//             <p className="mt-1 text-sm text-neutral-300">
//               Browse FLEX FOAM wholesale SKUs. You can add items to cart here
//               and complete checkout in the portal.
//             </p>
//           </div>

//           <Link
//             href="/portal/cart"
//             className="inline-flex items-center justify-center rounded-full border border-yellow-400 px-4 py-2 text-sm font-semibold text-yellow-300 hover:bg-yellow-400 hover:text-black transition"
//           >
//             View cart / Place order →
//           </Link>
//         </header>

//         {products.length === 0 ? (
//           <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
//             No products available yet. Please check back soon or contact the
//             factory for details.
//           </div>
//         ) : (
//           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//             {products.map((product) => (
//               <article
//                 key={product.id}
//                 className="flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/60 shadow-lg shadow-black/40 p-4"
//               >
//                 <h2 className="text-base font-semibold">{product.name}</h2>

//                 {product.sku && (
//                   <p className="mt-1 text-xs text-neutral-400">
//                     SKU: {product.sku}
//                   </p>
//                 )}
//                 {product.density && (
//                   <p className="mt-1 text-xs text-neutral-400">
//                     Density: {product.density}
//                   </p>
//                 )}
//                 {product.dimensions && (
//                   <p className="mt-1 text-xs text-neutral-400">
//                     Dimensions: {product.dimensions}
//                   </p>
//                 )}

//                 <div className="mt-3 flex items-center justify-between text-sm">
//                   <span className="font-semibold text-yellow-300">
//                     {formatNGN(Number(product.price))}
//                   </span>

//                   {/* Same behaviour as before: adds product to cart via query param */}
//                   <Link
//                     href={`/portal/cart?add=${product.id}`}
//                     className="rounded-full border border-yellow-400 px-3 py-1 text-xs font-semibold text-yellow-300 hover:bg-yellow-400 hover:text-black transition"
//                   >
//                     Add to cart
//                   </Link>
//                 </div>
//               </article>
//             ))}
//           </div>
//         )}
//       </section>
//     </main>
//   );
// }

