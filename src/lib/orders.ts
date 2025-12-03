// src/lib/orders.ts
import { cookies } from "next/headers";
import { prisma } from "@lib/db";

const CART_COOKIE = "cartId";

export async function getTenantId() {
  const t = await prisma.tenant.findFirst();
  if (!t) throw new Error("No tenant found");
  return t.id;
}

export async function getOrCreateCart() {
  const jar = await cookies();
  let cartId = jar.get(CART_COOKIE)?.value || "";
  let cart = cartId
    ? await prisma.order.findUnique({ where: { id: cartId } })
    : null;

  if (!cart || cart.status !== "CREATED") {
    const tenantId = await getTenantId();
    cart = await prisma.order.create({
      data: {
        tenantId,
        customerRef: `CART-${Date.now()}`,
        status: "CREATED",
        total: 0n,
      },
    });
    jar.set(CART_COOKIE, cart.id, { httpOnly: true, sameSite: "lax", path: "/" });
  }
  return cart;
}

export async function getCartFromCookies() {
  const jar = await cookies();
  const cartId = jar.get(CART_COOKIE)?.value;
  if (!cartId) return null;
  const cart = await prisma.order.findUnique({
    where: { id: cartId },
    include: { items: { include: { product: true } } },
  });
  if (!cart || cart.status !== "CREATED") return null;
  return cart;
}

export async function recalcOrderTotal(orderId: string) {
  const items = await prisma.orderItem.findMany({ where: { orderId } });
  const total = items.reduce((sum, it) => sum + it.unitPrice * BigInt(it.qty), 0n);
  await prisma.order.update({ where: { id: orderId }, data: { total } });
  return total;
}

export async function finalizeCartToOrder() {
  const jar = await cookies();
  const cart = await getCartFromCookies();
  if (!cart || cart.items.length === 0) {
    throw new Error("NO_ACTIVE_CART");
  }
  const ref = `ORDER-${cart.id.slice(0, 6).toUpperCase()}`;
  const order = await prisma.order.update({
    where: { id: cart.id },
    data: { customerRef: ref, status: "CREATED" },
  });
  jar.delete(CART_COOKIE);
  return order;
}

