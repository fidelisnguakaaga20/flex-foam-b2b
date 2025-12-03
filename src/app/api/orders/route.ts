// src/app/api/orders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { finalizeCartToOrder } from "@lib/orders";

const serialize = (o: any) => ({
  ...o,
  total: Number(o.total),
  createdAt: o.createdAt.toISOString(),
});

export async function GET() {
  const rows = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      customerRef: true,
      status: true,
      total: true,
      createdAt: true,
    },
  });

  return NextResponse.json(rows.map(serialize));
}

export async function POST() {
  try {
    const order = await finalizeCartToOrder();
    return NextResponse.json(serialize(order), { status: 201 });
  } catch (e: any) {
    if (String(e?.message) === "NO_ACTIVE_CART") {
      return NextResponse.json(
        { error: "NO_ACTIVE_CART", message: "Add items to cart first." },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "PLACE_FAILED" }, { status: 500 });
  }
}

