// src/app/portal/admin/products/[id]/edit/ui.tsx
import React from "react";
import { prisma } from "@lib/db";
import EditForm from "./ui/EditForm";

type Props = {
  params: { id: string };
};

export default async function EditProductUI({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    return (
      <section className="max-w-xl">
        <h1 className="text-2xl font-bold mb-2">Product not found</h1>
        <a
          href="/portal/admin/products"
          className="inline-block mt-2 px-4 py-2 rounded-xl border"
        >
          Back to Products
        </a>
      </section>
    );
  }

  // Assume product.price is stored in naira (Decimal/number)
  const priceNaira = Number(product.price);

  return (
    <EditForm
      product={{
        id: product.id,
        sku: product.sku,
        name: product.name,
        density: product.density ?? "",
        dimensions: product.dimensions ?? "",
        priceNaira,
      }}
    />
  );
}

