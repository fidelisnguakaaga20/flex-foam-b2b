// src/app/portal/admin/products/new/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@lib/db";

// /// Server Action: create product then redirect
async function createProduct(formData: FormData) {
  "use server";

  const sku = String(formData.get("sku") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const density = String(formData.get("density") || "").trim();
  const dimensions = String(formData.get("dimensions") || "").trim();
  const rawPrice = String(formData.get("price") || "").trim();

  if (!sku || !name || !rawPrice) {
    // minimal validation – stay on page for now
    return;
  }

  // Strip commas for safety ("1,000,000" -> "1000000")
  const price = rawPrice.replace(/,/g, "");

  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    throw new Error("No tenant found — seed data missing.");
  }

  await prisma.product.create({
    data: {
      tenantId: tenant.id,
      sku,
      name,
      density,
      dimensions,
      // Prisma Decimal/Int can accept a numeric string
      price: Number(price),
    },
  });

  // After save, go back to list
  redirect("/portal/admin/products");
}

export const metadata = {
  title: "New Product · Admin · FLEX FOAM",
};

export default function NewProductPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold">New Product</h1>
        <Link
          href="/portal/admin/products"
          className="rounded-xl border border-gray-700 px-3 py-2 text-sm text-gray-100 hover:bg-gray-900"
        >
          ← Back to Products
        </Link>
      </header>

      <form className="space-y-4" action={createProduct}>
        <div className="grid gap-1 text-sm">
          <label htmlFor="sku">SKU</label>
          <input
            id="sku"
            name="sku"
            required
            className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid gap-1 text-sm">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            required
            className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid gap-1 text-sm">
          <label htmlFor="density">Density</label>
          <input
            id="density"
            name="density"
            className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid gap-1 text-sm">
          <label htmlFor="dimensions">Dimensions</label>
          <input
            id="dimensions"
            name="dimensions"
            className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid gap-1 text-sm">
          <label htmlFor="price">Price (₦)</label>
          <input
            id="price"
            name="price"
            required
            inputMode="decimal"
            className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1250000"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Save Product
          </button>
          <Link
            href="/portal/admin/products"
            className="inline-flex items-center justify-center rounded-xl border border-gray-700 px-4 py-2 text-sm text-gray-100 hover:bg-gray-900"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}

