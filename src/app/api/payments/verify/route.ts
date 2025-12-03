// src/app/api/payments/verify/route.ts
// Verify Paystack transaction, mark Payment SUCCESS/FAILED, update Order status.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { assertPaystackEnv, PAYSTACK_SECRET_KEY } from "@lib/env";

export async function GET(req: NextRequest) {
  try {
    assertPaystackEnv();

    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference") ?? "";
    if (!reference) {
      return NextResponse.json({ error: "BAD_REQUEST", message: "reference required" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({ where: { ref: reference } });
    if (!payment) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    const vr = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      cache: "no-store",
    });
    const data = await vr.json().catch(() => ({}));
    if (!vr.ok || !data?.status) {
      return NextResponse.json(
        { error: "PS_VERIFY_FAILED", message: data?.message || "Paystack verify failed." },
        { status: 502 }
      );
    }

    const status: string = data.data.status; // "success" | "failed" | "abandoned"
    const amount: number = data.data.amount ?? 0; // kobo

    if (status === "success" && amount === Number(payment.amount)) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "SUCCESS" } });
      await prisma.order.update({ where: { id: payment.orderId }, data: { status: "PAID" } });
      return NextResponse.json({ ok: true, orderId: payment.orderId });
    } else {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
      return NextResponse.json({ error: "NOT_SUCCESS", message: `Payment status: ${status}` }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: "VERIFY_ERROR", message: e?.message ?? "Verify error" }, { status: 500 });
  }
}

