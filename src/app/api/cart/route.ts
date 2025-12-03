// src/app/api/cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getOrCreateCart, getCartFromCookies, recalcOrderTotal } from "@lib/orders";

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

export async function GET() {
  const cart = await getCartFromCookies();
  if (!cart) return NextResponse.json({ items: [], total: 0 }, { status: 200 });
  return NextResponse.json(serialize(cart));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const productId = String(body.productId ?? "");
  const qty = Math.max(1, Math.trunc(Number(body.qty ?? 1)));
  if (!productId) return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });

  const cart = await getOrCreateCart();
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const existing = await prisma.orderItem.findFirst({ where: { orderId: cart.id, productId } });
  if (existing) {
    await prisma.orderItem.update({ where: { id: existing.id }, data: { qty: existing.qty + qty } });
  } else {
    await prisma.orderItem.create({
      data: { orderId: cart.id, productId, qty, unitPrice: product.price },
    });
  }
  await recalcOrderTotal(cart.id);

  const refreshed = await prisma.order.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  });
  return NextResponse.json(serialize(refreshed));
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const itemId = String(body.itemId ?? "");
  const qty = Math.max(1, Math.trunc(Number(body.qty ?? 1)));
  if (!itemId) return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });

  const item = await prisma.orderItem.update({ where: { id: itemId }, data: { qty } });
  await recalcOrderTotal(item.orderId);
  const cart = await prisma.order.findUnique({
    where: { id: item.orderId },
    include: { items: { include: { product: true } } },
  });
  return NextResponse.json(serialize(cart));
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const itemId = String(body.itemId ?? "");
  if (!itemId) return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });

  const item = await prisma.orderItem.delete({ where: { id: itemId } });
  await recalcOrderTotal(item.orderId);
  const cart = await prisma.order.findUnique({
    where: { id: item.orderId },
    include: { items: { include: { product: true } } },
  });
  return NextResponse.json(serialize(cart));
}


