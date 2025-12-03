// src/app/api/payments/paystack/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@lib/db";
import { PAYSTACK_SECRET_KEY } from "@lib/env";
import { sendPaymentSuccessEmail } from "@lib/notifications";

function isValidSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const computedHex = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY).update(rawBody).digest("hex");
  if (signature.length !== computedHex.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(computedHex, "hex"));
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("x-paystack-signature");
  if (!isValidSignature(raw, sig)) return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 401 });

  const evt = JSON.parse(raw) as any;
  const eventName: string = evt?.event ?? "unknown";
  const reference: string = evt?.data?.reference ?? "";
  const amount: number = typeof evt?.data?.amount === "number" ? evt.data.amount : 0;

  const eventId = crypto.createHash("sha256").update(raw).digest("hex");
  const existing = await prisma.webhookEvent.findFirst({
    where: { provider: "paystack", eventId },
    select: { id: true },
  });
  if (existing) return NextResponse.json({ ok: true, replay: true });
  await prisma.webhookEvent.create({ data: { provider: "paystack", eventId } });

  if (eventName === "charge.success") {
    if (!reference) return NextResponse.json({ error: "BAD_EVENT" }, { status: 400 });
    const payment = await prisma.payment.findUnique({ where: { ref: reference } });
    if (!payment) {
      await prisma.auditLog.create({
        data: { actor: "paystack", action: "unknown_payment_ref", meta: JSON.stringify({ reference }) },
      });
      return NextResponse.json({ ok: true, unknownRef: true });
    }

    if (Number(payment.amount) === amount) {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({ where: { id: payment.id }, data: { status: "SUCCESS" } });
        await tx.order.update({ where: { id: payment.orderId }, data: { status: "PAID" } });
        await tx.auditLog.create({
          data: { actor: "paystack", action: "charge.success", meta: JSON.stringify({ reference, amount }) },
        });
      });

      // 🔔 Send email (to a placeholder address since we don't capture dealer email yet)
      // In TEST we send to a dev inbox or stream transport preview.
      const to = "dealer@example.com";
      try {
        await sendPaymentSuccessEmail(payment.orderId, to);
      } catch (e) {
        await prisma.auditLog.create({
          data: { actor: "system", action: "email_error", meta: JSON.stringify({ orderId: payment.orderId }) },
        });
      }
    } else {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
      await prisma.auditLog.create({
        data: {
          actor: "paystack",
          action: "amount_mismatch",
          meta: JSON.stringify({ reference, amount, expected: Number(payment.amount) }),
        },
      });
    }
  } else {
    await prisma.auditLog.create({
      data: { actor: "paystack", action: eventName, meta: JSON.stringify(evt?.data ?? {}) },
    });
  }

  return NextResponse.json({ ok: true });
}


