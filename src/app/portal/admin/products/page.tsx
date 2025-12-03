// src/app/portal/admin/products/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@lib/db";

// Delete server action (soft delete using isActive)
async function deleteProduct(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  // 👇 SOFT DELETE: mark as inactive instead of removing the row
  await prisma.product.update({
    where: { id },
    data: {
      isActive: false,
    },
  });

  redirect("/portal/admin/products");
}

export const metadata = {
  title: "Products · Admin · FLEX FOAM",
};

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    // 👇 Only show active products in the admin list
    where: {
      isActive: true,
    },
    orderBy: { sku: "asc" },
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Products</h1>
          <p className="text-sm text-gray-400">
            Admin-only view of all foam SKUs for FLEX FOAM.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/portal/admin/products/new"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            + New Product
          </Link>
          <Link
            href="/portal/admin"
            className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-gray-100 hover:bg-gray-900"
          >
            ← Back to Admin
          </Link>
        </div>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-black">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-900">
            <tr className="text-left">
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Density</th>
              <th className="px-4 py-3">Dimensions</th>
              <th className="px-4 py-3 text-right">Price (₦)</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-t border-gray-800 hover:bg-gray-900/60"
              >
                <td className="px-4 py-3 font-mono text-xs sm:text-sm">
                  {p.sku}
                </td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{p.density}</td>
                <td className="px-4 py-3">{p.dimensions}</td>
                <td className="px-4 py-3 text-right">
                  {Number(p.price).toLocaleString("en-NG")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/portal/admin/products/${p.id}/edit`}
                      className="rounded-xl border border-gray-600 px-3 py-1 text-xs text-gray-100 hover:bg-gray-800"
                    >
                      Edit
                    </Link>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className="rounded-xl border border-red-500 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-sm text-gray-400"
                >
                  No products yet. Create one with “New Product”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Link
        href="/"
        className="inline-flex text-sm text-gray-300 underline-offset-4 hover:underline"
      >
        ← Back to Home
      </Link>
    </main>
  );
}

