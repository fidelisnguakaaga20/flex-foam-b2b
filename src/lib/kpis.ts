// src/lib/kpis.ts
import { prisma } from "@lib/db";
import type { Prisma } from "@prisma/client";

export type RangeKey = "7d" | "30d" | "90d" | "all";

function rangeToSince(range: RangeKey): Date | undefined {
  if (range === "all") return undefined;
  const now = new Date();
  const d = new Date(now);
  if (range === "7d") d.setDate(d.getDate() - 7);
  if (range === "30d") d.setDate(d.getDate() - 30);
  if (range === "90d") d.setDate(d.getDate() - 90);
  return d;
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function startOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function getKpis(range: RangeKey) {
  const since = rangeToSince(range);

  // ---------- Orders (for the selected range) ----------
  const ordersWhere: Prisma.OrderWhereInput = since
    ? { createdAt: { gte: since } }
    : {};

  const totalOrders = await prisma.order.count({ where: ordersWhere });

  const ordersByStatus = await prisma.order.groupBy({
    by: ["status"],
    _count: { _all: true },
    where: ordersWhere,
  });

  // ---------- Payments / Revenue ----------
  // Total revenue (range)
  const paidWhere: Prisma.PaymentWhereInput = {
    status: "SUCCESS", // literal matches PaymentStatus union
    ...(since ? { createdAt: { gte: since } } : {}),
  };

  const paidAgg = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: paidWhere,
  });
  const totalRevenue = BigInt(paidAgg._sum.amount ?? 0n);

  // Revenue today
  const todayStart = startOfToday();
  const todayAgg = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      status: "SUCCESS",
      createdAt: { gte: todayStart },
    },
  });
  const revenueToday = BigInt(todayAgg._sum.amount ?? 0n);

  // Revenue this month
  const monthStart = startOfMonth();
  const monthAgg = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      status: "SUCCESS",
      createdAt: { gte: monthStart },
    },
  });
  const revenueMonth = BigInt(monthAgg._sum.amount ?? 0n);

  // ---------- Recent payments (for table) ----------
  const recentPayments = await prisma.payment.findMany({
    where: { status: "SUCCESS" },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      order: {
        select: {
          id: true,
          customerRef: true,
        },
      },
    },
  });

  // ---------- Top SKUs (last 90 days) ----------
  const ninetyAgo = rangeToSince("90d")!;
  const groupedItems = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { qty: true },
    where: {
      order: {
        createdAt: { gte: ninetyAgo },
      },
    },
    orderBy: {
      _sum: { qty: "desc" },
    },
    take: 10,
  });

  const productIds = groupedItems.map((g) => g.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, sku: true, name: true },
  });

  const topSkus = groupedItems.map((g) => {
    const prod = products.find((p) => p.id === g.productId);
    return {
      sku: prod?.sku ?? "UNKNOWN",
      name: prod?.name ?? "",
      qty: Number(g._sum.qty ?? 0),
    };
  });

  return {
    totals: {
      totalOrders,
      totalRevenue: Number(totalRevenue),
      revenueToday: Number(revenueToday),
      revenueMonth: Number(revenueMonth),
    },
    ordersByStatus,
    recentPayments: recentPayments.map((p) => ({
      ...p,
      amount: Number(p.amount),
      createdAt: p.createdAt.toISOString(),
    })),
    topSkus,
  };
}

