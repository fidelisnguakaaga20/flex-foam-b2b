// src/app/api/orders/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@lib/db";

const serialize = (o: any) => ({
  ...o,
  total: Number(o.total),
  createdAt: o.createdAt.toISOString(),
  items: o.items?.map((it: any) => ({
    ...it,
    unitPrice: Number(it.unitPrice),
    product: it.product ? { ...it.product, price: Number(it.product.price) } : null,
  })),
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const o = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true } } },
  });
  if (!o) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json(serialize(o));
}

