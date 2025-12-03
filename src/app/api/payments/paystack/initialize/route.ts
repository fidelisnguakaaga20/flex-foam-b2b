// src/app/api/payments/paystack/initialize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { APP_BASE_URL, assertPaystackEnv, PAYSTACK_SECRET_KEY } from "@lib/env";

export async function POST(req: NextRequest) {
  try {
    assertPaystackEnv();

    const { orderId } = (await req.json().catch(() => ({}))) as { orderId?: string };
    if (!orderId) {
      return NextResponse.json({ error: "BAD_REQUEST", message: "orderId required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });
    if (!order) {
      return NextResponse.json({ error: "NOT_FOUND", message: "Order not found (wrong orderId)." }, { status: 404 });
    }
    if (order.status !== "CREATED") {
      return NextResponse.json({ error: "BAD_STATE", message: "Order not payable." }, { status: 400 });
    }
    if (Number(order.total) <= 0) {
      return NextResponse.json({ error: "BAD_TOTAL", message: "Order total must be > 0." }, { status: 400 });
    }

    const ref = order.payment?.ref ?? `PSK-${order.id.slice(0, 8)}-${Date.now()}`;

    await prisma.payment.upsert({
      where: { orderId: order.id },
      update: { provider: "paystack", ref, amount: order.total, status: "INITIATED" },
      create: { orderId: order.id, provider: "paystack", ref, amount: order.total, status: "INITIATED" },
    });

    const callback = `${APP_BASE_URL}/portal/checkout?orderId=${encodeURIComponent(order.id)}`;
    const initPayload = {
      email: "buyer@example.com",
      amount: Number(order.total),
      currency: "NGN",
      reference: ref,
      callback_url: callback,
      metadata: { orderId: order.id, tenantId: order.tenantId, appMode: "TEST" },
    };

    const ps = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(initPayload),
    });

    const data = await ps.json().catch(() => ({}));
    if (!ps.ok || !data?.status) {
      return NextResponse.json(
        { error: "PS_INIT_FAILED", message: data?.message || "Paystack initialize failed.", debug: data },
        { status: 502 }
      );
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
    });
  } catch (e: any) {
    return NextResponse.json({ error: "INIT_ERROR", message: e?.message ?? "Init error" }, { status: 500 });
  }
}

