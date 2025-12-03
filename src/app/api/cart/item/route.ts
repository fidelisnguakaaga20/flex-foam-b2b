// src/app/api/cart/item/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { getSession } from "@lib/auth";
import { OrderStatus } from "@prisma/client";

export async function PATCH(req: NextRequest) {
  const sess = getSession();
  if (!sess) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId, qty } = await req.json().catch(() => ({}));
  const newQty = Math.max(1, Number(qty ?? 1));
  if (!itemId) return NextResponse.json({ error: "itemId required" }, { status: 400 });

  const item = await prisma.orderItem.findUnique({ where: { id: itemId }, include: { order: true } });
  if (!item || item.order.tenantId !== sess.tenantId || item.order.customerRef !== sess.userId || item.order.status !== OrderStatus.CREATED) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.orderItem.update({ where: { id: itemId }, data: { qty: newQty } });

  const updated = await prisma.order.findUnique({ where: { id: item.orderId }, include: { items: true } });
  const total = (updated?.items ?? []).reduce((s, i) => s + i.qty * Number(i.unitPrice), 0);
  await prisma.order.update({ where: { id: item.orderId }, data: { total: BigInt(total) } });

  return NextResponse.json({ ok: true, total });
}

export async function DELETE(req: NextRequest) {
  const sess = getSession();
  if (!sess) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId") || "";
  if (!itemId) return NextResponse.json({ error: "itemId required" }, { status: 400 });

  const item = await prisma.orderItem.findUnique({ where: { id: itemId }, include: { order: true } });
  if (!item || item.order.tenantId !== sess.tenantId || item.order.customerRef !== sess.userId || item.order.status !== OrderStatus.CREATED) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.orderItem.delete({ where: { id: itemId } });

  const updated = await prisma.order.findUnique({ where: { id: item.orderId }, include: { items: true } });
  const total = (updated?.items ?? []).reduce((s, i) => s + i.qty * Number(i.unitPrice), 0);
  await prisma.order.update({ where: { id: item.orderId }, data: { total: BigInt(total) } });

  return NextResponse.json({ ok: true });
}
