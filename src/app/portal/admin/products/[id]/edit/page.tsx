// src/app/portal/admin/products/[id]/edit/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@lib/db";

// Server Action: update product
async function updateProduct(id: string, formData: FormData) {
  "use server";

  const sku = String(formData.get("sku") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const density = String(formData.get("density") || "").trim();
  const dimensions = String(formData.get("dimensions") || "").trim();
  const rawPrice = String(formData.get("price") || "").trim();

  if (!sku || !name || !rawPrice) {
    return;
  }

  const priceClean = rawPrice.replace(/,/g, "");
  const priceBigInt = BigInt(priceClean || "0");

  await prisma.product.update({
    where: { id },
    data: {
      sku,
      name,
      density,
      dimensions,
      price: priceBigInt,
    },
  });

  redirect("/portal/admin/products");
}

export const metadata = {
  title: "Edit Product · Admin · FLEX FOAM",
};

type PageProps = {
  params: { id: string };
};

export default async function EditProductPage({ params }: PageProps) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    redirect("/portal/admin/products");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold">Edit Product</h1>
        <Link
          href="/portal/admin/products"
          className="rounded-xl border border-gray-700 px-3 py-2 text-sm text-gray-100 hover:bg-gray-900"
        >
          ← Back to Products
        </Link>
      </header>

      <form
        className="space-y-4"
        action={updateProduct.bind(null, product.id)}
      >
        <div className="grid gap-1 text-sm">
          <label htmlFor="sku">SKU</label>
          <input
            id="sku"
            name="sku"
            defaultValue={product.sku}
            required
            className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid gap-1 text-sm">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            defaultValue={product.name}
            required
            className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid gap-1 text-sm">
          <label htmlFor="density">Density</label>
          <input
            id="density"
            name="density"
            defaultValue={product.density ?? ""}
            className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid gap-1 text-sm">
          <label htmlFor="dimensions">Dimensions</label>
          <input
            id="dimensions"
            name="dimensions"
            defaultValue={product.dimensions ?? ""}
            className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid gap-1 text-sm">
          <label htmlFor="price">Price (₦)</label>
          <input
            id="price"
            name="price"
            defaultValue={String(product.price)}
            required
            inputMode="decimal"
            className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Save Changes
          </button>
          <Link
            href="/portal/admin/products"
            className="inline-flex items-center justify-center rounded-xl border border-gray-700 px-4 py-2 text-sm text-gray-100 hover:bg-gray-900"
          >
            Cancel
          </Link>
        </div>
      </form>

      <Link
        href="/"
        className="inline-flex text-sm text-gray-300 underline-offset-4 hover:underline"
      >
        ← Back to Home
      </Link>
    </main>
  );
}


// // src/app/portal/admin/products/[id]/edit/page.tsx
// import Link from "next/link";
// import { redirect } from "next/navigation";
// import { prisma } from "@lib/db";

// // Server Action: update product
// async function updateProduct(id: string, formData: FormData) {
//   "use server";

//   const sku = String(formData.get("sku") || "").trim();
//   const name = String(formData.get("name") || "").trim();
//   const density = String(formData.get("density") || "").trim();
//   const dimensions = String(formData.get("dimensions") || "").trim();
//   const rawPrice = String(formData.get("price") || "").trim();

//   if (!sku || !name || !rawPrice) {
//     return;
//   }

//   const price = rawPrice.replace(/,/g, "");

//   await prisma.product.update({
//     where: { id },
//     data: {
//       sku,
//       name,
//       density,
//       dimensions,
//       price: Number(price),
//     },
//   });

//   redirect("/portal/admin/products");
// }

// export const metadata = {
//   title: "Edit Product · Admin · FLEX FOAM",
// };

// type PageProps = {
//   params: { id: string };
// };

// export default async function EditProductPage({ params }: PageProps) {
//   const product = await prisma.product.findUnique({
//     where: { id: params.id },
//   });

//   if (!product) {
//     redirect("/portal/admin/products");
//   }

//   return (
//     <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
//       <header className="flex items-center justify-between gap-3">
//         <h1 className="text-2xl sm:text-3xl font-bold">Edit Product</h1>
//         <Link
//           href="/portal/admin/products"
//           className="rounded-xl border border-gray-700 px-3 py-2 text-sm text-gray-100 hover:bg-gray-900"
//         >
//           ← Back to Products
//         </Link>
//       </header>

//       <form
//         className="space-y-4"
//         action={updateProduct.bind(null, product.id)}
//       >
//         <div className="grid gap-1 text-sm">
//           <label htmlFor="sku">SKU</label>
//           <input
//             id="sku"
//             name="sku"
//             defaultValue={product.sku}
//             required
//             className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         <div className="grid gap-1 text-sm">
//           <label htmlFor="name">Name</label>
//           <input
//             id="name"
//             name="name"
//             defaultValue={product.name}
//             required
//             className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         <div className="grid gap-1 text-sm">
//           <label htmlFor="density">Density</label>
//           <input
//             id="density"
//             name="density"
//             defaultValue={product.density ?? ""}
//             className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         <div className="grid gap-1 text-sm">
//           <label htmlFor="dimensions">Dimensions</label>
//           <input
//             id="dimensions"
//             name="dimensions"
//             defaultValue={product.dimensions ?? ""}
//             className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         <div className="grid gap-1 text-sm">
//           <label htmlFor="price">Price (₦)</label>
//           <input
//             id="price"
//             name="price"
//             defaultValue={String(product.price)}
//             required
//             inputMode="decimal"
//             className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         <div className="flex gap-3 pt-2">
//           <button
//             type="submit"
//             className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
//           >
//             Save Changes
//           </button>
//           <Link
//             href="/portal/admin/products"
//             className="inline-flex items-center justify-center rounded-xl border border-gray-700 px-4 py-2 text-sm text-gray-100 hover:bg-gray-900"
//           >
//             Cancel
//           </Link>
//         </div>
//       </form>

//       <Link
//         href="/"
//         className="inline-flex text-sm text-gray-300 underline-offset-4 hover:underline"
//       >
//         ← Back to Home
//       </Link>
//     </main>
//   );
// }
